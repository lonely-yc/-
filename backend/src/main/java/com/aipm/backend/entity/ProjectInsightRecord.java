package com.aipm.backend.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProjectInsightRecord {
    private Long projectId;
    private String fieldDirectory;
    private String repositoriesJson;
    private String documentsJson;
    private String changesJson;
    private String deliveriesJson;
    private String middlewaresJson;
    private String timelineJson;
    private String notesJson;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
