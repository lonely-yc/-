package com.aipm.backend.service;

import com.aipm.backend.dto.ProjectInsight;
import com.aipm.backend.entity.Project;
import com.aipm.backend.entity.ProjectMember;

import java.util.List;

public interface ProjectService {
    List<Project> findAll();
    Project findById(Long id);
    Project create(Project project);
    int update(Project project);
    int delete(Long id);
    List<ProjectMember> getMembers(Long projectId);
    int addMember(ProjectMember member);
    int saveMembers(Long projectId, List<ProjectMember> members);
    ProjectInsight getInsight(Long projectId);
    ProjectInsight saveInsight(Long projectId, ProjectInsight insight);
}
