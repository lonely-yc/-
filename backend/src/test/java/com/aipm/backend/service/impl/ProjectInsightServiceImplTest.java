package com.aipm.backend.service.impl;

import com.aipm.backend.dto.ProjectInsight;
import com.aipm.backend.entity.ProjectInsightRecord;
import com.aipm.backend.mapper.ProjectInsightMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ProjectInsightServiceImplTest {
    @Test
    void savesAndReadsProjectInsightLists() {
        InMemoryProjectInsightMapper mapper = new InMemoryProjectInsightMapper();
        ProjectInsightServiceImpl service = new ProjectInsightServiceImpl(mapper, new ObjectMapper());
        ProjectInsight insight = ProjectInsight.empty(7L);

        insight.setFieldDirectory("/docs/project/");
        insight.getRepositories().add(new ProjectInsight.RepositoryLink("repo-1", "backend", "main", "https://git.example.com/backend"));
        insight.getDocuments().add(new ProjectInsight.ProjectDocument("doc-1", "需求文档", "/docs/", "req.txt", "1 KB", "2026-05-22", "demo", "/tmp/req.txt"));
        insight.getChanges().add(new ProjectInsight.ChangeRecord("change-1", "2026-05-22", "客户", "新增需求", "后端改动", "前端改动"));
        insight.getDeliveries().add(new ProjectInsight.DeliveryRecord("delivery-1", "2026-05-22 18:00", "v1.0.0", "首包", "release.zip", "全量"));
        insight.getMiddlewares().add(new ProjectInsight.MiddlewareConfig("mw-1", "测试", "Redis", "127.0.0.1", "6379", "/etc/redis.conf", "redis.conf", "/tmp/redis.conf", "缓存", "port 6379"));
        insight.getTimeline().add(new ProjectInsight.TimelineEvent("tl-1", "2026-05-22", "项目启动", "李楠", "启动完成", "milestone"));

        service.save(7L, insight);
        ProjectInsight loaded = service.getByProjectId(7L);

        assertThat(loaded.getProjectId()).isEqualTo(7L);
        assertThat(loaded.getRepositories()).hasSize(1);
        assertThat(loaded.getDocuments()).hasSize(1);
        assertThat(loaded.getChanges()).hasSize(1);
        assertThat(loaded.getDeliveries()).hasSize(1);
        assertThat(loaded.getMiddlewares()).hasSize(1);
        assertThat(loaded.getTimeline()).hasSize(1);
    }

    private static class InMemoryProjectInsightMapper implements ProjectInsightMapper {
        private ProjectInsightRecord record;

        @Override
        public ProjectInsightRecord findByProjectId(Long projectId) {
            return record;
        }

        @Override
        public int insert(ProjectInsightRecord record) {
            this.record = record;
            return 1;
        }

        @Override
        public int update(ProjectInsightRecord record) {
            this.record = record;
            return 1;
        }

        @Override
        public int deleteByProjectId(Long projectId) {
            record = null;
            return 1;
        }
    }
}
