package com.aipm.backend.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Person {
    private Long id;
    private String employeeNo;
    private String username;
    private String password;
    private String realName;
    private String phone;
    private String role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
