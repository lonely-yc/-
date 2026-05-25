package com.aipm.backend.service.impl;

import com.aipm.backend.entity.ToolDesensitizeRecord;
import com.aipm.backend.mapper.ToolDesensitizeRecordMapper;
import com.aipm.backend.service.ToolDesensitizeService;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableCell;
import org.apache.poi.xwpf.usermodel.XWPFTableRow;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class ToolDesensitizeServiceImpl implements ToolDesensitizeService {
    private static final Set<String> SUPPORTED_EXTENSIONS = Set.of("docx", "xlsx", "xls");

    private final ToolDesensitizeRecordMapper recordMapper;
    private final Path uploadRoot;
    private final DesensitizeRuleEngine ruleEngine = new DesensitizeRuleEngine();

    public ToolDesensitizeServiceImpl(
            ToolDesensitizeRecordMapper recordMapper,
            @Value("${app.upload-dir:uploads}") String uploadDir
    ) {
        this.recordMapper = recordMapper;
        this.uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    @Override
    public Map<String, Object> desensitize(MultipartFile file, String mode, String keywords) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }

        String originalName = safeOriginalName(file);
        String extension = extensionOf(originalName).toLowerCase();
        if (!SUPPORTED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("暂不支持该文件类型，请上传 docx、xlsx 或 xls 文件");
        }

        Path targetDir = uploadRoot.resolve("tools").resolve("desensitize").normalize();
        Path originalDir = targetDir.resolve("original").normalize();
        Path maskedDir = targetDir.resolve("masked").normalize();
        Files.createDirectories(originalDir);
        Files.createDirectories(maskedDir);

        Path originalPath = originalDir.resolve(UUID.randomUUID() + "." + extension).normalize();
        file.transferTo(originalPath);

        String maskedFileName = maskedName(originalName, extension);
        Path maskedPath = maskedDir.resolve(UUID.randomUUID() + "-" + maskedFileName).normalize();

        List<String> keywordList = DesensitizeRuleEngine.parseKeywords(keywords);
        ProcessResult processResult = processFile(originalPath, maskedPath, extension, keywordList);

        ToolDesensitizeRecord record = new ToolDesensitizeRecord();
        record.setOriginalFileName(originalName);
        record.setOriginalStoredPath(originalPath.toString());
        record.setMaskedFileName(maskedFileName);
        record.setMaskedStoredPath(maskedPath.toString());
        record.setMatchCount(processResult.matchCount());
        record.setRuleSummary(toRuleSummary(processResult.summary(), mode));
        recordMapper.insert(record);

        return Map.of(
                "taskId", record.getId(),
                "status", "处理完成",
                "originalFileName", originalName,
                "maskedFileName", maskedFileName,
                "matchCount", processResult.matchCount(),
                "ruleSummary", processResult.summary(),
                "downloadUrl", "/api/files/download?path=" + URLEncoder.encode(maskedPath.toString(), StandardCharsets.UTF_8),
                "createdAt", record.getCreatedAt() == null ? "" : record.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
        );
    }

    @Override
    public ToolDesensitizeRecord findById(Long id) {
        return recordMapper.findById(id);
    }

    private ProcessResult processFile(Path originalPath, Path maskedPath, String extension, List<String> keywords) throws IOException {
        if ("docx".equals(extension)) {
            return processDocx(originalPath, maskedPath, keywords);
        }
        return processWorkbook(originalPath, maskedPath, keywords);
    }

    private ProcessResult processDocx(Path originalPath, Path maskedPath, List<String> keywords) throws IOException {
        Map<String, Integer> summary = new LinkedHashMap<>();
        int[] total = {0};
        try (InputStream input = Files.newInputStream(originalPath);
             XWPFDocument document = new XWPFDocument(input)) {
            for (XWPFParagraph paragraph : document.getParagraphs()) {
                maskParagraph(paragraph, keywords, summary, total);
            }
            for (XWPFTable table : document.getTables()) {
                for (XWPFTableRow row : table.getRows()) {
                    for (XWPFTableCell cell : row.getTableCells()) {
                        for (XWPFParagraph paragraph : cell.getParagraphs()) {
                            maskParagraph(paragraph, keywords, summary, total);
                        }
                    }
                }
            }
            try (OutputStream output = Files.newOutputStream(maskedPath)) {
                document.write(output);
            }
        }
        return new ProcessResult(total[0], summary);
    }

    private void maskParagraph(XWPFParagraph paragraph, List<String> keywords, Map<String, Integer> summary, int[] total) {
        for (XWPFRun run : paragraph.getRuns()) {
            String text = run.getText(0);
            DesensitizeRuleEngine.MaskResult result = ruleEngine.mask(text, keywords);
            if (result.count() > 0) {
                run.setText(result.value(), 0);
                total[0] += result.count();
                mergeSummary(summary, result.summary());
            }
        }
    }

    private ProcessResult processWorkbook(Path originalPath, Path maskedPath, List<String> keywords) throws IOException {
        Map<String, Integer> summary = new LinkedHashMap<>();
        int total = 0;
        try (InputStream input = Files.newInputStream(originalPath);
             Workbook workbook = WorkbookFactory.create(input)) {
            for (Sheet sheet : workbook) {
                for (Row row : sheet) {
                    for (Cell cell : row) {
                        if (cell.getCellType() != CellType.STRING) {
                            continue;
                        }
                        DesensitizeRuleEngine.MaskResult result = ruleEngine.mask(cell.getStringCellValue(), keywords);
                        if (result.count() > 0) {
                            cell.setCellValue(result.value());
                            total += result.count();
                            mergeSummary(summary, result.summary());
                        }
                    }
                }
            }
            try (OutputStream output = Files.newOutputStream(maskedPath)) {
                workbook.write(output);
            }
        }
        return new ProcessResult(total, summary);
    }

    private void mergeSummary(Map<String, Integer> target, Map<String, Integer> source) {
        source.forEach((key, value) -> target.merge(key, value, Integer::sum));
    }

    private String toRuleSummary(Map<String, Integer> summary, String mode) {
        String safeMode = mode == null || mode.isBlank() ? "自动脱敏" : mode;
        if (summary.isEmpty()) {
            return safeMode + "：未发现命中项";
        }
        StringBuilder builder = new StringBuilder(safeMode).append("：");
        summary.forEach((key, value) -> builder.append(key).append(value).append("处；"));
        return builder.toString();
    }

    private String safeOriginalName(MultipartFile file) {
        String originalName = file.getOriginalFilename() == null ? "file" : file.getOriginalFilename();
        return Path.of(originalName).getFileName().toString();
    }

    private String extensionOf(String fileName) {
        int index = fileName.lastIndexOf('.');
        return index >= 0 ? fileName.substring(index + 1) : "";
    }

    private String maskedName(String originalName, String extension) {
        String baseName = originalName.substring(0, originalName.length() - extension.length() - 1);
        return baseName + "_脱敏版." + extension;
    }

    private record ProcessResult(int matchCount, Map<String, Integer> summary) {
    }
}
