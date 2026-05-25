export type BoardProject = {
  id: number;
  name: string;
  status?: string;
};

export type BoardInsight = {
  changes: unknown[];
  deliveries: unknown[];
  middlewares: unknown[];
  timeline?: Array<{
    date: string;
    title: string;
    actor: string;
    type: string;
  }>;
};

export type ProjectBoardItem = {
  projectId: number;
  name: string;
  status?: string;
  changeCount: number;
  deliveryCount: number;
  middlewareCount: number;
  activityScore: number;
  riskLevel: "高" | "中" | "低";
  riskReason: string;
};

export type ProjectOperationLog = {
  id: string;
  projectId: number;
  projectName: string;
  date: string;
  title: string;
  actor: string;
  type: string;
};

export function getProjectActivityScore(insight?: BoardInsight) {
  if (!insight) return 0;
  return insight.changes.length * 3 + insight.deliveries.length * 2 + insight.middlewares.length;
}

export function getProjectRisk(insight?: BoardInsight): Pick<ProjectBoardItem, "riskLevel" | "riskReason"> {
  if (!insight) return { riskLevel: "低", riskReason: "暂无业务追踪记录" };

  if (insight.changes.length >= 2 && insight.deliveries.length >= 2) {
    return { riskLevel: "高", riskReason: "需求和发包都较频繁，建议项目经理复核范围" };
  }

  if (insight.changes.length >= 2) {
    return { riskLevel: "高", riskReason: "需求变更次数较多，存在返工风险" };
  }

  if (insight.deliveries.length >= 2) {
    return { riskLevel: "中", riskReason: "发包频率偏高，建议关注现场验证结果" };
  }

  if (insight.middlewares.length === 0) {
    return { riskLevel: "中", riskReason: "尚未登记中间件配置，部署信息不完整" };
  }

  return { riskLevel: "低", riskReason: "记录完整，当前风险可控" };
}

export function buildProjectBoard(projects: BoardProject[], insights: Record<number, BoardInsight | undefined>): ProjectBoardItem[] {
  return projects
    .map((project) => {
      const insight = insights[project.id];
      const risk = getProjectRisk(insight);
      return {
        projectId: project.id,
        name: project.name,
        status: project.status,
        changeCount: insight?.changes.length ?? 0,
        deliveryCount: insight?.deliveries.length ?? 0,
        middlewareCount: insight?.middlewares.length ?? 0,
        activityScore: getProjectActivityScore(insight),
        ...risk,
      };
    })
    .sort((left, right) => right.activityScore - left.activityScore || right.changeCount - left.changeCount);
}

export function buildProjectOperationLogs(
  projects: BoardProject[],
  insights: Record<number, BoardInsight | undefined>,
  limit = 6,
): ProjectOperationLog[] {
  const projectNames = new Map(projects.map((project) => [project.id, project.name]));

  return Object.entries(insights)
    .flatMap(([projectId, insight]) => {
      const id = Number(projectId);
      return (insight?.timeline ?? []).map((event) => ({
        id: `${projectId}-${event.date}-${event.title}`,
        projectId: id,
        projectName: projectNames.get(id) ?? "未知项目",
        date: event.date,
        title: event.title,
        actor: event.actor,
        type: event.type,
      }));
    })
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, limit);
}
