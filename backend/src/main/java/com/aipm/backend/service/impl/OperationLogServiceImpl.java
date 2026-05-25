package com.aipm.backend.service.impl;

import com.aipm.backend.entity.OperationLog;
import com.aipm.backend.mapper.OperationLogMapper;
import com.aipm.backend.service.OperationLogService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OperationLogServiceImpl implements OperationLogService {
    private static final int DEFAULT_LIMIT = 20;
    private static final int MAX_LIMIT = 100;

    private final OperationLogMapper operationLogMapper;

    public OperationLogServiceImpl(OperationLogMapper operationLogMapper) {
        this.operationLogMapper = operationLogMapper;
    }

    @Override
    public List<OperationLog> findRecent(Integer limit) {
        return operationLogMapper.findRecent(safeLimit(limit));
    }

    @Override
    public OperationLog record(Long projectId, String projectName, String operator, String actionType, String actionTitle, String content) {
        OperationLog log = new OperationLog();
        log.setProjectId(projectId);
        log.setProjectName(projectName);
        log.setOperator(defaultText(operator, "管理员"));
        log.setActionType(actionType);
        log.setActionTitle(defaultText(actionTitle, "系统操作"));
        log.setContent(content);
        operationLogMapper.insert(log);
        return log;
    }

    private int safeLimit(Integer limit) {
        if (limit == null || limit <= 0) {
            return DEFAULT_LIMIT;
        }
        return Math.min(limit, MAX_LIMIT);
    }

    private String defaultText(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
