package com.aipm.backend.service.impl;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

class DesensitizeRuleEngine {
    private final List<Rule> rules = List.of(
            new Rule("手机号", Pattern.compile("(?<!\\d)1[3-9]\\d{9}(?!\\d)")),
            new Rule("身份证号", Pattern.compile("(?<!\\d)\\d{17}[\\dXx](?!\\d)")),
            new Rule("IP地址", Pattern.compile("\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b")),
            new Rule("接口地址", Pattern.compile("https?://[^\\s，。；;]+", Pattern.CASE_INSENSITIVE)),
            new Rule("数据库连接", Pattern.compile("jdbc:[^\\s，。；;]+", Pattern.CASE_INSENSITIVE)),
            new Rule("邮箱", Pattern.compile("[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}")),
            new Rule("账号密码", Pattern.compile("(?i)(账号|账户|用户名|密码|令牌|密钥|token|password|passwd|pwd|secret|access[_-]?key)\\s*[:：=]\\s*[^\\s，。；;]+")),
            new Rule("业务字段", Pattern.compile("(客户名称|客户|联系人|联系电话|手机号|地址|现场地址|项目现场|接口地址|数据库连接|服务地址|账号|密码)\\s*[:：=]\\s*[^\\s，。；;]+"))
    );

    MaskResult mask(String value, List<String> keywords) {
        if (value == null || value.isEmpty()) {
            return new MaskResult(value, 0, Map.of());
        }

        String masked = value;
        Map<String, Integer> summary = new LinkedHashMap<>();
        for (Rule rule : rules) {
            ReplaceResult result = replacePattern(masked, rule.pattern());
            masked = result.value();
            if (result.count() > 0) {
                summary.merge(rule.name(), result.count(), Integer::sum);
            }
        }

        for (String keyword : keywords) {
            if (keyword == null || keyword.isBlank()) {
                continue;
            }
            String trimmed = keyword.trim();
            int count = countOccurrences(masked, trimmed);
            if (count > 0) {
                masked = masked.replace(trimmed, "****");
                summary.merge("自定义关键词", count, Integer::sum);
            }
        }

        int total = summary.values().stream().mapToInt(Integer::intValue).sum();
        return new MaskResult(masked, total, summary);
    }

    static List<String> parseKeywords(String keywords) {
        if (keywords == null || keywords.isBlank()) {
            return List.of();
        }
        String[] parts = keywords.split("[,，\\n\\r;；]+");
        List<String> values = new ArrayList<>();
        for (String part : parts) {
            if (!part.isBlank()) {
                values.add(part.trim());
            }
        }
        return values;
    }

    private ReplaceResult replacePattern(String value, Pattern pattern) {
        Matcher matcher = pattern.matcher(value);
        StringBuffer buffer = new StringBuffer();
        int count = 0;
        while (matcher.find()) {
            matcher.appendReplacement(buffer, "****");
            count++;
        }
        matcher.appendTail(buffer);
        return new ReplaceResult(buffer.toString(), count);
    }

    private int countOccurrences(String value, String keyword) {
        int count = 0;
        int index = 0;
        while ((index = value.indexOf(keyword, index)) >= 0) {
            count++;
            index += keyword.length();
        }
        return count;
    }

    private record Rule(String name, Pattern pattern) {
    }

    private record ReplaceResult(String value, int count) {
    }

    record MaskResult(String value, int count, Map<String, Integer> summary) {
    }
}
