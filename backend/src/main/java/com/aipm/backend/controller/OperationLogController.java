package com.aipm.backend.controller;

import com.aipm.backend.entity.OperationLog;
import com.aipm.backend.service.OperationLogService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/operation-logs")
public class OperationLogController {
    private final OperationLogService operationLogService;

    public OperationLogController(OperationLogService operationLogService) {
        this.operationLogService = operationLogService;
    }

    @GetMapping
    public Map<String, Object> list(@RequestParam(defaultValue = "20") Integer limit) {
        return ApiResponse.ok(operationLogService.findRecent(limit));
    }

    @PostMapping
    public Map<String, Object> create(@RequestBody OperationLog log) {
        OperationLog savedLog = operationLogService.record(
                log.getProjectId(),
                log.getProjectName(),
                log.getOperator(),
                log.getActionType(),
                log.getActionTitle(),
                log.getContent()
        );
        return ApiResponse.ok("记录成功", savedLog);
    }
}
