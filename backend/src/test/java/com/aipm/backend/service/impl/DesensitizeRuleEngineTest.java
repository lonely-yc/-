package com.aipm.backend.service.impl;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class DesensitizeRuleEngineTest {
    @Test
    void masksBuiltInSensitiveBusinessValues() {
        DesensitizeRuleEngine engine = new DesensitizeRuleEngine();

        DesensitizeRuleEngine.MaskResult result = engine.mask(
                "客户名称：鲁软 联系人：张工 手机号 13800000001 接口 http://10.10.20.15/api token=abc123",
                List.of()
        );

        assertThat(result.value()).doesNotContain("13800000001", "10.10.20.15", "abc123");
        assertThat(result.count()).isGreaterThanOrEqualTo(3);
        assertThat(result.summary()).containsKey("IP地址");
    }

    @Test
    void masksCustomKeywords() {
        DesensitizeRuleEngine engine = new DesensitizeRuleEngine();

        DesensitizeRuleEngine.MaskResult result = engine.mask("现场客户是鲁软科技", List.of("鲁软科技"));

        assertThat(result.value()).isEqualTo("现场客户是****");
        assertThat(result.summary()).containsEntry("自定义关键词", 1);
    }
}
