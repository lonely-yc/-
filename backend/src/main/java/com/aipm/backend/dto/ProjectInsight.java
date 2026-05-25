package com.aipm.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectInsight {
    private Long projectId;
    private String fieldDirectory;
    private List<RepositoryLink> repositories = new ArrayList<>();
    private List<ProjectDocument> documents = new ArrayList<>();
    private List<ChangeRecord> changes = new ArrayList<>();
    private List<DeliveryRecord> deliveries = new ArrayList<>();
    private List<MiddlewareConfig> middlewares = new ArrayList<>();
    private List<TimelineEvent> timeline = new ArrayList<>();
    private List<ProjectNote> notes = new ArrayList<>();

    public static ProjectInsight empty(Long projectId) {
        ProjectInsight insight = new ProjectInsight();
        insight.setProjectId(projectId);
        insight.setFieldDirectory("");
        return insight;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RepositoryLink {
        private String id;
        private String name;
        private String branch;
        private String url;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectDocument {
        private String id;
        private String name;
        private String directory;
        private String fileName;
        private String size;
        private String updatedAt;
        private String content;
        private String storedPath;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChangeRecord {
        private String id;
        private String date;
        private String requester;
        private String summary;
        private String backend;
        private String frontend;
        private String reason;
        private String content;
        private String status;
        private List<String> relatedDeliveryIds = new ArrayList<>();
        private String recordedAt;

        public ChangeRecord(String id, String date, String requester, String summary, String backend, String frontend) {
            this.id = id;
            this.date = date;
            this.requester = requester;
            this.summary = summary;
            this.backend = backend;
            this.frontend = frontend;
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeliveryRecord {
        private String id;
        private String date;
        private String version;
        private String reason;
        private String packageName;
        private String scope;
        private String operator;
        private String environment;
        private String solvedIssues;
        private List<String> relatedRequirementIds = new ArrayList<>();
        private String rollbackPlan;
        private String recordedAt;

        public DeliveryRecord(String id, String date, String version, String reason, String packageName, String scope) {
            this.id = id;
            this.date = date;
            this.version = version;
            this.reason = reason;
            this.packageName = packageName;
            this.scope = scope;
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MiddlewareConfig {
        private String id;
        private String environment;
        private String name;
        private String host;
        private String port;
        private String configPath;
        private String configFileName;
        private String configStoredPath;
        private String remark;
        private String content;
        private String recordedAt;

        public MiddlewareConfig(String id, String environment, String name, String host, String port, String configPath, String configFileName, String configStoredPath, String remark, String content) {
            this.id = id;
            this.environment = environment;
            this.name = name;
            this.host = host;
            this.port = port;
            this.configPath = configPath;
            this.configFileName = configFileName;
            this.configStoredPath = configStoredPath;
            this.remark = remark;
            this.content = content;
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimelineEvent {
        private String id;
        private String date;
        private String title;
        private String actor;
        private String detail;
        private String type;
        private String sourceType;
        private String sourceId;
        private String recordedAt;
        private String reason;
        private String backendChanges;
        private String frontendChanges;
        private String middlewareChanges;
        private List<String> attachments = new ArrayList<>();
        private String status;

        public TimelineEvent(String id, String date, String title, String actor, String detail, String type) {
            this.id = id;
            this.date = date;
            this.title = title;
            this.actor = actor;
            this.detail = detail;
            this.type = type;
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectNote {
        private String id;
        private String type;
        private String title;
        private String occurredAt;
        private String contact;
        private String contactPhone;
        private String address;
        private String applyMethod;
        private String documentName;
        private String documentUrl;
        private String content;
        private String status;
        private String recordedAt;
    }
}
