package com.aipm.backend.controller;

import com.aipm.backend.entity.PersonHandoverDocument;
import com.aipm.backend.entity.PersonProjectHandoverRecord;
import com.aipm.backend.service.PersonHandoverService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/people")
public class PersonHandoverController {
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "txt", "md", "xls", "xlsx", "doc", "docx", "zip", "pdf", "csv",
            "json", "yml", "yaml", "conf", "xml", "properties", "jpg", "jpeg", "png"
    );

    private final PersonHandoverService handoverService;
    private final Path uploadRoot;

    public PersonHandoverController(
            PersonHandoverService handoverService,
            @Value("${app.upload-dir:uploads}") String uploadDir
    ) {
        this.handoverService = handoverService;
        this.uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    @GetMapping("/{id}/project-handover")
    public Map<String, Object> getPersonProjectHandover(@PathVariable Long id) {
        return ApiResponse.ok(handoverService.getPersonProjectHandover(id));
    }

    @PutMapping("/{id}/projects/{projectId}/handover")
    public Map<String, Object> saveHandover(
            @PathVariable Long id,
            @PathVariable Long projectId,
            @RequestBody PersonProjectHandoverRecord record
    ) {
        return ApiResponse.ok("保存成功", handoverService.saveHandover(id, projectId, record));
    }

    @PostMapping("/{id}/projects/{projectId}/handover-documents")
    public Map<String, Object> uploadHandoverDocument(
            @PathVariable Long id,
            @PathVariable Long projectId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "documentType", required = false) String documentType,
            @RequestParam(value = "summary", required = false) String summary
    ) throws IOException {
        if (file.isEmpty()) {
            return ApiResponse.error(400, "文件不能为空");
        }

        String originalName = safeOriginalName(file);
        String extension = extensionOf(originalName);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            return ApiResponse.error(400, "不支持的文件类型");
        }

        Path targetDir = uploadRoot
                .resolve("person-handover")
                .resolve(String.valueOf(id))
                .resolve(String.valueOf(projectId))
                .normalize();
        Files.createDirectories(targetDir);

        Path target = targetDir.resolve(UUID.randomUUID() + "." + extension).normalize();
        file.transferTo(target);

        PersonHandoverDocument document = new PersonHandoverDocument();
        document.setFileName(originalName);
        document.setStoredPath(target.toString());
        document.setDocumentType(documentType == null || documentType.isBlank() ? "个人理解资料" : documentType);
        document.setSummary(summary);
        document.setUploadedAt(LocalDateTime.now());

        return ApiResponse.ok("上传成功", handoverService.addDocument(id, projectId, document));
    }

    @DeleteMapping("/{id}/projects/{projectId}/handover-documents/{documentId}")
    public Map<String, Object> deleteHandoverDocument(
            @PathVariable Long id,
            @PathVariable Long projectId,
            @PathVariable Long documentId
    ) {
        handoverService.deleteDocument(documentId);
        return ApiResponse.ok("删除成功");
    }

    private String safeOriginalName(MultipartFile file) {
        String originalName = file.getOriginalFilename() == null ? "file" : file.getOriginalFilename();
        return Path.of(originalName).getFileName().toString();
    }

    private String extensionOf(String fileName) {
        int index = fileName.lastIndexOf('.');
        return index >= 0 ? fileName.substring(index + 1) : "";
    }
}
