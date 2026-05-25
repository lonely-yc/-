package com.aipm.backend.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProjectMember {
    private Long id;
    private Long projectId;
    private Long userId;
    private String role;
    private String employeeNo;
    private String realName;
    private String phone;
    private LocalDateTime joinedAt;
}
