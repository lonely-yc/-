package com.aipm.backend.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSchemaInitializer implements ApplicationRunner {
    private final JdbcTemplate jdbcTemplate;

    public DatabaseSchemaInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        ensurePersonHandoverTables();
        ensureToolTables();
        ensureColumn("project_insights", "notes_json", "TEXT NULL");
    }

    private void ensurePersonHandoverTables() {
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS person_project_handovers (
                    id BIGINT PRIMARY KEY AUTO_INCREMENT,
                    person_id BIGINT NOT NULL,
                    project_id BIGINT NOT NULL,
                    handover_to_user_id BIGINT NULL,
                    handover_to_name VARCHAR(100) NULL,
                    handover_status VARCHAR(30) NOT NULL DEFAULT '未交接',
                    handover_remark TEXT NULL,
                    handover_at DATETIME NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY uk_person_project_handover (person_id, project_id),
                    KEY idx_person_handover_person (person_id),
                    KEY idx_person_handover_project (project_id)
                )
                """);
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS person_handover_documents (
                    id BIGINT PRIMARY KEY AUTO_INCREMENT,
                    person_id BIGINT NOT NULL,
                    project_id BIGINT NOT NULL,
                    file_name VARCHAR(255) NOT NULL,
                    stored_path VARCHAR(500) NOT NULL,
                    document_type VARCHAR(80) NULL,
                    summary TEXT NULL,
                    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    KEY idx_handover_doc_person_project (person_id, project_id),
                    KEY idx_handover_doc_uploaded_at (uploaded_at)
                )
                """);
    }

    private void ensureToolTables() {
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS tool_desensitize_records (
                    id BIGINT PRIMARY KEY AUTO_INCREMENT,
                    original_file_name VARCHAR(255) NOT NULL,
                    original_stored_path VARCHAR(500) NOT NULL,
                    masked_file_name VARCHAR(255) NOT NULL,
                    masked_stored_path VARCHAR(500) NOT NULL,
                    match_count INT NOT NULL DEFAULT 0,
                    rule_summary TEXT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    KEY idx_tool_desensitize_created_at (created_at)
                )
                """);
    }

    private void ensureColumn(String tableName, String columnName, String definition) {
        Integer count = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = ?
                  AND COLUMN_NAME = ?
                """,
                Integer.class,
                tableName,
                columnName
        );
        if (count != null && count == 0) {
            jdbcTemplate.execute("ALTER TABLE " + tableName + " ADD COLUMN " + columnName + " " + definition);
        }
    }
}
