package com.aipm.backend.dto;

import com.aipm.backend.entity.Person;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class PersonProjectHandover {
    private Person person;
    private List<ProjectCard> projects = new ArrayList<>();

    @Data
    public static class ProjectCard {
        private Long projectId;
        private String projectName;
        private String projectCode;
        private String customer;
        private String manager;
        private String status;
        private LocalDate startDate;
        private LocalDate endDate;
        private String role;
        private LocalDateTime joinedAt;
        private Long handoverToUserId;
        private String handoverToName;
        private String handoverStatus;
        private String handoverRemark;
        private LocalDateTime handoverAt;
        private LocalDateTime updatedAt;
        private LocalDateTime latestDocumentAt;
        private int documentCount;
        private List<HandoverDocument> documents = new ArrayList<>();
    }

    @Data
    public static class HandoverDocument {
        private Long id;
        private Long personId;
        private Long projectId;
        private String fileName;
        private String storedPath;
        private String documentType;
        private String summary;
        private LocalDateTime uploadedAt;
    }
}
