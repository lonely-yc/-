package com.aipm.backend.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PersonProjectHandoverRecord {
    private Long id;
    private Long personId;
    private Long projectId;
    private Long handoverToUserId;
    private String handoverToName;
    private String handoverStatus;
    private String handoverRemark;
    private LocalDateTime handoverAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
