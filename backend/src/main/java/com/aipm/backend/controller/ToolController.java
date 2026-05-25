package com.aipm.backend.controller;

import com.aipm.backend.entity.ToolDesensitizeRecord;
import com.aipm.backend.service.ToolDesensitizeService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/tools")
public class ToolController {
    private final ToolDesensitizeService desensitizeService;

    public ToolController(ToolDesensitizeService desensitizeService) {
        this.desensitizeService = desensitizeService;
    }

    @PostMapping("/desensitize")
    public Map<String, Object> desensitize(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "mode", required = false) String mode,
            @RequestParam(value = "keywords", required = false) String keywords
    ) throws IOException {
        try {
            return ApiResponse.ok("处理完成", desensitizeService.desensitize(file, mode, keywords));
        } catch (IllegalArgumentException exception) {
            return ApiResponse.error(400, exception.getMessage());
        }
    }

    @GetMapping("/desensitize/{taskId}")
    public Map<String, Object> desensitizeResult(@PathVariable Long taskId) {
        ToolDesensitizeRecord record = desensitizeService.findById(taskId);
        if (record == null) {
            return ApiResponse.error(404, "未找到脱敏任务");
        }
        return ApiResponse.ok(Map.of(
                "taskId", record.getId(),
                "status", "处理完成",
                "originalFileName", record.getOriginalFileName(),
                "maskedFileName", record.getMaskedFileName(),
                "matchCount", record.getMatchCount(),
                "ruleSummary", record.getRuleSummary(),
                "downloadUrl", "/api/files/download?path=" + URLEncoder.encode(record.getMaskedStoredPath(), StandardCharsets.UTF_8),
                "createdAt", record.getCreatedAt() == null ? "" : record.getCreatedAt().toString()
        ));
    }
}
