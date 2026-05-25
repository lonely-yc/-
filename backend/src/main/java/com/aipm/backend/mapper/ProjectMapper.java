package com.aipm.backend.mapper;

import com.aipm.backend.entity.Project;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ProjectMapper {
    List<Project> findAll();
    Project findById(Long id);
    int insert(Project project);
    int update(Project project);
    int delete(Long id);
}
