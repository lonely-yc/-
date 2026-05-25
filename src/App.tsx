import { useMemo, useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Database,
  Edit3,
  FileText,
  FolderOpen,
  Home,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

type Role = "PM" | "DEV_MANAGER" | "FRONTEND" | "BACKEND" | "IMPLEMENTER" | "DESIGNER" | "TESTER";
type ProjectStatus = "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";
type PageKey = "home" | "projects" | "people";

type Person = {
  id: number;
  employeeNo: string;
  username: string;
  realName: string;
  phone: string;
  role: Role;
};

type Project = {
  id: number;
  name: string;
  code: string;
  customer: string;
  manager: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
};

type RepositoryLink = { id: string; name: string; branch: string; url: string };
type ProjectDocument = { id: string; name: string; fileName: string; size: string };
type ChangeRecord = { id: string; date: string; requester: string; summary: string; backend: string; frontend: string };
type DeliveryRecord = { id: string; date: string; version: string; reason: string; packageName: string; scope: string; operator: string };
type MiddlewareConfig = {
  id: string;
  environment: string;
  name: string;
  host: string;
  port: string;
  configPath: string;
  configFileName?: string;
  remark?: string;
  content?: string;
};
type TimelineEvent = { id: string; date: string; title: string; actor: string; detail: string; type: "milestone" | "change" | "delivery" | "middleware" | "member" | "issue" };
type ProjectMember = { id: string; employeeNo: string; realName: string; phone: string; role: Role; joinedAt: string };
type ProjectNote = { id: string; title: string; occurredAt: string; contact: string; content: string };

type ProjectInsight = {
  repositories: RepositoryLink[];
  documents: ProjectDocument[];
  changes: ChangeRecord[];
  deliveries: DeliveryRecord[];
  middlewares: MiddlewareConfig[];
  timeline: TimelineEvent[];
  members: ProjectMember[];
  notes: ProjectNote[];
};

const roleLabels: Record<Role, string> = {
  PM: "项目经理",
  DEV_MANAGER: "开发经理",
  FRONTEND: "前端",
  BACKEND: "后端",
  IMPLEMENTER: "实施",
  DESIGNER: "设计",
  TESTER: "测试",
};

const statusLabels: Record<ProjectStatus, string> = {
  PLANNING: "规划中",
  IN_PROGRESS: "进行中",
  COMPLETED: "已完成",
  ARCHIVED: "已归档",
};

const roleOptions = Object.keys(roleLabels) as Role[];
const statusOptions = Object.keys(statusLabels) as ProjectStatus[];
const middlewareTypes = ["MySQL", "Redis", "MQ", "Nginx", "ElasticSearch", "MinIO", "Other"];
const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const today = () => new Date().toISOString().slice(0, 10);

const initialPeople: Person[] = [
  { id: 1, employeeNo: "PM001", username: "linan", realName: "李楠", phone: "13800000001", role: "PM" },
  { id: 2, employeeNo: "DEV001", username: "chenyue", realName: "陈越", phone: "13800000002", role: "DEV_MANAGER" },
  { id: 3, employeeNo: "FE001", username: "xuqi", realName: "许琪", phone: "13800000003", role: "FRONTEND" },
  { id: 4, employeeNo: "BE001", username: "liuyang", realName: "刘洋", phone: "13800000004", role: "BACKEND" },
  { id: 5, employeeNo: "IM001", username: "huifeng", realName: "惠晓峰", phone: "13800000005", role: "IMPLEMENTER" },
];

const initialProjects: Project[] = [
  { id: 1, name: "停电智能体", code: "POWER-AI-2026-01", customer: "鲁软", manager: "李楠", status: "IN_PROGRESS", startDate: "2026-05-21", endDate: "2026-06-30", description: "停电原因回填、现场发包、运维中台联动。" },
  { id: 2, name: "巡检移动端升级", code: "MOBILE-OPS-2026-02", customer: "华东能源", manager: "陈越", status: "PLANNING", startDate: "2026-05-01", endDate: "2026-06-15", description: "巡检移动端离线缓存、弱网提交和页面升级。" },
  { id: 3, name: "园区运营平台", code: "PARK-HUB-2026-03", customer: "江北产业园", manager: "李楠", status: "COMPLETED", startDate: "2026-04-12", endDate: "2026-05-20", description: "园区运行态势、告警聚合和综合看板。" },
];

const baseInsight: ProjectInsight = {
  repositories: [
    { id: "repo-1", name: "后端服务", branch: "main", url: "http://192.168.7.129/backend" },
    { id: "repo-2", name: "前端页面", branch: "release", url: "http://192.168.7.129/frontend" },
  ],
  documents: [{ id: "doc-1", name: "需求规格说明", fileName: "requirements.docx", size: "2.4 MB" }],
  changes: [{ id: "change-1", date: "2026-05-24 10:30", requester: "国网运维中心", summary: "增加停电原因回填和 AI 研判复核入口。", backend: "新增 cause_review 表与复核接口。", frontend: "停电详情页新增复核抽屉和二次确认按钮。" }],
  deliveries: [{ id: "delivery-1", date: "2026-05-26 20:10", version: "v1.3.0", reason: "首轮现场联调", packageName: "power-agent-release-1.3.0.zip", scope: "前后端联调包、Redis 初始化脚本、Nginx 代理配置", operator: "陈越" }],
  middlewares: [
    { id: "mw-1", environment: "正式", name: "MySQL", host: "10.10.20.15", port: "3306", configPath: "/etc/project/mysql.cnf", configFileName: "mysql.cnf", remark: "业务库", content: "[mysqld]\nport=3306\nmax_connections=500" },
    { id: "mw-2", environment: "测试", name: "Redis", host: "10.10.20.18", port: "6379", configPath: "/etc/redis/redis.conf", configFileName: "redis.conf", remark: "缓存与任务锁", content: "bind 10.10.20.18\nport 6379" },
    { id: "mw-3", environment: "测试", name: "Nginx", host: "10.10.20.18", port: "80", configPath: "E:\\Nginx\\nginx-1.18.0\\conf\\nginx.conf", configFileName: "nginx.conf", remark: "前端代理", content: "location /api { proxy_pass http://127.0.0.1:18081; }" },
  ],
  timeline: [
    { id: "tl-1", date: "2026-05-21 09:30", title: "项目创建", actor: "李楠", detail: "明确现场部署窗口与第一版范围。", type: "milestone" },
    { id: "tl-2", date: "2026-05-24 10:30", title: "需求变更", actor: "国网运维中心", detail: "增加停电原因回填和 AI 研判复核入口。", type: "change" },
    { id: "tl-3", date: "2026-05-26 20:10", title: "发包部署 v1.3.0", actor: "陈越", detail: "首轮现场联调，完成接口联调。", type: "delivery" },
  ],
  members: [
    { id: "m-1", employeeNo: "PM001", realName: "李楠", phone: "13800000001", role: "PM", joinedAt: "2026-05-21" },
    { id: "m-2", employeeNo: "DEV001", realName: "陈越", phone: "13800000002", role: "DEV_MANAGER", joinedAt: "2026-05-21" },
    { id: "m-3", employeeNo: "FE001", realName: "许琪", phone: "13800000003", role: "FRONTEND", joinedAt: "2026-05-22" },
  ],
  notes: [{ id: "note-1", title: "数据中台停电工单主题申请", occurredAt: "2026-05-22 10:30", contact: "王工", content: "OA 提交数据目录申请单，开通数据中台 8088 端口。" }],
};

function emptyInsight(): ProjectInsight {
  return { repositories: [], documents: [], changes: [], deliveries: [], middlewares: [], timeline: [], members: [], notes: [] };
}

export default function App() {
  const [page, setPage] = useState<PageKey>("projects");
  const [people, setPeople] = useState(initialPeople);
  const [projects, setProjects] = useState(initialProjects);
  const [insights, setInsights] = useState<Record<number, ProjectInsight>>({ 1: baseInsight, 2: emptyInsight(), 3: emptyInsight() });
  const [selectedId, setSelectedId] = useState(1);
  const [projectModal, setProjectModal] = useState<Project | null>(null);
  const [personModal, setPersonModal] = useState<Person | null>(null);
  const [detailProject, setDetailProject] = useState<Project | null>(null);

  const selectedProject = projects.find((project) => project.id === selectedId) ?? projects[0];
  const selectedInsight = insights[selectedProject?.id] ?? emptyInsight();

  const logs = useMemo(() => {
    return projects
      .flatMap((project) => (insights[project.id]?.timeline ?? []).map((event) => ({ project, event })))
      .sort((a, b) => b.event.date.localeCompare(a.event.date))
      .slice(0, 8);
  }, [insights, projects]);

  function saveProject(project: Project, insight?: ProjectInsight) {
    const exists = projects.some((item) => item.id === project.id);
    const saved = exists ? project : { ...project, id: Date.now() };
    setProjects((old) => (exists ? old.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...old]));
    if (insight) setInsights((old) => ({ ...old, [saved.id]: insight }));
    setSelectedId(saved.id);
    setProjectModal(null);
  }

  function savePerson(person: Person) {
    const exists = people.some((item) => item.id === person.id);
    const saved = exists ? person : { ...person, id: Date.now() };
    setPeople((old) => (exists ? old.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...old]));
    setPersonModal(null);
  }

  return (
    <div className="fig-shell">
      <aside className="fig-sidebar">
        <div className="fig-brand"><h1>项目履历平台</h1></div>
        <nav className="fig-nav">
          <button className={`fig-nav-item ${page === "home" ? "active" : ""}`} onClick={() => setPage("home")}><Home size={16} />系统首页</button>
          <button className={`fig-nav-item ${page === "projects" ? "active" : ""}`} onClick={() => setPage("projects")}><FolderOpen size={16} />项目管理</button>
          <button className={`fig-nav-item ${page === "people" ? "active" : ""}`} onClick={() => setPage("people")}><Users size={16} />人员管理</button>
        </nav>
      </aside>
      <div className="fig-main">
        <header className="fig-header">
          <div><h1>{page === "home" ? "系统首页" : page === "people" ? "人员管理" : "项目管理"}</h1><p>系统概览 &gt; {page === "home" ? "系统首页" : page === "people" ? "人员管理" : "项目管理"}</p></div>
          <div className="fig-header-actions"><div className="fig-search"><Search size={16} />搜索项目、人员、资料</div><Bell size={16} /><span className="fig-admin">管理员</span><button className="fig-danger-button">安全设置</button></div>
        </header>
        <main className="fig-content">
          {page === "home" && <HomePage projects={projects} people={people} insights={insights} logs={logs} />}
          {page === "people" && <PeoplePage people={people} insights={insights} onAdd={() => setPersonModal({ id: 0, employeeNo: "", username: "", realName: "", phone: "", role: "FRONTEND" })} onEdit={setPersonModal} onDelete={(person) => setPeople((old) => old.filter((item) => item.id !== person.id))} />}
          {page === "projects" && <ProjectsPage projects={projects} insights={insights} selectedId={selectedId} selectedProject={selectedProject} selectedInsight={selectedInsight} onSelect={(project) => setSelectedId(project.id)} onAdd={() => setProjectModal({ id: 0, name: "", code: "", customer: "", manager: "", description: "", startDate: today(), endDate: today(), status: "PLANNING" })} onEdit={setProjectModal} onDelete={(project) => setProjects((old) => old.filter((item) => item.id !== project.id))} onDetail={setDetailProject} />}
        </main>
      </div>
      {projectModal && <ProjectModal project={projectModal} insight={insights[projectModal.id] ?? emptyInsight()} onClose={() => setProjectModal(null)} onSave={saveProject} />}
      {personModal && <PersonModal person={personModal} onClose={() => setPersonModal(null)} onSave={savePerson} />}
      {detailProject && <DetailModal project={detailProject} insight={insights[detailProject.id] ?? emptyInsight()} onClose={() => setDetailProject(null)} />}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return <section className="fig-stat-card"><div><b>{value}</b><span>{label}</span></div><i>{icon}</i></section>;
}

function HomePage({ projects, people, insights, logs }: { projects: Project[]; people: Person[]; insights: Record<number, ProjectInsight>; logs: { project: Project; event: TimelineEvent }[] }) {
  const changeCount = Object.values(insights).reduce((sum, item) => sum + item.changes.length, 0);
  const deliveryCount = Object.values(insights).reduce((sum, item) => sum + item.deliveries.length, 0);
  return (
    <div className="fig-page">
      <div className="fig-stat-grid"><StatCard label="项目总数" value={projects.length} icon={<FolderOpen />} /><StatCard label="参与人员" value={people.length} icon={<Users />} /><StatCard label="需求变更" value={changeCount} icon={<FileText />} /><StatCard label="发包记录" value={deliveryCount} icon={<CheckCircle2 />} /></div>
      <section className="fig-card"><div className="fig-card-title"><h3>项目展板</h3><span>修改次数、发包次数最多的项目优先展示</span></div><div className="project-rank-grid">{projects.map((project, index) => <article className="rank-card" key={project.id}><b>{index + 1}</b><h4>{project.name}</h4><p>{project.description}</p><span>{insights[project.id]?.changes.length ?? 0} 次修改</span><span>{insights[project.id]?.deliveries.length ?? 0} 次发包</span><span>{insights[project.id]?.middlewares.length ?? 0} 项中间件</span></article>)}</div></section>
      <section className="fig-card"><div className="fig-card-title"><h3>操作日志</h3><span>最近 {logs.length} 条</span></div>{logs.map(({ project, event }) => <div className="log-row" key={event.id}><b>{event.date} {project.name} · {event.title}</b><p>{event.actor} · {event.type}</p></div>)}</section>
    </div>
  );
}

function PeoplePage({ people, insights, onAdd, onEdit, onDelete }: { people: Person[]; insights: Record<number, ProjectInsight>; onAdd: () => void; onEdit: (person: Person) => void; onDelete: (person: Person) => void }) {
  const tags = (person: Person) => Object.entries(insights).filter(([, insight]) => insight.members.some((member) => member.employeeNo === person.employeeNo)).map(([projectId]) => initialProjects.find((project) => project.id === Number(projectId))?.name).filter(Boolean);
  return <div className="fig-page"><div className="fig-stat-grid"><StatCard label="人员总数" value={people.length} icon={<Users />} /><StatCard label="项目经理" value={people.filter((person) => person.role === "PM").length} icon={<Users />} /><StatCard label="开发人员" value={people.filter((person) => ["DEV_MANAGER", "FRONTEND", "BACKEND"].includes(person.role)).length} icon={<BriefcaseBusiness />} /><StatCard label="可分配项目" value={initialProjects.length} icon={<FolderOpen />} /></div><section className="fig-card fill"><div className="fig-card-title"><h3>人员列表</h3><button className="fig-primary-button" onClick={onAdd}><Plus size={14} />新增人员</button></div><table className="fig-table"><thead><tr><th>姓名</th><th>工号</th><th>账号</th><th>手机号</th><th>岗位</th><th>所属项目</th><th>操作</th></tr></thead><tbody>{people.map((person) => <tr key={person.id}><td className="strong">{person.realName}</td><td>{person.employeeNo}</td><td>{person.username}</td><td>{person.phone}</td><td><span className="tag">{roleLabels[person.role]}</span></td><td>{tags(person).map((tag) => <span className="tag muted" key={tag}>{tag}</span>)}</td><td><button className="text-action" onClick={() => onEdit(person)}><Edit3 size={13} />编辑</button><button className="text-danger" onClick={() => onDelete(person)}><Trash2 size={13} />删除</button></td></tr>)}</tbody></table><Pagination count={people.length} /></section></div>;
}

function ProjectsPage({ projects, insights, selectedId, selectedProject, selectedInsight, onSelect, onAdd, onEdit, onDelete, onDetail }: { projects: Project[]; insights: Record<number, ProjectInsight>; selectedId: number; selectedProject: Project; selectedInsight: ProjectInsight; onSelect: (project: Project) => void; onAdd: () => void; onEdit: (project: Project) => void; onDelete: (project: Project) => void; onDetail: (project: Project) => void }) {
  return <div className="fig-page"><div className="fig-stat-grid"><StatCard label="项目总数" value={projects.length} icon={<FolderOpen />} /><StatCard label="进行中" value={projects.filter((project) => project.status === "IN_PROGRESS").length} icon={<CalendarDays />} /><StatCard label="已完成" value={projects.filter((project) => project.status === "COMPLETED").length} icon={<CheckCircle2 />} /><StatCard label="已归档" value={projects.filter((project) => project.status === "ARCHIVED").length} icon={<Database />} /></div><section className="fig-card"><div className="fig-card-title"><h3>项目列表</h3><button className="fig-primary-button" onClick={onAdd}><Plus size={14} />新增项目</button></div><table className="fig-table"><thead><tr><th>项目名称</th><th>项目编号</th><th>客户</th><th>负责人</th><th>状态</th><th>记录</th><th>操作</th></tr></thead><tbody>{projects.map((project) => <tr key={project.id} className={project.id === selectedId ? "selected" : ""} onClick={() => onSelect(project)}><td className="strong">{project.name}</td><td>{project.code}</td><td>{project.customer}</td><td>{project.manager}</td><td><span className="tag">{statusLabels[project.status]}</span></td><td>{insights[project.id]?.changes.length ?? 0} 变更 / {insights[project.id]?.deliveries.length ?? 0} 发包 / {insights[project.id]?.middlewares.length ?? 0} 中间件</td><td><button className="text-action" onClick={(event) => { event.stopPropagation(); onDetail(project); }}>详情</button><button className="text-action" onClick={(event) => { event.stopPropagation(); onEdit(project); }}><Edit3 size={13} />编辑</button><button className="text-danger" onClick={(event) => { event.stopPropagation(); onDelete(project); }}><Trash2 size={13} />删除</button></td></tr>)}</tbody></table><Pagination count={projects.length} /></section><section className="fig-card project-board"><div className="fig-card-title"><div><h3>{selectedProject.name}</h3><p>{selectedProject.startDate} 至 {selectedProject.endDate} · {selectedProject.customer}</p></div><span className="tag">{statusLabels[selectedProject.status]}</span></div><div className="board-tags"><span>{selectedInsight.members.length} 名成员</span><span>{selectedInsight.changes.length} 条需求变更</span><span>{selectedInsight.deliveries.length} 次发包记录</span><span>{selectedInsight.middlewares.length} 项中间件</span></div><Timeline events={[...selectedInsight.timeline].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)} /></section></div>;
}

function Timeline({ events }: { events: TimelineEvent[] }) {
  const colors: Record<TimelineEvent["type"], string> = { milestone: "#0f766e", change: "#f97316", delivery: "#2563eb", middleware: "#7c3aed", member: "#16a34a", issue: "#ef4444" };
  return <div className="timeline-preview">{events.map((event) => <div className="timeline-item" key={event.id}><time>{event.date}</time><i style={{ background: colors[event.type] }} /><article><b>{event.title} · {event.actor}</b><p>{event.detail}</p></article></div>)}</div>;
}

function ProjectModal({ project, insight, onClose, onSave }: { project: Project; insight: ProjectInsight; onClose: () => void; onSave: (project: Project, insight: ProjectInsight) => void }) {
  const [form, setForm] = useState(project);
  const [draft, setDraft] = useState(insight);
  const updateMiddleware = (mwId: string, patch: Partial<MiddlewareConfig>) => setDraft((old) => ({ ...old, middlewares: old.middlewares.map((item) => item.id === mwId ? { ...item, ...patch } : item) }));
  return <div className="fig-modal-backdrop"><section className="fig-modal project"><ModalHeader title={project.id ? "编辑项目" : "新增项目"} desc="可维护项目资料、仓库地址和中间件配置" onClose={onClose} /><div className="fig-project-form"><div className="fig-form-grid"><Field label="项目名称" value={form.name} onChange={(value) => setForm({ ...form, name: value })} /><Field label="项目编号" value={form.code} onChange={(value) => setForm({ ...form, code: value })} /><Field label="客户名称" value={form.customer} onChange={(value) => setForm({ ...form, customer: value })} /><Field label="负责人" value={form.manager} onChange={(value) => setForm({ ...form, manager: value })} /><Field type="date" label="开始时间" value={form.startDate} onChange={(value) => setForm({ ...form, startDate: value })} /><Field type="date" label="结束时间" value={form.endDate} onChange={(value) => setForm({ ...form, endDate: value })} /><label className="fig-field"><span>状态</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ProjectStatus })}>{statusOptions.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label><label className="fig-field wide"><span>项目说明</span><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label></div><EditList title="Git 仓库地址" action="新增仓库" onAdd={() => setDraft({ ...draft, repositories: [...draft.repositories, { id: id("repo"), name: "新仓库", branch: "main", url: "" }] })}>{draft.repositories.map((repo) => <div className="edit-row triple" key={repo.id}><Field label="仓库名称" value={repo.name} onChange={(value) => setDraft({ ...draft, repositories: draft.repositories.map((item) => item.id === repo.id ? { ...item, name: value } : item) })} /><Field label="分支" value={repo.branch} onChange={(value) => setDraft({ ...draft, repositories: draft.repositories.map((item) => item.id === repo.id ? { ...item, branch: value } : item) })} /><Field label="链接" value={repo.url} onChange={(value) => setDraft({ ...draft, repositories: draft.repositories.map((item) => item.id === repo.id ? { ...item, url: value } : item) })} /><IconDelete onClick={() => setDraft({ ...draft, repositories: draft.repositories.filter((item) => item.id !== repo.id) })} /></div>)}</EditList><EditList title="项目资料上传" action="模拟上传" onAdd={() => setDraft({ ...draft, documents: [...draft.documents, { id: id("doc"), name: "项目资料", fileName: "project-doc.txt", size: "0 KB" }] })}>{draft.documents.map((doc) => <div className="edit-file-row" key={doc.id}><span>{doc.name} · {doc.fileName} · {doc.size}</span><IconDelete onClick={() => setDraft({ ...draft, documents: draft.documents.filter((item) => item.id !== doc.id) })} /></div>)}</EditList><EditList title="中间件配置" action="新增中间件" onAdd={() => setDraft({ ...draft, middlewares: [...draft.middlewares, { id: id("mw"), environment: "测试", name: "Redis", host: "", port: "", configPath: "", remark: "" }] })}>{draft.middlewares.map((mw) => <div className="middleware-form-card" key={mw.id}><div className="middleware-form-columns"><div className="middleware-form-column"><label><span>环境</span><select value={mw.environment} onChange={(event) => updateMiddleware(mw.id, { environment: event.target.value })}><option value="测试">测试</option><option value="正式">正式</option></select></label><label><span>类型</span><select value={middlewareTypes.includes(mw.name) ? mw.name : "Other"} onChange={(event) => updateMiddleware(mw.id, { name: event.target.value })}>{middlewareTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label><Field label="地址" value={mw.host} onChange={(value) => updateMiddleware(mw.id, { host: value })} /><Field label="端口" value={mw.port} onChange={(value) => updateMiddleware(mw.id, { port: value })} /></div><div className="middleware-form-column"><Field label="配置文件路径" value={mw.configPath} onChange={(value) => updateMiddleware(mw.id, { configPath: value })} /><Field label="说明" value={mw.remark ?? ""} onChange={(value) => updateMiddleware(mw.id, { remark: value })} /><label className="config-upload-line"><span>配置文件上传</span><span className="file-picker"><span className="file-picker-name">{mw.configFileName || "未上传"}</span><span className="file-picker-button">上传</span><input type="file" accept=".txt,.md,.json,.yml,.yaml,.conf,.xml,.properties" onChange={async (event) => { const file = event.target.files?.[0]; if (file) updateMiddleware(mw.id, { configFileName: file.name, configPath: mw.configPath || file.name, content: await file.text().catch(() => "") }); event.target.value = ""; }} /></span></label></div></div><IconDelete onClick={() => setDraft({ ...draft, middlewares: draft.middlewares.filter((item) => item.id !== mw.id) })} /></div>)}</EditList></div><div className="fig-modal-actions"><button className="fig-ghost-button" onClick={onClose}>取消</button><button className="fig-primary-button" onClick={() => onSave(form, draft)}>确认保存</button></div></section></div>;
}

function DetailModal({ project, insight, onClose }: { project: Project; insight: ProjectInsight; onClose: () => void }) {
  const [tab, setTab] = useState("overview");
  const latestDelivery = insight.deliveries[insight.deliveries.length - 1];
  const latestChange = insight.changes[insight.changes.length - 1];
  return <div className="fig-modal-backdrop"><section className="fig-modal detail"><ModalHeader title={project.name} desc={`${project.code} · ${project.customer} · ${statusLabels[project.status]}`} onClose={onClose} /><div className="fig-tabs">{["overview:项目概览", "timeline:项目履历", "docs:资料文档", "changes:需求变更", "deliveries:发包记录", "middleware:中间件", "members:相关人员", "notes:备注"].map((item) => { const [key, label] = item.split(":"); return <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>{label}</button>; })}</div><div className="fig-detail-body">{tab === "overview" && <div className="handover-summary"><Info label="当前版本" value={latestDelivery?.version || "待发包"} /><Info label="最近发包" value={latestDelivery?.date || "暂无"} /><Info label="最近需求" value={latestChange?.date || "暂无"} /><Info label="主要中间件" value={insight.middlewares.map((mw) => mw.name).join(" / ") || "待登记"} /></div>}{tab === "timeline" && <Timeline events={[...insight.timeline].sort((a, b) => a.date.localeCompare(b.date))} />}{tab === "middleware" && <div className="fig-middleware-grid">{insight.middlewares.map((mw) => <article className="fig-panel" key={mw.id}><h3>{mw.name}</h3><span className="tag">{mw.environment}</span><dl className="fig-meta single"><div><dt>现场地址</dt><dd>{mw.host}:{mw.port}</dd></div><div><dt>配置文件</dt><dd>{mw.configFileName || mw.configPath || "未上传"}</dd></div><div><dt>说明</dt><dd>{mw.remark || "-"}</dd></div></dl><pre className="markdown-preview">{mw.content || `${mw.name} 配置文件模板\nhost=${mw.host}\nport=${mw.port}`}</pre></article>)}</div>}{tab === "members" && <div className="fig-member-grid">{insight.members.map((member) => <div className="fig-member-card" key={member.id}><b>{member.realName}</b><p>{member.employeeNo} · {member.joinedAt}加入</p><span className="tag">{roleLabels[member.role]}</span></div>)}</div>}{tab === "changes" && <RecordRows rows={insight.changes.map((item) => ({ title: item.summary, meta: `${item.date} · ${item.requester}`, desc: `后端：${item.backend}；前端：${item.frontend}` }))} />}{tab === "deliveries" && <RecordRows rows={insight.deliveries.map((item) => ({ title: `${item.version} · ${item.reason}`, meta: `${item.date} · ${item.operator}`, desc: `发包文件：${item.packageName}；范围：${item.scope}` }))} />}{tab === "docs" && <RecordRows rows={insight.documents.map((item) => ({ title: item.name, meta: `${item.fileName} · ${item.size}`, desc: "可下载查看" }))} />}{tab === "notes" && <RecordRows rows={insight.notes.map((item) => ({ title: item.title, meta: `${item.occurredAt} · ${item.contact}`, desc: item.content }))} />}</div></section></div>;
}

function RecordRows({ rows }: { rows: { title: string; meta: string; desc: string }[] }) {
  return <div className="fig-records-pane">{rows.length === 0 ? <p>暂无记录</p> : rows.map((row, index) => <article className="record-row" key={index}><div><b>{row.title}</b><p>{row.desc}</p></div><span>{row.meta}</span></article>)}</div>;
}

function PersonModal({ person, onClose, onSave }: { person: Person; onClose: () => void; onSave: (person: Person) => void }) {
  const [form, setForm] = useState(person);
  return <div className="fig-modal-backdrop"><section className="fig-modal member"><ModalHeader title={person.id ? "编辑人员" : "新增人员"} desc="维护工号、账号、手机号和岗位" onClose={onClose} /><div className="fig-form-grid single"><Field label="工号" value={form.employeeNo} onChange={(value) => setForm({ ...form, employeeNo: value })} /><Field label="账号" value={form.username} onChange={(value) => setForm({ ...form, username: value })} /><Field label="姓名" value={form.realName} onChange={(value) => setForm({ ...form, realName: value })} /><Field label="手机号" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} /><label className="fig-field"><span>岗位</span><select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as Role })}>{roleOptions.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}</select></label></div><div className="fig-modal-actions"><button className="fig-ghost-button" onClick={onClose}>取消</button><button className="fig-primary-button" onClick={() => onSave(form)}>保存人员</button></div></section></div>;
}

function EditList({ title, action, onAdd, children }: { title: string; action: string; onAdd: () => void; children: React.ReactNode }) {
  return <div className="fig-edit-list"><div><b>{title}</b><button type="button" onClick={onAdd}><Plus size={13} />{action}</button></div>{children}</div>;
}
function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="fig-field"><span>{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}
function ModalHeader({ title, desc, onClose }: { title: string; desc: string; onClose: () => void }) {
  return <div className="fig-modal-header"><div><h2>{title}</h2><p>{desc}</p></div><button className="fig-icon-button" onClick={onClose}><X size={18} /></button></div>;
}
function IconDelete({ onClick }: { onClick: () => void }) {
  return <button className="edit-delete icon-only" type="button" title="删除" onClick={onClick}><Trash2 size={14} /></button>;
}
function Pagination({ count }: { count: number }) {
  return <div className="fig-pagination"><span>显示 1 到 {count} 条，共 {count} 条记录</span><div><button>上一页</button><button className="active">1</button><button>下一页</button></div></div>;
}
function Info({ label, value }: { label: string; value: string }) {
  return <div className="summary-card"><span>{label}</span><b>{value}</b></div>;
}
