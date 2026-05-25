package com.aipm.backend.mapper;

import com.aipm.backend.entity.ToolDesensitizeRecord;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ToolDesensitizeRecordMapper {
    ToolDesensitizeRecord findById(Long id);

    int insert(ToolDesensitizeRecord record);
}
