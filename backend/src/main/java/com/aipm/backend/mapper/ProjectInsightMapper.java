package com.aipm.backend.mapper;

import com.aipm.backend.entity.ProjectInsightRecord;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ProjectInsightMapper {
    ProjectInsightRecord findByProjectId(Long projectId);

    int insert(ProjectInsightRecord record);

    int update(ProjectInsightRecord record);

    int deleteByProjectId(Long projectId);
}
