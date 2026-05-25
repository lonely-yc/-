package com.aipm.backend.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class OperationLog {
    private Long id;
    private Long projectId;
    private String projectName;
    private String operator;
    private String actionType;
    private String actionTitle;
    private String content;
    private LocalDateTime createdAt;
}
