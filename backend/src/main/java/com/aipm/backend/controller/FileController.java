package com.aipm.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
public class FileController {
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "txt", "md", "xls", "xlsx", "doc", "docx", "zip", "pdf", "csv",
            "json", "yml", "yaml", "conf", "xml", "properties"
    );

    private static final Set<String> PREVIEWABLE_EXTENSIONS = Set.of(
            "txt", "md", "csv", "json", "yml", "yaml", "conf", "xml", "properties"
    );

    private final Path uploadRoot;

    public FileController(@Value("${app.upload-dir:uploads}") String uploadDir) {
        this.uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    @PostMapping("/upload")
    public Map<String, Object> upload(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ApiResponse.error(400, "文件不能为空");
        }

        String originalName = safeOriginalName(file);
        String extension = extensionOf(originalName);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            return ApiResponse.error(400, "不支持的文件类型");
        }

        Files.createDirectories(uploadRoot);
        String storedName = UUID.randomUUID() + "." + extension;
        Path target = uploadRoot.resolve(storedName).normalize();
        file.transferTo(target);

        return ApiResponse.ok(uploadResponse(originalName, extension, target, file.getSize()));
    }

    @GetMapping("/download")
    public ResponseEntity<Resource> download(@RequestParam("path") String filePath) throws IOException {
        Path target = resolveUploadedPath(filePath);
        if (target == null) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new UrlResource(target.toUri());
        ContentDisposition contentDisposition = ContentDisposition.attachment()
                .filename(target.getFileName().toString(), StandardCharsets.UTF_8)
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition.toString())
                .body(resource);
    }

    @GetMapping(value = "/preview", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> preview(@RequestParam("path") String filePath) throws IOException {
        Path target = resolveUploadedPath(filePath);
        if (target == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Files.readString(target));
    }

    private Map<String, Object> uploadResponse(String originalName, String extension, Path target, long fileSize) throws IOException {
        return Map.of(
                "id", "doc-" + System.currentTimeMillis(),
                "name", stripExtension(originalName),
                "directory", uploadRoot.toString(),
                "fileName", originalName,
                "storedPath", target.toString(),
                "size", readableSize(fileSize),
                "updatedAt", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                "content", previewContent(extension, target)
        );
    }

    private Path resolveUploadedPath(String filePath) {
        Path target = Path.of(filePath).toAbsolutePath().normalize();
        if (target.startsWith(uploadRoot) && Files.exists(target)) {
            return target;
        }

        if (filePath.contains("+")) {
            Path spaceFallback = Path.of(filePath.replace("+", " ")).toAbsolutePath().normalize();
            if (spaceFallback.startsWith(uploadRoot) && Files.exists(spaceFallback)) {
                return spaceFallback;
            }
        }

        return null;
    }

    private String safeOriginalName(MultipartFile file) {
        String originalName = file.getOriginalFilename() == null ? "file" : file.getOriginalFilename();
        return Path.of(originalName).getFileName().toString();
    }

    private String extensionOf(String fileName) {
        int index = fileName.lastIndexOf('.');
        return index >= 0 ? fileName.substring(index + 1) : "";
    }

    private String stripExtension(String fileName) {
        int index = fileName.lastIndexOf('.');
        return index >= 0 ? fileName.substring(0, index) : fileName;
    }

    private String previewContent(String extension, Path target) throws IOException {
        if (!PREVIEWABLE_EXTENSIONS.contains(extension.toLowerCase())) {
            return "";
        }
        return Files.readString(target, StandardCharsets.UTF_8);
    }

    private String readableSize(long bytes) {
        if (bytes < 1024) {
            return bytes + " B";
        }
        if (bytes < 1024 * 1024) {
            return String.format("%.1f KB", bytes / 1024.0);
        }
        return String.format("%.1f MB", bytes / 1024.0 / 1024.0);
    }
}
