export type ProjectStage = "需求确认" | "开发中" | "测试中" | "待部署" | "已上线";
export type ChangeType = "新增" | "调整" | "修复" | "紧急";
export type Priority = "高" | "中" | "低";
export type ChangeStatus = "待评估" | "开发中" | "待发包" | "待验证" | "已发包" | "已关闭";
export type DevChangeType = "前端" | "后端" | "数据库" | "配置" | "设计" | "实施";
export type DeployEnv = "测试" | "预生产" | "现场";
export type DeployResult = "成功" | "失败" | "回滚" | "待验证";

export interface ProjectMember {
  role: "项目经理" | "开发经理" | "前端" | "后端" | "实施" | "设计" | "测试";
  name: string;
  phone?: string;
}

export interface ProjectResource {
  type: "需求文档" | "设计蓝图" | "部署文档" | "验收材料" | "接口文档" | "其他";
  name: string;
  url: string;
}

export interface ProjectRepository {
  type: "前端 Git" | "后端 Git" | "设计蓝图" | "接口文档";
  name: string;
  url: string;
}

export interface MiddlewareConfig {
  id: string;
  projectId: string;
  name: "Nginx" | "MySQL" | "Redis" | "RabbitMQ" | "MinIO";
  environment: DeployEnv;
  host: string;
  port: string;
  configPath: string;
  note: string;
}

export interface BackendEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  title: string;
  description: string;
  module: "项目" | "人员" | "资料" | "需求变更" | "开发改动" | "发包部署" | "中间件";
}

export interface Project {
  id: string;
  name: string;
  customer: string;
  projectManager: string;
  devManager: string;
  stage: ProjectStage;
  progress: number;
  site: string;
  members: ProjectMember[];
  resources: ProjectResource[];
  repositories: ProjectRepository[];
  backendFramework: string;
  database: string;
}

export interface RequirementChange {
  id: string;
  projectId: string;
  projectName: string;
  requestedAt: string;
  requester: string;
  type: ChangeType;
  isLateChange: boolean;
  content: string;
  reason: string;
  impact: string;
  priority: Priority;
  status: ChangeStatus;
}

export interface DevelopmentChange {
  id: string;
  changeId: string;
  projectId: string;
  type: DevChangeType;
  content: string;
  owner: string;
  completedAt: string;
  version: string;
  note: string;
}

export interface Deployment {
  id: string;
  projectId: string;
  changeIds: string[];
  deployedAt: string;
  environment: DeployEnv;
  reason: string;
  frontendVersion: string;
  backendVersion: string;
  middleware: string;
  siteIp: string;
  port: string;
  configNote: string;
  operator: string;
  result: DeployResult;
}

export interface TrackerData {
  projects: Project[];
  changes: RequirementChange[];
  devChanges: DevelopmentChange[];
  deployments: Deployment[];
  middlewares: MiddlewareConfig[];
}

export interface TimelineItem {
  id: string;
  projectId: string;
  at: string;
  type: "项目" | "需求" | "开发" | "发包" | "配置";
  title: string;
  body: string;
  meta: string;
}

export interface DashboardMetrics {
  projectCount: number;
  changeCount: number;
  devChangeCount: number;
  deploymentCount: number;
  lateChangeCount: number;
  abnormalDeploymentCount: number;
  lateChangeRatio: number;
  linkedChangeRatio: number;
}

export interface TraceChain {
  project?: Project;
  change: RequirementChange;
  devChanges: DevelopmentChange[];
  deployments: Deployment[];
}

export const backendEndpoints: BackendEndpoint[] = [
  { method: "GET", path: "/api/projects", title: "项目列表", description: "分页查询项目主档，支持项目名称、客户、阶段筛选。", module: "项目" },
  { method: "POST", path: "/api/projects", title: "新增项目", description: "创建项目基础信息、人员、资料地址、代码仓库和技术栈。", module: "项目" },
  { method: "PUT", path: "/api/projects/{id}", title: "修改项目", description: "更新项目主档，保留修改人和修改时间。", module: "项目" },
  { method: "DELETE", path: "/api/projects/{id}", title: "删除项目", description: "逻辑删除项目，并校验是否仍有关联发包记录。", module: "项目" },
  { method: "GET", path: "/api/projects/{id}/timeline", title: "项目时间线", description: "聚合项目初始化、需求变更、开发改动、发包部署和配置变更。", module: "项目" },
  { method: "GET", path: "/api/projects/{id}/members", title: "项目人员", description: "返回项目经理、开发经理、前端、后端、实施、设计、测试人员。", module: "人员" },
  { method: "POST", path: "/api/projects/{id}/resources", title: "新增资料", description: "维护需求文档、设计蓝图、部署文档、验收材料、接口文档地址。", module: "资料" },
  { method: "POST", path: "/api/projects/{id}/changes", title: "新增需求变更", description: "登记客户提出时间、变更内容、原因、影响范围和状态。", module: "需求变更" },
  { method: "POST", path: "/api/projects/{id}/dev-changes", title: "新增开发改动", description: "记录前端、后端、数据库、配置、设计、实施改动。", module: "开发改动" },
  { method: "POST", path: "/api/projects/{id}/deployments", title: "新增发包部署", description: "记录发包环境、版本、中间件、现场 IP、端口和部署结果。", module: "发包部署" },
  { method: "GET", path: "/api/projects/{id}/middlewares", title: "中间件配置", description: "查询 Nginx、MySQL、Redis 等现场配置。", module: "中间件" },
  { method: "PUT", path: "/api/middlewares/{id}", title: "修改中间件", description: "更新现场 IP、端口、配置文件路径和备注。", module: "中间件" },
];

export const initialTrackerData: TrackerData = {
  projects: [
    {
      id: "P-001",
      name: "智慧园区运营平台",
      customer: "江北产业园",
      projectManager: "李楠",
      devManager: "陈越",
      stage: "待部署",
      progress: 82,
      site: "江北现场 / 10.16.8.0",
      backendFramework: "Java 17 / Spring Boot 3.2",
      database: "MySQL 8.0",
      members: [
        { role: "项目经理", name: "李楠" },
        { role: "开发经理", name: "陈越" },
        { role: "前端", name: "许琪" },
        { role: "后端", name: "刘洋" },
        { role: "实施", name: "唐敏" },
        { role: "设计", name: "林禾" },
      ],
      resources: [
        { type: "需求文档", name: "需求规格说明书 V1.6", url: "\\\\fileserver\\projects\\P-001\\需求规格说明书.docx" },
        { type: "设计蓝图", name: "风险报表页面蓝图", url: "https://lanhuapp.com/web/#/item/project-p001" },
        { type: "部署文档", name: "现场部署手册", url: "\\\\fileserver\\projects\\P-001\\部署手册.docx" },
      ],
      repositories: [
        { type: "前端 Git", name: "park-web", url: "https://git.example.com/park/park-web.git" },
        { type: "后端 Git", name: "park-service", url: "https://git.example.com/park/park-service.git" },
        { type: "接口文档", name: "YApi 接口空间", url: "https://yapi.example.com/project/park" },
      ],
    },
    {
      id: "P-002",
      name: "巡检移动端升级",
      customer: "华东能源",
      projectManager: "王静",
      devManager: "赵明",
      stage: "开发中",
      progress: 56,
      site: "华东能源内网 / 10.20.4.0",
      backendFramework: "Java 11 / Spring Boot 2.7",
      database: "MySQL 5.7",
      members: [
        { role: "项目经理", name: "王静" },
        { role: "开发经理", name: "赵明" },
        { role: "前端", name: "吴森" },
        { role: "后端", name: "马骁" },
        { role: "实施", name: "周强" },
        { role: "设计", name: "杜可" },
      ],
      resources: [
        { type: "需求文档", name: "移动端升级需求清单", url: "\\\\fileserver\\projects\\P-002\\需求清单.xlsx" },
        { type: "设计蓝图", name: "巡检端交互稿", url: "https://lanhuapp.com/web/#/item/project-p002" },
      ],
      repositories: [
        { type: "前端 Git", name: "inspection-mobile", url: "https://git.example.com/energy/inspection-mobile.git" },
        { type: "后端 Git", name: "inspection-api", url: "https://git.example.com/energy/inspection-api.git" },
      ],
    },
    {
      id: "P-003",
      name: "驾驶舱统计改造",
      customer: "集团项目办",
      projectManager: "周然",
      devManager: "沈安",
      stage: "测试中",
      progress: 68,
      site: "集团预生产 / 172.20.4.0",
      backendFramework: "Java 17 / Spring Boot 3.1",
      database: "MySQL 8.0",
      members: [
        { role: "项目经理", name: "周然" },
        { role: "开发经理", name: "沈安" },
        { role: "前端", name: "乔一" },
        { role: "后端", name: "郑凯" },
        { role: "实施", name: "郑凯" },
        { role: "测试", name: "何敏" },
      ],
      resources: [
        { type: "需求文档", name: "统计口径变更说明", url: "\\\\fileserver\\projects\\P-003\\统计口径说明.docx" },
        { type: "接口文档", name: "驾驶舱接口说明", url: "https://yapi.example.com/project/dashboard" },
      ],
      repositories: [
        { type: "前端 Git", name: "dashboard-web", url: "https://git.example.com/group/dashboard-web.git" },
        { type: "后端 Git", name: "dashboard-service", url: "https://git.example.com/group/dashboard-service.git" },
      ],
    },
  ],
  changes: [
    {
      id: "CR-202605-001",
      projectId: "P-001",
      projectName: "智慧园区运营平台",
      requestedAt: "2026-05-07 10:30",
      requester: "江北产业园-运营部",
      type: "调整",
      isLateChange: true,
      content: "合同审批完成后新增导出字段：风险等级、责任班组、整改期限。",
      reason: "验收会提出补充管理口径。",
      impact: "前端报表、后端导出接口、SQL 模板",
      priority: "高",
      status: "已发包",
    },
    {
      id: "CR-202605-002",
      projectId: "P-001",
      projectName: "智慧园区运营平台",
      requestedAt: "2026-05-09 14:20",
      requester: "项目经理-李楠",
      type: "修复",
      isLateChange: false,
      content: "审批流程节点偶发重复提交，需要增加幂等校验。",
      reason: "测试环境复现并确认。",
      impact: "后端流程服务",
      priority: "中",
      status: "待发包",
    },
    {
      id: "CR-202605-003",
      projectId: "P-002",
      projectName: "巡检移动端升级",
      requestedAt: "2026-05-12 09:10",
      requester: "华东能源-设备科",
      type: "新增",
      isLateChange: true,
      content: "巡检记录增加语音备注，弱网环境下允许离线缓存。",
      reason: "现场巡检人员反馈打字效率低。",
      impact: "移动端、文件服务、同步任务",
      priority: "高",
      status: "开发中",
    },
    {
      id: "CR-202605-004",
      projectId: "P-003",
      projectName: "驾驶舱统计改造",
      requestedAt: "2026-05-13 16:40",
      requester: "集团项目办",
      type: "紧急",
      isLateChange: true,
      content: "验收节点统计口径改为按实际通过时间计算，并保留原口径对比。",
      reason: "领导汇报口径临时调整。",
      impact: "后端统计接口、驾驶舱页面、数据脚本",
      priority: "高",
      status: "待验证",
    },
  ],
  devChanges: [
    {
      id: "DEV-202605-001",
      changeId: "CR-202605-001",
      projectId: "P-001",
      type: "后端",
      content: "新增导出字段组装逻辑，并补充字段权限过滤。",
      owner: "后端-刘洋",
      completedAt: "2026-05-08 18:20",
      version: "backend-2.8.5",
      note: "关联 report_export_template.json",
    },
    {
      id: "DEV-202605-002",
      changeId: "CR-202605-001",
      projectId: "P-001",
      type: "前端",
      content: "风险报表表格增加三列，导出按钮复用权限状态。",
      owner: "前端-许琪",
      completedAt: "2026-05-09 11:00",
      version: "front-1.14.3",
      note: "页面路径 /risk/report",
    },
    {
      id: "DEV-202605-003",
      changeId: "CR-202605-002",
      projectId: "P-001",
      type: "后端",
      content: "流程提交接口增加 requestId 幂等表。",
      owner: "后端-刘洋",
      completedAt: "",
      version: "backend-2.8.6",
      note: "待联调",
    },
    {
      id: "DEV-202605-004",
      changeId: "CR-202605-004",
      projectId: "P-003",
      type: "数据库",
      content: "新增验收通过时间统计 SQL，并保留历史口径字段。",
      owner: "数据库-何敏",
      completedAt: "2026-05-14 20:30",
      version: "sql-20260514",
      note: "预生产已执行",
    },
    {
      id: "DEV-202605-005",
      changeId: "CR-202605-999",
      projectId: "P-002",
      type: "配置",
      content: "对象存储上传路径改为按项目隔离。",
      owner: "实施-周强",
      completedAt: "2026-05-15 15:30",
      version: "oss-config-20260515",
      note: "演示一条未关联需求的记录",
    },
  ],
  deployments: [
    {
      id: "PKG-20260510-01",
      projectId: "P-001",
      changeIds: ["CR-202605-001"],
      deployedAt: "2026-05-10 19:00",
      environment: "测试",
      reason: "风险报表字段调整测试发包。",
      frontendVersion: "front-1.14.3",
      backendVersion: "backend-2.8.5",
      middleware: "MySQL",
      siteIp: "10.16.8.31",
      port: "3306",
      configNote: "report_export_template.json 增加风险等级、班组、整改期限。",
      operator: "实施-唐敏",
      result: "待验证",
    },
    {
      id: "PKG-20260515-01",
      projectId: "P-003",
      changeIds: ["CR-202605-004", "CR-202605-404"],
      deployedAt: "2026-05-15 21:10",
      environment: "预生产",
      reason: "驾驶舱统计口径修复预生产验证。",
      frontendVersion: "front-2.3.1",
      backendVersion: "backend-3.1.0",
      middleware: "MySQL / RabbitMQ",
      siteIp: "172.20.4.18",
      port: "3306 / 5672",
      configNote: "新增验收节点统计 SQL；消息队列 routingKey 调整。",
      operator: "实施-郑凯",
      result: "失败",
    },
    {
      id: "PKG-20260516-01",
      projectId: "P-001",
      changeIds: ["CR-202605-002"],
      deployedAt: "2026-05-16 20:40",
      environment: "测试",
      reason: "流程幂等校验联调包。",
      frontendVersion: "",
      backendVersion: "backend-2.8.6",
      middleware: "Redis / MySQL",
      siteIp: "10.16.8.31",
      port: "6379 / 3306",
      configNote: "新增流程 requestId 缓存前缀。",
      operator: "实施-唐敏",
      result: "成功",
    },
  ],
  middlewares: [
    { id: "MW-001", projectId: "P-001", name: "Nginx", environment: "现场", host: "10.16.8.23", port: "8080", configPath: "/etc/nginx/conf.d/park.conf", note: "前端静态资源代理，后端 /api 转发到 18080。" },
    { id: "MW-002", projectId: "P-001", name: "MySQL", environment: "现场", host: "10.16.8.31", port: "3306", configPath: "/data/mysql/my.cnf", note: "库名 park_prod，导出模板表 report_template。" },
    { id: "MW-003", projectId: "P-001", name: "Redis", environment: "现场", host: "10.16.8.31", port: "6379", configPath: "/etc/redis/redis.conf", note: "流程幂等 requestId 缓存前缀 flow:req。" },
    { id: "MW-004", projectId: "P-003", name: "RabbitMQ", environment: "预生产", host: "172.20.4.18", port: "5672", configPath: "/etc/rabbitmq/rabbitmq.conf", note: "统计口径重算队列 dashboard.rebuild。" },
    { id: "MW-005", projectId: "P-002", name: "MinIO", environment: "测试", host: "10.20.4.12", port: "9000", configPath: "/opt/minio/config.json", note: "巡检语音文件按项目隔离 bucket。" },
  ],
};

export function cloneTrackerData(data: TrackerData = initialTrackerData): TrackerData {
  return {
    projects: data.projects.map((item) => ({
      ...item,
      members: item.members.map((member) => ({ ...member })),
      resources: item.resources.map((resource) => ({ ...resource })),
      repositories: item.repositories.map((repository) => ({ ...repository })),
    })),
    changes: data.changes.map((item) => ({ ...item })),
    devChanges: data.devChanges.map((item) => ({ ...item })),
    deployments: data.deployments.map((item) => ({ ...item, changeIds: [...item.changeIds] })),
    middlewares: data.middlewares.map((item) => ({ ...item })),
  };
}

export function getDashboardMetrics(data: TrackerData): DashboardMetrics {
  const changeIdsWithDev = new Set(data.devChanges.map((item) => item.changeId));
  const lateChangeCount = data.changes.filter((item) => item.isLateChange).length;
  const abnormalDeploymentCount = data.deployments.filter((item) => item.result !== "成功").length;
  return {
    projectCount: data.projects.length,
    changeCount: data.changes.length,
    devChangeCount: data.devChanges.length,
    deploymentCount: data.deployments.length,
    lateChangeCount,
    abnormalDeploymentCount,
    lateChangeRatio: ratio(lateChangeCount, data.changes.length),
    linkedChangeRatio: ratio(data.changes.filter((item) => changeIdsWithDev.has(item.id)).length, data.changes.length),
  };
}

export function getProjectStats(data: TrackerData) {
  return data.projects
    .map((project) => {
      const changes = data.changes.filter((item) => item.projectId === project.id);
      const deployments = data.deployments.filter((item) => item.projectId === project.id);
      const late = changes.filter((item) => item.isLateChange).length;
      const abnormal = deployments.filter((item) => item.result !== "成功").length;
      const sortedDeployments = deployments.map((item) => item.deployedAt).sort();
      return {
        project,
        changeCount: changes.length,
        deploymentCount: deployments.length,
        lateChangeRatio: ratio(late, changes.length),
        abnormalDeploymentCount: abnormal,
        latestDeploymentAt: sortedDeployments[sortedDeployments.length - 1] ?? "",
        averageLeadHours: averageLeadHours(changes, deployments),
      };
    })
    .sort((a, b) => b.changeCount - a.changeCount || b.deploymentCount - a.deploymentCount);
}

export function getProjectDetail(data: TrackerData, projectId: string) {
  const project = data.projects.find((item) => item.id === projectId) ?? data.projects[0];
  if (!project) return undefined;
  return {
    project,
    changes: data.changes.filter((item) => item.projectId === project.id),
    devChanges: data.devChanges.filter((item) => item.projectId === project.id),
    deployments: data.deployments.filter((item) => item.projectId === project.id),
    middlewares: data.middlewares.filter((item) => item.projectId === project.id),
    timeline: getProjectTimeline(data, project.id),
  };
}

export function getProjectTimeline(data: TrackerData, projectId: string): TimelineItem[] {
  const project = data.projects.find((item) => item.id === projectId);
  const projectNode: TimelineItem[] = project
    ? [
        {
          id: `${project.id}-init`,
          projectId,
          at: "2026-05-01 09:00",
          type: "项目",
          title: "项目初始化",
          body: `${project.customer} 项目建档，后端 ${project.backendFramework}，数据库 ${project.database}。`,
          meta: project.projectManager,
        },
      ]
    : [];
  const changeNodes = data.changes
    .filter((item) => item.projectId === projectId)
    .map<TimelineItem>((item) => ({
      id: item.id,
      projectId,
      at: item.requestedAt,
      type: "需求",
      title: item.isLateChange ? "后期需求变更" : "需求变更",
      body: item.content,
      meta: `${item.requester} / ${item.status}`,
    }));
  const devNodes = data.devChanges
    .filter((item) => item.projectId === projectId)
    .map<TimelineItem>((item) => ({
      id: item.id,
      projectId,
      at: item.completedAt || "2099-01-01 00:00",
      type: "开发",
      title: `${item.type}改动`,
      body: item.content,
      meta: `${item.owner} / ${item.version}`,
    }));
  const deployNodes = data.deployments
    .filter((item) => item.projectId === projectId)
    .map<TimelineItem>((item) => ({
      id: item.id,
      projectId,
      at: item.deployedAt,
      type: "发包",
      title: `${item.environment}发包`,
      body: item.reason,
      meta: `${item.operator} / ${item.result}`,
    }));
  const middlewareNodes = data.middlewares
    .filter((item) => item.projectId === projectId)
    .map<TimelineItem>((item) => ({
      id: item.id,
      projectId,
      at: "2026-05-02 10:00",
      type: "配置",
      title: `${item.name} 配置登记`,
      body: `${item.host}:${item.port}，${item.configPath}`,
      meta: item.environment,
    }));
  return [...projectNode, ...changeNodes, ...devNodes, ...deployNodes, ...middlewareNodes].sort((a, b) => a.at.localeCompare(b.at));
}

export function getTraceChains(data: TrackerData): TraceChain[] {
  return data.changes.map((change) => ({
    project: data.projects.find((project) => project.id === change.projectId),
    change,
    devChanges: data.devChanges.filter((item) => item.changeId === change.id),
    deployments: data.deployments.filter((deployment) => deployment.changeIds.includes(change.id)),
  }));
}

export function getRelationshipGaps(data: TrackerData) {
  const projectIds = new Set(data.projects.map((item) => item.id));
  const changeIds = new Set(data.changes.map((item) => item.id));
  return {
    changesWithoutProject: data.changes.filter((item) => !projectIds.has(item.projectId)),
    devChangesWithoutChange: data.devChanges.filter((item) => !changeIds.has(item.changeId)),
    deploymentsWithoutChange: data.deployments.flatMap((deployment) =>
      deployment.changeIds
        .filter((changeId) => !changeIds.has(changeId))
        .map((changeId) => ({ deploymentId: deployment.id, changeId })),
    ),
  };
}

export function upsertProject(data: TrackerData, partial: Partial<Project>): TrackerData {
  const id = partial.id?.trim() || `P-${String(data.projects.length + 1).padStart(3, "0")}`;
  const existing = data.projects.find((item) => item.id === id);
  const project: Project = {
    ...(existing ?? emptyProject(id)),
    ...partial,
    id,
    name: partial.name?.trim() || existing?.name || "新项目",
    customer: partial.customer?.trim() || existing?.customer || "客户名称",
    projectManager: partial.projectManager?.trim() || existing?.projectManager || "项目经理",
    devManager: partial.devManager?.trim() || existing?.devManager || "开发经理",
    site: partial.site?.trim() || existing?.site || "现场环境",
    backendFramework: partial.backendFramework?.trim() || existing?.backendFramework || "Java 17 / Spring Boot 3.x",
    database: partial.database?.trim() || existing?.database || "MySQL 8.0",
  };
  const projects = existing ? data.projects.map((item) => (item.id === id ? project : item)) : [project, ...data.projects];
  return { ...data, projects };
}

export function deleteProject(data: TrackerData, projectId: string): TrackerData {
  return {
    projects: data.projects.filter((item) => item.id !== projectId),
    changes: data.changes.filter((item) => item.projectId !== projectId),
    devChanges: data.devChanges.filter((item) => item.projectId !== projectId),
    deployments: data.deployments.filter((item) => item.projectId !== projectId),
    middlewares: data.middlewares.filter((item) => item.projectId !== projectId),
  };
}

export function createRequirementChange(data: TrackerData, partial: Partial<RequirementChange>): RequirementChange {
  const project = data.projects.find((item) => item.id === partial.projectId);
  return {
    id: partial.id?.trim() || `CR-${Date.now()}`,
    projectId: partial.projectId?.trim() || project?.id || data.projects[0]?.id || "",
    projectName: project?.name || partial.projectName?.trim() || data.projects[0]?.name || "",
    requestedAt: partial.requestedAt?.trim() || nowText(),
    requester: partial.requester?.trim() || "项目经理登记",
    type: partial.type ?? "调整",
    isLateChange: Boolean(partial.isLateChange),
    content: partial.content?.trim() || "补充需求变更内容",
    reason: partial.reason?.trim() || "项目过程调整",
    impact: partial.impact?.trim() || "前端、后端",
    priority: partial.priority ?? "中",
    status: partial.status ?? "待评估",
  };
}

export function createDeployment(data: TrackerData, partial: Partial<Deployment>): Deployment {
  const project = data.projects.find((item) => item.id === partial.projectId) ?? data.projects[0];
  const fallbackChange = data.changes.find((item) => item.projectId === project?.id);
  return {
    id: partial.id?.trim() || `PKG-${Date.now()}`,
    projectId: partial.projectId?.trim() || project?.id || "",
    changeIds: partial.changeIds?.length ? partial.changeIds : fallbackChange ? [fallbackChange.id] : [],
    deployedAt: partial.deployedAt?.trim() || nowText(),
    environment: partial.environment ?? "测试",
    reason: partial.reason?.trim() || "项目需求变更发包",
    frontendVersion: partial.frontendVersion?.trim() || "",
    backendVersion: partial.backendVersion?.trim() || "",
    middleware: partial.middleware?.trim() || "Nginx",
    siteIp: partial.siteIp?.trim() || "",
    port: partial.port?.trim() || "",
    configNote: partial.configNote?.trim() || "",
    operator: partial.operator?.trim() || "实施人员",
    result: partial.result ?? "待验证",
  };
}

export function parseTrackerRows(kind: keyof TrackerData, rows: Record<string, unknown>[], current: TrackerData): TrackerData {
  const next = cloneTrackerData(current);
  if (kind === "projects") {
    next.projects = rows.map(rowToProject).filter((item) => item.id);
  }
  if (kind === "changes") {
    next.changes = rows.map((row) => createRequirementChange(next, rowToChange(row))).filter((item) => item.id);
  }
  if (kind === "devChanges") {
    next.devChanges = rows.map(rowToDevChange).filter((item) => item.id);
  }
  if (kind === "deployments") {
    next.deployments = rows.map((row) => createDeployment(next, rowToDeployment(row))).filter((item) => item.id);
  }
  return next;
}

function emptyProject(id: string): Project {
  return {
    id,
    name: "",
    customer: "",
    projectManager: "",
    devManager: "",
    stage: "需求确认",
    progress: 0,
    site: "",
    backendFramework: "Java 17 / Spring Boot 3.x",
    database: "MySQL 8.0",
    members: [],
    resources: [],
    repositories: [],
  };
}

function rowToProject(row: Record<string, unknown>): Project {
  const id = firstText(row, ["项目编号", "项目ID", "项目 id"]);
  return {
    ...emptyProject(id),
    id,
    name: firstText(row, ["项目名称", "项目"]),
    customer: firstText(row, ["客户名称", "客户"]),
    projectManager: firstText(row, ["项目经理", "PM"]),
    devManager: firstText(row, ["开发经理"]),
    stage: enumValue(firstText(row, ["当前阶段", "阶段"]), ["需求确认", "开发中", "测试中", "待部署", "已上线"] as const, "开发中"),
    progress: parsePercent(firstText(row, ["项目进度", "进度"])),
    site: firstText(row, ["现场环境", "环境", "现场"]),
  };
}

function rowToChange(row: Record<string, unknown>): Partial<RequirementChange> {
  return {
    id: firstText(row, ["变更编号", "需求编号"]),
    projectId: firstText(row, ["项目编号", "项目ID"]),
    projectName: firstText(row, ["项目名称"]),
    requestedAt: firstText(row, ["提出时间", "变更时间", "提交时间"]),
    requester: firstText(row, ["提出客户/人员", "提出人", "客户要求人"]),
    type: enumValue(firstText(row, ["变更类型", "类型"]), ["新增", "调整", "修复", "紧急"] as const, "调整"),
    isLateChange: ["是", "true", "1", "yes"].includes(firstText(row, ["是否后期变更", "后期变更"]).toLowerCase()),
    content: firstText(row, ["变更内容", "需求改了什么", "客户要求"]),
    reason: firstText(row, ["变更原因", "原因"]),
    impact: firstText(row, ["影响范围", "影响模块"]),
    priority: enumValue(firstText(row, ["优先级"]), ["高", "中", "低"] as const, "中"),
    status: enumValue(firstText(row, ["当前状态", "状态"]), ["待评估", "开发中", "待发包", "待验证", "已发包", "已关闭"] as const, "待评估"),
  };
}

function rowToDevChange(row: Record<string, unknown>): DevelopmentChange {
  return {
    id: firstText(row, ["改动编号", "开发改动编号"]),
    changeId: firstText(row, ["关联变更编号", "变更编号"]),
    projectId: firstText(row, ["项目编号", "项目ID"]),
    type: enumValue(firstText(row, ["改动类型", "类型"]), ["前端", "后端", "数据库", "配置", "设计", "实施"] as const, "后端"),
    content: firstText(row, ["改动内容", "代码改了什么", "详细说明"]),
    owner: firstText(row, ["负责人", "开发人员"]),
    completedAt: firstText(row, ["完成时间", "提交时间"]),
    version: firstText(row, ["关联版本/分支", "版本", "分支"]),
    note: firstText(row, ["备注"]),
  };
}

function rowToDeployment(row: Record<string, unknown>): Partial<Deployment> {
  return {
    id: firstText(row, ["发包编号", "部署编号"]),
    projectId: firstText(row, ["项目编号", "项目ID"]),
    changeIds: firstText(row, ["关联变更编号", "变更编号"])
      .split(/[,，、\s]+/)
      .map((item) => item.trim())
      .filter(Boolean),
    deployedAt: firstText(row, ["发包时间", "部署时间"]),
    environment: enumValue(firstText(row, ["发包环境", "部署环境", "环境"]), ["测试", "预生产", "现场"] as const, "测试"),
    reason: firstText(row, ["发包原因", "部署原因", "原因"]),
    frontendVersion: firstText(row, ["前端包版本", "前端版本"]),
    backendVersion: firstText(row, ["后端包版本", "后端版本"]),
    middleware: firstText(row, ["中间件名称", "中间件"]),
    siteIp: firstText(row, ["现场 IP", "现场IP", "IP"]),
    port: firstText(row, ["端口"]),
    configNote: firstText(row, ["配置文件说明", "配置说明", "配置文件"]),
    operator: firstText(row, ["实施人员", "部署人员"]),
    result: enumValue(firstText(row, ["部署结果", "发包结果", "结果"]), ["成功", "失败", "回滚", "待验证"] as const, "待验证"),
  };
}

function firstText(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }
  return "";
}

function enumValue<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function ratio(part: number, total: number) {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

function averageLeadHours(changes: RequirementChange[], deployments: Deployment[]) {
  const values = changes
    .map((change) => {
      const firstDeployment = deployments
        .filter((deployment) => deployment.changeIds.includes(change.id))
        .map((deployment) => deployment.deployedAt)
        .sort()[0];
      if (!firstDeployment) return null;
      const start = new Date(change.requestedAt.replace(" ", "T")).getTime();
      const end = new Date(firstDeployment.replace(" ", "T")).getTime();
      return Number.isFinite(start) && Number.isFinite(end) ? Math.max(0, (end - start) / 36e5) : null;
    })
    .filter((item): item is number => item !== null);
  return values.length === 0 ? 0 : Math.round(values.reduce((sum, item) => sum + item, 0) / values.length);
}

function parsePercent(value: string) {
  const numeric = Number(value.replace("%", ""));
  return Number.isFinite(numeric) ? Math.max(0, Math.min(100, numeric)) : 0;
}

function nowText() {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}
