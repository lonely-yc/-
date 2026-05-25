package com.aipm.backend.service;

import com.aipm.backend.entity.OperationLog;

import java.util.List;

public interface OperationLogService {
    List<OperationLog> findRecent(Integer limit);

    OperationLog record(Long projectId, String projectName, String operator, String actionType, String actionTitle, String content);
}
