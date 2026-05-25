package com.aipm.backend.service;

import com.aipm.backend.entity.ToolDesensitizeRecord;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

public interface ToolDesensitizeService {
    Map<String, Object> desensitize(MultipartFile file, String mode, String keywords) throws IOException;

    ToolDesensitizeRecord findById(Long id);
}
