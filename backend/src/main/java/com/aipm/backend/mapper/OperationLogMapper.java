package com.aipm.backend.mapper;

import com.aipm.backend.entity.OperationLog;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface OperationLogMapper {
    List<OperationLog> findRecent(Integer limit);

    int insert(OperationLog log);
}
