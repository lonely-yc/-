SET NAMES utf8mb4;
SET SESSION sql_mode = 'NO_BACKSLASH_ESCAPES';
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS pm_system
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE pm_system;

DROP TABLE IF EXISTS project_insights;
DROP TABLE IF EXISTS operation_logs;
DROP TABLE IF EXISTS tool_desensitize_records;
DROP TABLE IF EXISTS person_handover_documents;
DROP TABLE IF EXISTS person_project_handovers;
DROP TABLE IF EXISTS project_members;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工号',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '账号',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) NOT NULL COMMENT '姓名',
    phone VARCHAR(30) COMMENT '手机号',
    role VARCHAR(30) NOT NULL COMMENT '岗位：PM/DEV_MANAGER/FRONTEND/BACKEND/IMPLEMENTER/DESIGNER/TESTER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='人员信息';

CREATE TABLE projects (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '项目名称',
    code VARCHAR(50) COMMENT '项目编号',
    manager VARCHAR(50) COMMENT '负责人',
    description TEXT COMMENT '项目说明',
    customer VARCHAR(100) COMMENT '客户名称',
    start_date DATE COMMENT '开始日期',
    end_date DATE COMMENT '结束日期',
    status VARCHAR(20) DEFAULT 'PLANNING' COMMENT '状态：PLANNING/IN_PROGRESS/COMPLETED/ARCHIVED',
    created_by BIGINT COMMENT '创建人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_projects_status (status),
    INDEX idx_projects_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目主档';

CREATE TABLE project_members (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT NOT NULL COMMENT '项目ID',
    user_id BIGINT NOT NULL COMMENT '人员ID',
    role VARCHAR(30) NOT NULL COMMENT '项目职责',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
    INDEX idx_project_members_project_id (project_id),
    INDEX idx_project_members_user_id (user_id),
    CONSTRAINT fk_project_members_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_project_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目成员';

CREATE TABLE person_project_handovers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    person_id BIGINT NOT NULL COMMENT '人员ID',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    handover_to_user_id BIGINT COMMENT '交接人ID',
    handover_to_name VARCHAR(100) COMMENT '交接人姓名',
    handover_status VARCHAR(30) NOT NULL DEFAULT '未交接' COMMENT '交接状态',
    handover_remark TEXT COMMENT '交接说明',
    handover_at DATETIME COMMENT '交接时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_person_project_handover (person_id, project_id),
    INDEX idx_person_handover_person (person_id),
    INDEX idx_person_handover_project (project_id),
    CONSTRAINT fk_person_handover_person FOREIGN KEY (person_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_person_handover_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_person_handover_to_user FOREIGN KEY (handover_to_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='个人项目交接信息';

CREATE TABLE person_handover_documents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    person_id BIGINT NOT NULL COMMENT '人员ID',
    project_id BIGINT NOT NULL COMMENT '项目ID',
    file_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
    stored_path VARCHAR(500) NOT NULL COMMENT '本地存储路径',
    document_type VARCHAR(80) COMMENT '资料类型',
    summary TEXT COMMENT '资料摘要',
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_handover_doc_person_project (person_id, project_id),
    INDEX idx_handover_doc_uploaded_at (uploaded_at),
    CONSTRAINT fk_handover_doc_person FOREIGN KEY (person_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_handover_doc_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='个人项目交接资料';

CREATE TABLE project_insights (
    project_id BIGINT PRIMARY KEY COMMENT '项目ID',
    field_directory VARCHAR(255) COMMENT '现场资料目录',
    repositories_json LONGTEXT COMMENT 'Git仓库地址JSON',
    documents_json LONGTEXT COMMENT '项目资料文档JSON',
    changes_json LONGTEXT COMMENT '需求变更JSON',
    deliveries_json LONGTEXT COMMENT '发包部署JSON',
    middlewares_json LONGTEXT COMMENT '中间件配置JSON',
    timeline_json LONGTEXT COMMENT '项目履历时间轴JSON',
    notes_json LONGTEXT COMMENT '项目事项备注JSON',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    CONSTRAINT fk_project_insights_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目追踪链';

CREATE TABLE operation_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_id BIGINT COMMENT '项目ID',
    project_name VARCHAR(100) COMMENT '项目名称',
    operator VARCHAR(50) COMMENT '操作人',
    action_type VARCHAR(40) NOT NULL COMMENT '操作类型',
    action_title VARCHAR(100) NOT NULL COMMENT '操作标题',
    content TEXT COMMENT '操作内容',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    INDEX idx_operation_logs_project_id (project_id),
    INDEX idx_operation_logs_action_type (action_type),
    INDEX idx_operation_logs_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志';

CREATE TABLE tool_desensitize_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    original_file_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
    original_stored_path VARCHAR(500) NOT NULL COMMENT '原始文件存储路径',
    masked_file_name VARCHAR(255) NOT NULL COMMENT '脱敏文件名',
    masked_stored_path VARCHAR(500) NOT NULL COMMENT '脱敏文件存储路径',
    match_count INT NOT NULL DEFAULT 0 COMMENT '脱敏命中数量',
    rule_summary TEXT COMMENT '脱敏规则命中摘要',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '处理时间',
    INDEX idx_tool_desensitize_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档脱敏处理记录';

INSERT INTO users (id, employee_no, username, password, real_name, phone, role, created_at) VALUES
(1, 'PM001', 'linan', '123456', '李楠', '13800000001', 'PM', '2026-05-21 09:00:00'),
(2, 'DEV001', 'chenyue', '123456', '陈越', '13800000002', 'DEV_MANAGER', '2026-05-21 09:05:00'),
(3, 'FE001', 'xuqi', '123456', '许琪', '13800000003', 'FRONTEND', '2026-05-21 09:10:00'),
(4, 'BE001', 'liuyang', '123456', '刘洋', '13800000004', 'BACKEND', '2026-05-21 09:15:00'),
(5, 'IM001', 'huifeng', '123456', '惠晓峰', '13800000005', 'IMPLEMENTER', '2026-05-21 09:20:00'),
(6, 'DS001', 'zhangsan', '123456', '张三', '13800000006', 'DESIGNER', '2026-05-21 09:25:00'),
(7, 'QA001', 'zhaoning', '123456', '赵宁', '13800000007', 'TESTER', '2026-05-21 09:30:00');

INSERT INTO projects (id, name, code, manager, description, customer, start_date, end_date, status, created_by, created_at) VALUES
(1, '停电智能体', 'POWER-AI-2026-01', '李楠', '停电原因回填、现场发包、运维中台联动。', '鲁软', '2026-05-21', '2026-06-30', 'IN_PROGRESS', 1, '2026-05-21 09:00:00'),
(2, '巡检移动端升级', 'MOBILE-OPS-2026-02', '陈越', '巡检移动端离线缓存、弱网提交和移动端页面升级。', '华东能源', '2026-05-01', '2026-06-15', 'PLANNING', 2, '2026-05-01 09:00:00'),
(3, '园区运营平台', 'PARK-HUB-2026-03', '李楠', '园区运营管理、资料归档、部署记录和数据看板。', '江北产业园', '2026-04-12', '2026-05-20', 'COMPLETED', 1, '2026-04-12 09:00:00');

INSERT INTO project_members (project_id, user_id, role, joined_at) VALUES
(1, 1, 'PM', '2026-05-21 09:00:00'),
(1, 2, 'DEV_MANAGER', '2026-05-21 09:10:00'),
(1, 4, 'BACKEND', '2026-05-22 09:00:00'),
(1, 5, 'IMPLEMENTER', '2026-05-23 09:00:00'),
(1, 7, 'TESTER', '2026-05-27 09:00:00'),
(2, 2, 'DEV_MANAGER', '2026-05-01 09:00:00'),
(2, 3, 'FRONTEND', '2026-05-02 09:00:00'),
(2, 5, 'IMPLEMENTER', '2026-05-04 09:00:00'),
(3, 1, 'PM', '2026-04-12 09:00:00'),
(3, 6, 'DESIGNER', '2026-04-13 09:00:00');

INSERT INTO project_insights (
    project_id,
    field_directory,
    repositories_json,
    documents_json,
    changes_json,
    deliveries_json,
    middlewares_json,
    timeline_json,
    notes_json
) VALUES
(1,
 '/data/projects/power-ai/',
 '[{"id":"repo-1","name":"后端服务","branch":"main","url":"https://git.example.com/power-ai/backend"},{"id":"repo-2","name":"前端页面","branch":"release","url":"https://git.example.com/power-ai/frontend"},{"id":"repo-3","name":"设计蓝图","branch":"master","url":"https://figma.com/design/power-ai"}]',
 '[{"id":"doc-1","name":"需求规格说明","directory":"/data/projects/power-ai/docs/","fileName":"requirements.docx","size":"2.4 MB","updatedAt":"2026-05-21","content":"首版范围、客户需求和现场部署窗口。","storedPath":"/data/projects/power-ai/docs/requirements.docx"},{"id":"doc-2","name":"现场部署手册","directory":"/data/projects/power-ai/docs/","fileName":"deploy-guide.md","size":"186 KB","updatedAt":"2026-05-26","content":"现场部署顺序、回退说明和验证步骤。","storedPath":"/data/projects/power-ai/docs/deploy-guide.md"}]',
 '[{"id":"chg-1","date":"2026-05-24 09:00","requester":"国网运维中心","summary":"增加停电原因回填和 AI 研判复核入口。","backend":"新增 cause_review 表与 /api/review/cause 接口。","frontend":"停电详情页新增复核抽屉和二次确认按钮。","reason":"客户要求停电原因必须可追溯，AI 结果需要人工复核。","content":"停电原因回填、复核状态、复核人和复核时间全部入库。","status":"已发包","recordedAt":"2026-05-24 09:18"},{"id":"chg-2","date":"2026-05-28 15:30","requester":"现场实施组","summary":"弱网场景下支持离线缓存。","backend":"补充离线同步批量接口与冲突处理策略。","frontend":"工单列表增加本地缓存草稿和同步状态提示。","reason":"现场地下配电室网络不稳定，工单提交失败率偏高。","content":"新增离线工单草稿、失败重试、同步状态标记。","status":"已验证","recordedAt":"2026-05-28 17:10"},{"id":"chg-3","date":"2026-05-30 10:20","requester":"鲁软项目经理","summary":"首页增加项目履历摘要。","backend":"追踪链接口补充备注 notes_json 字段。","frontend":"项目详情新增接手摘要和项目事项备注。","reason":"方便后续同事接手时快速了解关键问题。","content":"接手摘要展示最近发包、未关闭问题、中间件和项目事项。","status":"开发中","recordedAt":"2026-05-30 10:36"}]',
 '[{"id":"del-1","date":"2026-05-26 20:10","version":"v1.3.0","reason":"首轮现场联调","packageName":"power-agent-release-1.3.0.zip","scope":"前后端联调包、Redis 初始化脚本、Nginx 代理配置","operator":"陈越","environment":"测试","solvedIssues":"完成停电原因回填接口联调，验证现场 Nginx 代理。","relatedRequirementIds":["chg-1"],"rollbackPlan":"保留 v1.2.0 包，异常时回退 Spring Boot 服务和前端静态包。","recordedAt":"2026-05-26 20:40"},{"id":"del-2","date":"2026-05-30 23:35","version":"v1.4.2","reason":"需求变更后的稳定版","packageName":"power-agent-release-1.4.2.zip","scope":"前端修复包、Spring Boot 服务、部署变更单","operator":"陈越","environment":"正式","solvedIssues":"解决弱网离线缓存和项目履历摘要问题。","relatedRequirementIds":["chg-2","chg-3"],"rollbackPlan":"数据库结构向后兼容；失败时回退应用包，保留新增字段。","recordedAt":"2026-05-31 00:05"}]',
 '[{"id":"mw-1","environment":"测试","name":"MySQL","host":"10.10.20.15","port":"3306","configPath":"/etc/project/mysql.cnf","configFileName":"mysql.cnf","configStoredPath":"/data/projects/power-ai/config/mysql.cnf","remark":"业务库","content":"spring.datasource.url=jdbc:mysql://10.10.20.15:3306/power_ai\nspring.datasource.username=power_user","recordedAt":"2026-05-22 10:00"},{"id":"mw-2","environment":"测试","name":"Redis","host":"10.10.20.18","port":"6379","configPath":"/etc/redis/redis.conf","configFileName":"redis.conf","configStoredPath":"/data/projects/power-ai/config/redis.conf","remark":"缓存与任务锁","content":"bind 10.10.20.18\nport 6379\nrequirepass ******","recordedAt":"2026-05-22 10:20"},{"id":"mw-3","environment":"正式","name":"Nginx","host":"172.16.8.21","port":"80","configPath":"/etc/nginx/conf.d/power-ai.conf","configFileName":"power-ai.conf","configStoredPath":"/data/projects/power-ai/config/power-ai.conf","remark":"前端代理","content":"location /api { proxy_pass http://127.0.0.1:18081; }","recordedAt":"2026-05-26 18:00"}]',
 '[{"id":"tl-create-1","date":"2026-05-21 09:00","title":"项目创建","actor":"李楠","detail":"项目启动会完成，明确现场部署窗口与第一版范围。","type":"milestone","sourceType":"project","sourceId":"1","recordedAt":"2026-05-21 09:05","status":"已完成"},{"id":"tl-member-1","date":"2026-05-23 09:00","title":"实施加入","actor":"惠晓峰","detail":"实施同学加入项目，负责现场环境准备与配置校验。","type":"member","sourceType":"member","sourceId":"5","recordedAt":"2026-05-23 09:05","status":"已完成"},{"id":"tl-change-1","date":"2026-05-24 09:00","title":"需求变更：增加停电原因回填和 AI 研判复核入口。","actor":"国网运维中心","detail":"客户要求停电原因必须可追溯，AI 结果需要人工复核。","type":"change","sourceType":"change","sourceId":"chg-1","recordedAt":"2026-05-24 09:18","reason":"客户现场提出调整","backendChanges":"新增 cause_review 表与 /api/review/cause 接口。","frontendChanges":"停电详情页新增复核抽屉和二次确认按钮。","status":"已发包"},{"id":"tl-delivery-1","date":"2026-05-26 20:10","title":"发包部署：v1.3.0 首轮现场联调","actor":"陈越","detail":"完成停电原因回填接口联调，验证现场 Nginx 代理。","type":"delivery","sourceType":"delivery","sourceId":"del-1","recordedAt":"2026-05-26 20:40","attachments":["power-agent-release-1.3.0.zip"],"status":"已发包"},{"id":"tl-change-2","date":"2026-05-28 15:30","title":"需求变更：弱网场景下支持离线缓存。","actor":"现场实施组","detail":"地下配电室网络不稳定，新增离线缓存和失败重试。","type":"change","sourceType":"change","sourceId":"chg-2","recordedAt":"2026-05-28 17:10","backendChanges":"补充离线同步批量接口与冲突处理策略。","frontendChanges":"工单列表增加本地缓存草稿和同步状态提示。","status":"已验证"},{"id":"tl-delivery-2","date":"2026-05-30 23:35","title":"发包部署：v1.4.2 需求变更后的稳定版","actor":"陈越","detail":"解决弱网离线缓存和项目履历摘要问题。","type":"delivery","sourceType":"delivery","sourceId":"del-2","recordedAt":"2026-05-31 00:05","attachments":["power-agent-release-1.4.2.zip"],"status":"已验证"}]',
 '[{"id":"note-1","type":"DATA_PLATFORM","title":"数据中台账号与接口申请","occurredAt":"2026-05-22 14:30","contact":"王工","contactPhone":"13800001001","address":"http://data-center.example.com","applyMethod":"通过 OA 提交数据中台接口申请单，审批人为客户信息中心张主任。","documentName":"数据中台申请单截图.png","documentUrl":"/data/projects/power-ai/docs/data-platform-apply.png","content":"项目停电原因回填需要读取停电计划、设备台账和工单状态。接口权限由客户信息中心开通，测试环境白名单为 10.10.20.0/24。","status":"已开通","recordedAt":"2026-05-22 15:10"},{"id":"note-2","type":"INTERFACE","title":"停电计划接口对接","occurredAt":"2026-05-25 10:00","contact":"刘工","contactPhone":"13800001002","address":"/openapi/power/outage/plans","applyMethod":"接口文档由客户运维群提供，联调问题直接找刘工。","documentName":"停电计划接口文档.md","documentUrl":"/data/projects/power-ai/docs/outage-api.md","content":"接口分页参数 pageNo/pageSize，时间字段使用 yyyy-MM-dd HH:mm:ss。现场返回状态码 204 表示无数据，不是异常。","status":"已联调","recordedAt":"2026-05-25 11:30"}]'
),
(2,
 '/data/projects/mobile-ops/',
 '[{"id":"repo-1","name":"移动端前端","branch":"develop","url":"https://git.example.com/mobile-ops/app"},{"id":"repo-2","name":"巡检服务","branch":"main","url":"https://git.example.com/mobile-ops/backend"}]',
 '[{"id":"doc-1","name":"移动端升级需求清单","directory":"/data/projects/mobile-ops/docs/","fileName":"requirements.xlsx","size":"860 KB","updatedAt":"2026-05-01","content":"移动端离线缓存、弱网提交、巡检图片压缩。","storedPath":"/data/projects/mobile-ops/docs/requirements.xlsx"}]',
 '[{"id":"chg-1","date":"2026-05-08 10:00","requester":"华东能源现场","summary":"巡检图片上传增加压缩策略。","backend":"图片上传接口增加文件大小校验。","frontend":"移动端上传前压缩图片并展示进度。","reason":"现场网络弱，大图上传失败率高。","content":"图片压缩到 1MB 内，保留原始拍摄时间。","status":"开发中","recordedAt":"2026-05-08 10:30"}]',
 '[{"id":"del-1","date":"2026-05-12 19:30","version":"v0.9.0","reason":"测试包","packageName":"mobile-ops-test-0.9.0.zip","scope":"移动端页面和图片上传接口","operator":"陈越","environment":"测试","solvedIssues":"验证图片压缩策略。","relatedRequirementIds":["chg-1"],"rollbackPlan":"回退到 v0.8.1。","recordedAt":"2026-05-12 20:00"}]',
 '[{"id":"mw-1","environment":"测试","name":"MinIO","host":"10.20.30.11","port":"9000","configPath":"/etc/minio/mobile.env","configFileName":"mobile.env","configStoredPath":"/data/projects/mobile-ops/config/mobile.env","remark":"图片对象存储","content":"MINIO_BUCKET=mobile-inspection","recordedAt":"2026-05-05 09:00"}]',
 '[{"id":"tl-create-1","date":"2026-05-01 09:00","title":"项目创建","actor":"陈越","detail":"移动端升级立项，确认弱网和图片上传为第一阶段。","type":"milestone","sourceType":"project","sourceId":"2","recordedAt":"2026-05-01 09:10","status":"已完成"},{"id":"tl-change-1","date":"2026-05-08 10:00","title":"需求变更：巡检图片上传增加压缩策略。","actor":"华东能源现场","detail":"图片压缩到 1MB 内，保留原始拍摄时间。","type":"change","sourceType":"change","sourceId":"chg-1","recordedAt":"2026-05-08 10:30","status":"开发中"},{"id":"tl-delivery-1","date":"2026-05-12 19:30","title":"发包部署：v0.9.0 测试包","actor":"陈越","detail":"移动端页面和图片上传接口测试包。","type":"delivery","sourceType":"delivery","sourceId":"del-1","recordedAt":"2026-05-12 20:00","status":"已发包"}]',
 '[{"id":"note-1","type":"SUPPORT","title":"移动端证书申请","occurredAt":"2026-05-06 16:00","contact":"华东能源安全组","contactPhone":"13800002001","address":"https://ca.example.com","applyMethod":"通过客户安全平台提交证书申请。","documentName":"证书申请说明.md","documentUrl":"/data/projects/mobile-ops/docs/cert.md","content":"移动端接口必须使用客户内网证书，测试证书有效期 90 天。","status":"处理中","recordedAt":"2026-05-06 16:30"}]'
),
(3,
 '/data/projects/park-hub/',
 '[{"id":"repo-1","name":"园区运营平台","branch":"main","url":"https://git.example.com/park-hub/web"}]',
 '[{"id":"doc-1","name":"验收材料","directory":"/data/projects/park-hub/docs/","fileName":"acceptance.zip","size":"12 MB","updatedAt":"2026-05-20","content":"验收报告、部署截图、最终版本说明。","storedPath":"/data/projects/park-hub/docs/acceptance.zip"}]',
 '[]',
 '[{"id":"del-1","date":"2026-05-18 21:00","version":"v2.0.0","reason":"正式验收版本","packageName":"park-hub-release-2.0.0.zip","scope":"前端静态包、后端服务、数据库脚本","operator":"李楠","environment":"正式","solvedIssues":"完成园区运营统计口径修复和验收交付。","relatedRequirementIds":[],"rollbackPlan":"保留 v1.9.5 包。","recordedAt":"2026-05-18 22:00"}]',
 '[{"id":"mw-1","environment":"正式","name":"MySQL","host":"172.18.2.11","port":"3306","configPath":"/etc/park/mysql.cnf","configFileName":"mysql.cnf","configStoredPath":"/data/projects/park-hub/config/mysql.cnf","remark":"运营数据库","content":"database=park_hub","recordedAt":"2026-04-20 09:00"}]',
 '[{"id":"tl-create-1","date":"2026-04-12 09:00","title":"项目创建","actor":"李楠","detail":"园区运营平台立项。","type":"milestone","sourceType":"project","sourceId":"3","recordedAt":"2026-04-12 09:10","status":"已完成"},{"id":"tl-delivery-1","date":"2026-05-18 21:00","title":"发包部署：v2.0.0 正式验收版本","actor":"李楠","detail":"完成园区运营统计口径修复和验收交付。","type":"delivery","sourceType":"delivery","sourceId":"del-1","recordedAt":"2026-05-18 22:00","status":"已验证"},{"id":"tl-archive-1","date":"2026-05-20 17:00","title":"项目归档","actor":"李楠","detail":"交付资料、部署包和验收报告已归档。","type":"milestone","sourceType":"archive","sourceId":"park-hub-archive","recordedAt":"2026-05-20 17:30","status":"已完成"}]',
 '[{"id":"note-1","type":"DATA_SOURCE","title":"运营统计数据来源","occurredAt":"2026-04-18 14:00","contact":"园区数据组赵工","contactPhone":"13800003001","address":"园区数据仓库 ods_park_daily","applyMethod":"项目经理邮件申请，园区数据组授权只读账号。","documentName":"数据口径说明.docx","documentUrl":"/data/projects/park-hub/docs/data-source.docx","content":"运营指标来自 ods_park_daily，每日 02:00 同步，节假日可能延迟。","status":"已归档","recordedAt":"2026-04-18 15:00"}]'
);

INSERT INTO person_project_handovers (
    person_id,
    project_id,
    handover_to_user_id,
    handover_to_name,
    handover_status,
    handover_remark,
    handover_at
) VALUES
(1, 1, 2, '陈越', '交接中', '重点说明停电原因回填、现场发包窗口、数据中台申请路径和接口联调联系人。', '2026-05-30 17:30:00'),
(2, 1, 4, '刘洋', '需补充', '后端接口和部署脚本已整理，Redis 初始化和回退说明还需要补充。', '2026-05-30 18:10:00'),
(5, 1, 7, '赵宁', '未交接', '现场环境账号、Nginx 代理和实施注意事项需要沉淀。', '2026-05-29 16:00:00'),
(3, 2, 2, '陈越', '交接中', '移动端离线缓存和图片压缩策略需要补充截图和验证步骤。', '2026-05-14 15:20:00');

INSERT INTO person_handover_documents (
    person_id,
    project_id,
    file_name,
    stored_path,
    document_type,
    summary,
    uploaded_at
) VALUES
(1, 1, '停电智能体接手说明.md', 'uploads/person-handover/1/1/power-agent-handover.md', '交接说明', '接口、数据来源、客户联系人和发包注意事项。', '2026-05-30 18:00:00'),
(2, 1, '后端接口与表结构说明.docx', 'uploads/person-handover/2/1/backend-api.docx', '接口说明', '后端接口、表结构变更和回退说明。', '2026-05-30 18:30:00'),
(5, 1, '现场部署注意事项.txt', 'uploads/person-handover/5/1/field-deploy.txt', '现场事项', '现场 IP、端口、Nginx 代理和客户值班联系人。', '2026-05-29 16:30:00'),
(3, 2, '移动端离线缓存理解.md', 'uploads/person-handover/3/2/mobile-cache.md', '个人理解', '离线缓存、弱网提交流程和页面注意事项。', '2026-05-14 16:00:00');

INSERT INTO operation_logs (project_id, project_name, operator, action_type, action_title, content, created_at) VALUES
(1, '停电智能体', '陈越', 'delivery', '稳定版发包', '发布 v1.4.2，解决弱网离线缓存和项目履历摘要问题。', '2026-05-30 23:35:00'),
(1, '停电智能体', '鲁软项目经理', 'change', '新增项目履历摘要需求', '要求详情页能展示接手摘要和项目事项备注。', '2026-05-30 10:20:00'),
(1, '停电智能体', '现场实施组', 'change', '弱网离线缓存需求变更', '地下配电室网络不稳定，新增离线缓存和失败重试。', '2026-05-28 15:30:00'),
(1, '停电智能体', '陈越', 'delivery', '联调发包', '发布 v1.3.0，完成停电原因回填接口联调。', '2026-05-26 20:10:00'),
(1, '停电智能体', '国网运维中心', 'change', '需求修改', '增加停电原因回填和 AI 研判复核入口。', '2026-05-24 09:00:00'),
(1, '停电智能体', '惠晓峰', 'member_add', '添加项目成员', '惠晓峰加入项目，负责现场环境准备与配置校验。', '2026-05-23 09:00:00'),
(1, '停电智能体', '李楠', 'project_create', '新增项目', '停电智能体项目创建，明确现场部署窗口与第一版范围。', '2026-05-21 09:00:00'),
(2, '巡检移动端升级', '陈越', 'delivery', '测试包发包', '发布 v0.9.0，验证图片压缩策略。', '2026-05-12 19:30:00'),
(2, '巡检移动端升级', '华东能源现场', 'change', '图片压缩需求', '巡检图片上传增加压缩策略。', '2026-05-08 10:00:00'),
(3, '园区运营平台', '李楠', 'project_update', '更新项目', '项目完成验收并归档资料。', '2026-05-20 17:00:00');

SET FOREIGN_KEY_CHECKS = 1;
