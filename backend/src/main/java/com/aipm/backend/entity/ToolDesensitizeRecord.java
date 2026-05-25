package com.aipm.backend.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ToolDesensitizeRecord {
    private Long id;
    private String originalFileName;
    private String originalStoredPath;
    private String maskedFileName;
    private String maskedStoredPath;
    private Integer matchCount;
    private String ruleSummary;
    private LocalDateTime createdAt;
}
