package com.aipm.backend.service.impl;

import com.aipm.backend.dto.ProjectInsight;
import com.aipm.backend.entity.ProjectInsightRecord;
import com.aipm.backend.mapper.ProjectInsightMapper;
import com.aipm.backend.service.ProjectInsightService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProjectInsightServiceImpl implements ProjectInsightService {
    private final ProjectInsightMapper mapper;
    private final ObjectMapper objectMapper;

    public ProjectInsightServiceImpl(ProjectInsightMapper mapper, ObjectMapper objectMapper) {
        this.mapper = mapper;
        this.objectMapper = objectMapper;
    }

    @Override
    public ProjectInsight getByProjectId(Long projectId) {
        ProjectInsightRecord record = mapper.findByProjectId(projectId);
        if (record == null) {
            return ProjectInsight.empty(projectId);
        }
        return toDto(record);
    }

    @Override
    @Transactional
    public ProjectInsight save(Long projectId, ProjectInsight insight) {
        ProjectInsight normalized = normalize(projectId, insight);
        ProjectInsightRecord record = toRecord(normalized);
        if (mapper.findByProjectId(projectId) == null) {
            mapper.insert(record);
        } else {
            mapper.update(record);
        }
        return normalized;
    }

    @Override
    public int deleteByProjectId(Long projectId) {
        return mapper.deleteByProjectId(projectId);
    }

    private ProjectInsight normalize(Long projectId, ProjectInsight insight) {
        ProjectInsight normalized = insight == null ? ProjectInsight.empty(projectId) : insight;
        normalized.setProjectId(projectId);
        if (normalized.getRepositories() == null) {
            normalized.setRepositories(new ArrayList<>());
        }
        if (normalized.getDocuments() == null) {
            normalized.setDocuments(new ArrayList<>());
        }
        if (normalized.getChanges() == null) {
            normalized.setChanges(new ArrayList<>());
        }
        if (normalized.getDeliveries() == null) {
            normalized.setDeliveries(new ArrayList<>());
        }
        if (normalized.getMiddlewares() == null) {
            normalized.setMiddlewares(new ArrayList<>());
        }
        if (normalized.getTimeline() == null) {
            normalized.setTimeline(new ArrayList<>());
        }
        if (normalized.getNotes() == null) {
            normalized.setNotes(new ArrayList<>());
        }
        return normalized;
    }

    private ProjectInsight toDto(ProjectInsightRecord record) {
        ProjectInsight insight = ProjectInsight.empty(record.getProjectId());
        insight.setFieldDirectory(record.getFieldDirectory());
        insight.setRepositories(readList(record.getRepositoriesJson(), new TypeReference<List<ProjectInsight.RepositoryLink>>() {}));
        insight.setDocuments(readList(record.getDocumentsJson(), new TypeReference<List<ProjectInsight.ProjectDocument>>() {}));
        insight.setChanges(readList(record.getChangesJson(), new TypeReference<List<ProjectInsight.ChangeRecord>>() {}));
        insight.setDeliveries(readList(record.getDeliveriesJson(), new TypeReference<List<ProjectInsight.DeliveryRecord>>() {}));
        insight.setMiddlewares(readList(record.getMiddlewaresJson(), new TypeReference<List<ProjectInsight.MiddlewareConfig>>() {}));
        insight.setTimeline(readList(record.getTimelineJson(), new TypeReference<List<ProjectInsight.TimelineEvent>>() {}));
        insight.setNotes(readList(record.getNotesJson(), new TypeReference<List<ProjectInsight.ProjectNote>>() {}));
        return insight;
    }

    private ProjectInsightRecord toRecord(ProjectInsight insight) {
        ProjectInsightRecord record = new ProjectInsightRecord();
        record.setProjectId(insight.getProjectId());
        record.setFieldDirectory(insight.getFieldDirectory());
        record.setRepositoriesJson(toJson(insight.getRepositories()));
        record.setDocumentsJson(toJson(insight.getDocuments()));
        record.setChangesJson(toJson(insight.getChanges()));
        record.setDeliveriesJson(toJson(insight.getDeliveries()));
        record.setMiddlewaresJson(toJson(insight.getMiddlewares()));
        record.setTimelineJson(toJson(insight.getTimeline()));
        record.setNotesJson(toJson(insight.getNotes()));
        return record;
    }

    private String toJson(List<?> values) {
        try {
            return objectMapper.writeValueAsString(values == null ? List.of() : values);
        } catch (JsonProcessingException ex) {
            throw new IllegalArgumentException("Project insight data cannot be serialized", ex);
        }
    }

    private <T> List<T> readList(String json, TypeReference<List<T>> typeReference) {
        if (json == null || json.isBlank()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(json, typeReference);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Project insight data format is invalid", ex);
        }
    }
}
