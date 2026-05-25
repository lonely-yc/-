import { useMemo, useState } from "react";
import {
  backendEndpoints,
  cloneTrackerData,
  deleteProject,
  getDashboardMetrics,
  getProjectDetail,
  getProjectStats,
  initialTrackerData,
  upsertProject,
  type BackendEndpoint,
  type MiddlewareConfig,
  type Project,
  type TrackerData,
} from "../changeTracker";
import { Layout, type ViewKey } from "./Layout";

type ProjectFormState = Pick<Project, "id" | "name" | "customer" | "projectManager" | "devManager" | "stage" | "progress" | "site" | "backendFramework" | "database">;

function formFromProject(project?: Project): ProjectFormState {
  return {
    id: project?.id ?? "",
    name: project?.name ?? "",
    customer: project?.customer ?? "",
    projectManager: project?.projectManager ?? "",
    devManager: project?.devManager ?? "",
    stage: project?.stage ?? "需求确认",
    progress: project?.progress ?? 0,
    site: project?.site ?? "",
    backendFramework: project?.backendFramework ?? "Java 17 / Spring Boot 3.x",
    database: project?.database ?? "MySQL 8.0",
  };
}

export function ChangeDeploymentApp() {
  const [activeView, setActiveView] = useState<ViewKey>("projects");
  const [data, setData] = useState<TrackerData>(() => cloneTrackerData());
  const [selectedProjectId, setSelectedProjectId] = useState("P-001");
  const [selectedMiddlewareId, setSelectedMiddlewareId] = useState("MW-001");
  const [editingProjectId, setEditingProjectId] = useState<string | null>("P-001");
  const [projectForm, setProjectForm] = useState<ProjectFormState>(() => formFromProject(data.projects[0]));

  const metrics = useMemo(() => getDashboardMetrics(data), [data]);
  const projectStats = useMemo(() => getProjectStats(data), [data]);
  const detail = useMemo(() => getProjectDetail(data, selectedProjectId), [data, selectedProjectId]);
  const selectedMiddleware = data.middlewares.find((item) => item.id === selectedMiddlewareId) ?? detail?.middlewares[0] ?? data.middlewares[0];
  const recordCount = data.projects.length + data.changes.length + data.devChanges.length + data.deployments.length + data.middlewares.length;

  function selectProject(project: Project) {
    setSelectedProjectId(project.id);
    setEditingProjectId(project.id);
    setProjectForm(formFromProject(project));
    const middleware = data.middlewares.find((item) => item.projectId === project.id);
    if (middleware) setSelectedMiddlewareId(middleware.id);
  }

  function saveProject() {
    setData((current) => upsertProject(current, projectForm));
    setSelectedProjectId(projectForm.id || `P-${String(data.projects.length + 1).padStart(3, "0")}`);
    setEditingProjectId(projectForm.id || null);
  }

  function removeProject(projectId: string) {
    setData((current) => deleteProject(current, projectId));
    const next = data.projects.find((item) => item.id !== projectId);
    if (next) {
      setSelectedProjectId(next.id);
      setProjectForm(formFromProject(next));
      setEditingProjectId(next.id);
    }
  }

  function resetMock() {
    const next = cloneTrackerData(initialTrackerData);
    setData(next);
    setSelectedProjectId(next.projects[0]?.id ?? "");
    setSelectedMiddlewareId(next.middlewares[0]?.id ?? "");
    setEditingProjectId(next.projects[0]?.id ?? null);
    setProjectForm(formFromProject(next.projects[0]));
  }

  return (
    <Layout activeView={activeView} onViewChange={setActiveView} recordCount={recordCount}>
      {activeView === "projects" && (
        <ProjectsPage
          data={data}
          detail={detail}
          selectedProjectId={selectedProjectId}
          editingProjectId={editingProjectId}
          form={projectForm}
          onFormChange={setProjectForm}
          onNewProject={() => {
            setEditingProjectId(null);
            setProjectForm(formFromProject());
          }}
          onReset={resetMock}
          onSaveProject={saveProject}
          onSelectProject={selectProject}
          onDeleteProject={removeProject}
          onOpenMiddleware={(middleware) => {
            setSelectedMiddlewareId(middleware.id);
            setActiveView("middleware");
          }}
        />
      )}
      {activeView === "dashboard" && <DashboardPage metrics={metrics} projectStats={projectStats} data={data} onSelectProject={selectProject} />}
      {activeView === "changes" && <ChangesPage data={data} />}
      {activeView === "deployments" && <DeploymentsPage data={data} />}
      {activeView === "timeline" && <TimelinePage detail={detail} projects={data.projects} onProjectChange={setSelectedProjectId} />}
      {activeView === "middleware" && (
        <MiddlewarePage
          middlewares={data.middlewares}
          selected={selectedMiddleware}
          selectedProjectId={selectedProjectId}
          onSelect={(middleware) => {
            setSelectedMiddlewareId(middleware.id);
            setSelectedProjectId(middleware.projectId);
          }}
        />
      )}
      {activeView === "apis" && <ApiPage endpoints={backendEndpoints} />}
    </Layout>
  );
}

function ProjectsPage({
  data,
  detail,
  selectedProjectId,
  editingProjectId,
  form,
  onFormChange,
  onNewProject,
  onReset,
  onSaveProject,
  onSelectProject,
  onDeleteProject,
  onOpenMiddleware,
}: {
  data: TrackerData;
  detail: ReturnType<typeof getProjectDetail>;
  selectedProjectId: string;
  editingProjectId: string | null;
  form: ProjectFormState;
  onFormChange: (form: ProjectFormState) => void;
  onNewProject: () => void;
  onReset: () => void;
  onSaveProject: () => void;
  onSelectProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onOpenMiddleware: (middleware: MiddlewareConfig) => void;
}) {
  return (
    <div className="portfolio-grid">
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">项目主档</p>
            <h2>项目信息维护</h2>
            <span>新增、修改、删除项目，初始化演示数据，点击项目查看完整交付档案。</span>
          </div>
          <div className="button-row">
            <button type="button" className="ghost-button" onClick={onReset}>初始化</button>
            <button type="button" onClick={onNewProject}>新增项目</button>
          </div>
        </div>
        <div className="project-list">
          {data.projects.map((project) => (
            <article className={`project-card ${project.id === selectedProjectId ? "active" : ""}`} key={project.id}>
              <button type="button" className="project-main" onClick={() => onSelectProject(project)}>
                <b>{project.name}</b>
                <span>{project.customer} / {project.stage}</span>
                <i><em style={{ width: `${project.progress}%` }} /></i>
              </button>
              <div className="project-actions">
                <button type="button" className="ghost-button" onClick={() => onSelectProject(project)}>编辑</button>
                <button type="button" className="danger-button" onClick={() => onDeleteProject(project.id)}>删除</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{editingProjectId ? "编辑项目" : "新增项目"}</p>
            <h2>{form.name || "项目基础信息"}</h2>
          </div>
          <button type="button" onClick={onSaveProject}>保存项目</button>
        </div>
        <ProjectForm form={form} onChange={onFormChange} />
      </section>

      {detail && (
        <section className="panel detail-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">项目详情</p>
              <h2>{detail.project.name}</h2>
              <span>{detail.project.backendFramework} / {detail.project.database}</span>
            </div>
          </div>
          <ProjectDetail detail={detail} onOpenMiddleware={onOpenMiddleware} />
        </section>
      )}
    </div>
  );
}

function ProjectForm({ form, onChange }: { form: ProjectFormState; onChange: (form: ProjectFormState) => void }) {
  function patch(next: Partial<ProjectFormState>) {
    onChange({ ...form, ...next });
  }

  return (
    <div className="form-grid">
      <label>项目编号<input value={form.id} onChange={(event) => patch({ id: event.target.value })} placeholder="P-004" /></label>
      <label>项目名称<input value={form.name} onChange={(event) => patch({ name: event.target.value })} placeholder="项目名称" /></label>
      <label>客户名称<input value={form.customer} onChange={(event) => patch({ customer: event.target.value })} placeholder="客户名称" /></label>
      <label>项目经理<input value={form.projectManager} onChange={(event) => patch({ projectManager: event.target.value })} /></label>
      <label>开发经理<input value={form.devManager} onChange={(event) => patch({ devManager: event.target.value })} /></label>
      <label>
        当前阶段
        <select value={form.stage} onChange={(event) => patch({ stage: event.target.value as Project["stage"] })}>
          {["需求确认", "开发中", "测试中", "待部署", "已上线"].map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label>进度<input type="number" min="0" max="100" value={form.progress} onChange={(event) => patch({ progress: Number(event.target.value) })} /></label>
      <label>现场环境<input value={form.site} onChange={(event) => patch({ site: event.target.value })} /></label>
      <label>后端框架<input value={form.backendFramework} onChange={(event) => patch({ backendFramework: event.target.value })} /></label>
      <label>数据库<input value={form.database} onChange={(event) => patch({ database: event.target.value })} /></label>
    </div>
  );
}

function ProjectDetail({ detail, onOpenMiddleware }: { detail: NonNullable<ReturnType<typeof getProjectDetail>>; onOpenMiddleware: (middleware: MiddlewareConfig) => void }) {
  return (
    <div className="detail-grid">
      <InfoBlock title="项目人员">
        <div className="tag-cloud">
          {detail.project.members.map((member) => <span key={`${member.role}-${member.name}`}>{member.role}：{member.name}</span>)}
        </div>
      </InfoBlock>
      <InfoBlock title="资料文档">
        <ResourceList items={detail.project.resources.map((item) => `${item.type} / ${item.name} / ${item.url}`)} />
      </InfoBlock>
      <InfoBlock title="代码与蓝图">
        <ResourceList items={detail.project.repositories.map((item) => `${item.type} / ${item.name} / ${item.url}`)} />
      </InfoBlock>
      <InfoBlock title="中间件">
        <div className="tag-cloud">
          {detail.middlewares.map((item) => (
            <button type="button" key={item.id} onClick={() => onOpenMiddleware(item)}>
              {item.name} {item.host}:{item.port}
            </button>
          ))}
        </div>
      </InfoBlock>
      <InfoBlock title="最近时间线">
        <TimelineList items={detail.timeline.slice(0, 6)} />
      </InfoBlock>
    </div>
  );
}

function DashboardPage({ metrics, projectStats, data, onSelectProject }: { metrics: ReturnType<typeof getDashboardMetrics>; projectStats: ReturnType<typeof getProjectStats>; data: TrackerData; onSelectProject: (project: Project) => void }) {
  const cards = [
    ["项目数", metrics.projectCount, "当前项目主档"],
    ["需求变更", metrics.changeCount, `后期变更 ${metrics.lateChangeCount} 条`],
    ["开发改动", metrics.devChangeCount, `${metrics.linkedChangeRatio}% 已关联改动`],
    ["发包次数", metrics.deploymentCount, "测试 / 预生产 / 现场"],
    ["中间件", data.middlewares.length, "Nginx / MySQL / Redis"],
    ["部署异常", metrics.abnormalDeploymentCount, "失败 / 回滚 / 待验证"],
  ];

  return (
    <div className="tracker-stack">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">项目经理视角</p>
          <h2>一个项目，从资料、代码、变更到现场配置都能追到</h2>
          <p>先把项目信息建完整，再把需求改动、代码改动、发包部署和中间件现场配置串起来。</p>
        </div>
      </section>
      <section className="metric-grid">
        {cards.map(([label, value, hint]) => (
          <article className="metric-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{hint}</small>
          </article>
        ))}
      </section>
      <section className="panel">
        <div className="section-heading">
          <h2>项目概览</h2>
          <span>点击项目进入主档详情</span>
        </div>
        <div className="summary-grid">
          {projectStats.map((item) => (
            <button type="button" className="summary-card" key={item.project.id} onClick={() => onSelectProject(item.project)}>
              <b>{item.project.name}</b>
              <span>{item.project.stage} / {item.project.progress}%</span>
              <small>变更 {item.changeCount}，发包 {item.deploymentCount}，异常 {item.abnormalDeploymentCount}</small>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function ChangesPage({ data }: { data: TrackerData }) {
  const projectName = new Map(data.projects.map((item) => [item.id, item.name]));
  return (
    <LedgerPage title="需求与开发改动" description="按项目查看客户需求变更和前后端、数据库、配置改动。">
      <SimpleTable
        columns={["类型", "编号", "项目", "时间", "人员", "状态/版本", "内容"]}
        rows={[
          ...data.changes.map((item) => ["需求", item.id, item.projectName, item.requestedAt, item.requester, item.status, item.content]),
          ...data.devChanges.map((item) => ["开发", item.id, projectName.get(item.projectId) ?? item.projectId, item.completedAt || "未完成", item.owner, item.version, item.content]),
        ]}
      />
    </LedgerPage>
  );
}

function DeploymentsPage({ data }: { data: TrackerData }) {
  const projectName = new Map(data.projects.map((item) => [item.id, item.name]));
  return (
    <LedgerPage title="发包部署" description="记录环境、版本、中间件、现场 IP、端口、部署结果。">
      <SimpleTable
        columns={["发包编号", "项目", "环境", "时间", "关联变更", "版本", "现场配置", "结果"]}
        rows={data.deployments.map((item) => [
          item.id,
          projectName.get(item.projectId) ?? item.projectId,
          item.environment,
          item.deployedAt,
          item.changeIds.join("，"),
          `${item.frontendVersion || "-"} / ${item.backendVersion || "-"}`,
          `${item.middleware} / ${item.siteIp}:${item.port}`,
          item.result,
        ])}
      />
    </LedgerPage>
  );
}

function TimelinePage({ detail, projects, onProjectChange }: { detail: ReturnType<typeof getProjectDetail>; projects: Project[]; onProjectChange: (projectId: string) => void }) {
  return (
    <div className="tracker-stack">
      <section className="panel trace-filter">
        <div>
          <p className="eyebrow">项目时间线</p>
          <h2>{detail?.project.name ?? "选择项目"}</h2>
        </div>
        <select value={detail?.project.id ?? ""} onChange={(event) => onProjectChange(event.target.value)}>
          {projects.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}
        </select>
      </section>
      <section className="panel">
        {detail ? <TimelineList items={detail.timeline} /> : <p className="empty-text">暂无项目</p>}
      </section>
    </div>
  );
}

function MiddlewarePage({ middlewares, selected, selectedProjectId, onSelect }: { middlewares: MiddlewareConfig[]; selected?: MiddlewareConfig; selectedProjectId: string; onSelect: (middleware: MiddlewareConfig) => void }) {
  const projectMiddlewares = middlewares.filter((item) => item.projectId === selectedProjectId);
  return (
    <div className="middleware-layout">
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">中间件标签</p>
            <h2>Nginx / MySQL / Redis / RabbitMQ</h2>
            <span>点击标签查看现场 IP、端口、配置文件路径和说明。</span>
          </div>
        </div>
        <div className="middleware-tags">
          {(projectMiddlewares.length ? projectMiddlewares : middlewares).map((item) => (
            <button type="button" className={selected?.id === item.id ? "active" : ""} key={item.id} onClick={() => onSelect(item)}>
              {item.name}
              <small>{item.environment}</small>
            </button>
          ))}
        </div>
      </section>
      <section className="panel">
        {selected && (
          <div className="middleware-detail">
            <p className="eyebrow">{selected.environment}</p>
            <h2>{selected.name}</h2>
            <dl>
              <div><dt>现场 IP</dt><dd>{selected.host}</dd></div>
              <div><dt>端口</dt><dd>{selected.port}</dd></div>
              <div><dt>配置文件</dt><dd>{selected.configPath}</dd></div>
              <div><dt>说明</dt><dd>{selected.note}</dd></div>
            </dl>
          </div>
        )}
      </section>
    </div>
  );
}

function ApiPage({ endpoints }: { endpoints: BackendEndpoint[] }) {
  return (
    <div className="tracker-stack">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">后端接口补充</p>
          <h2>Java Spring Boot + MySQL 接口草案</h2>
          <p>后端建议按项目主档、人员资料、需求变更、开发改动、发包部署、中间件配置拆模块。数据库主表使用 project、project_member、project_resource、project_repository、requirement_change、dev_change、deployment_record、middleware_config。</p>
        </div>
      </section>
      <section className="api-grid">
        {endpoints.map((item) => <ApiCard endpoint={item} key={`${item.method}-${item.path}`} />)}
      </section>
    </div>
  );
}

function ApiCard({ endpoint }: { endpoint: BackendEndpoint }) {
  return (
    <article className="api-card">
      <span>{endpoint.module}</span>
      <h3><b>{endpoint.method}</b> {endpoint.path}</h3>
      <p>{endpoint.title}：{endpoint.description}</p>
    </article>
  );
}

function LedgerPage({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">业务台账</p>
          <h2>{title}</h2>
          <span>{description}</span>
        </div>
      </div>
      {children}
    </section>
  );
}

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="info-block">
      <h3>{title}</h3>
      {children}
    </article>
  );
}

function ResourceList({ items }: { items: string[] }) {
  return (
    <ul className="resource-list">
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}

function TimelineList({ items }: { items: NonNullable<ReturnType<typeof getProjectDetail>>["timeline"] }) {
  return (
    <div className="timeline-list">
      {items.map((item) => (
        <article className="timeline-item" key={item.id}>
          <time>{item.at}</time>
          <div>
            <b>{item.type} / {item.title}</b>
            <p>{item.body}</p>
            <span>{item.meta}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

function SimpleTable({ columns, rows }: { columns: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="table-empty">暂无记录</td></tr>
          ) : (
            rows.map((row, index) => (
              <tr key={index}>
                {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
