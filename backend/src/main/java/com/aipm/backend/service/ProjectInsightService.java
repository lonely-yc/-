package com.aipm.backend.service;

import com.aipm.backend.dto.ProjectInsight;

public interface ProjectInsightService {
    ProjectInsight getByProjectId(Long projectId);

    ProjectInsight save(Long projectId, ProjectInsight insight);

    int deleteByProjectId(Long projectId);
}
