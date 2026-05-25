package com.aipm.backend.mapper;

import com.aipm.backend.entity.ProjectMember;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ProjectMemberMapper {
    List<ProjectMember> findByProjectId(Long projectId);
    List<ProjectMember> findByUserId(Long userId);
    int insert(ProjectMember member);
    int deleteByProjectId(Long projectId);
}
