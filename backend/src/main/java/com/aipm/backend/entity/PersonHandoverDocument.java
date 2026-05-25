package com.aipm.backend.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PersonHandoverDocument {
    private Long id;
    private Long personId;
    private Long projectId;
    private String fileName;
    private String storedPath;
    private String documentType;
    private String summary;
    private LocalDateTime uploadedAt;
    private LocalDateTime createdAt;
}
