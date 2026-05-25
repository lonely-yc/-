package com.aipm.backend.controller;

import java.util.Map;

final class ApiResponse {
    private ApiResponse() {
    }

    static Map<String, Object> ok(Object data) {
        return Map.of("code", 200, "data", data);
    }

    static Map<String, Object> ok(String message) {
        return Map.of("code", 200, "message", message);
    }

    static Map<String, Object> ok(String message, Object data) {
        return Map.of("code", 200, "message", message, "data", data);
    }

    static Map<String, Object> error(int code, String message) {
        return Map.of("code", code, "message", message);
    }
}
