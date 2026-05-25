export type LifecycleType = "member" | "change" | "delivery" | "middleware" | "issue" | "milestone";

export type LifecycleChangeRecord = {
  id: string;
  date: string;
  requester: string;
  summary: string;
  backend: string;
  frontend: string;
  reason?: string;
  content?: string;
  status?: string;
  relatedDeliveryIds?: string[];
  recordedAt?: string;
};

export type LifecycleDeliveryRecord = {
  id: string;
  date: string;
  version: string;
  reason: string;
  packageName: string;
  scope: string;
  operator?: string;
  environment?: string;
  solvedIssues?: string;
  relatedRequirementIds?: string[];
  rollbackPlan?: string;
  recordedAt?: string;
};

export type LifecycleMiddlewareConfig = {
  id: string;
  environment: string;
  name: string;
  host: string;
  port: string;
  configPath: string;
  configFileName?: string;
  remark: string;
  content: string;
  recordedAt?: string;
};

export type LifecycleProjectNote = {
  id: string;
  type: string;
  title: string;
  occurredAt: string;
  contact: string;
  address?: string;
  documentName?: string;
  documentUrl?: string;
  content: string;
  status: string;
  recordedAt?: string;
};

export type LifecycleTimelineEvent = {
  id: string;
  date: string;
  title: string;
  actor: string;
  detail: string;
  type: LifecycleType;
  sourceType?: LifecycleType;
  sourceId?: string;
  recordedAt?: string;
  reason?: string;
  backendChanges?: string;
  frontendChanges?: string;
  middlewareChanges?: string;
  attachments?: string[];
  status?: string;
};

export type LifecycleInsight = {
  changes: LifecycleChangeRecord[];
  deliveries: LifecycleDeliveryRecord[];
  middlewares: LifecycleMiddlewareConfig[];
  notes?: LifecycleProjectNote[];
  timeline?: LifecycleTimelineEvent[];
};

export type ProjectLifecycleEvent = {
  id: string;
  sourceKey: string;
  eventType: LifecycleType;
  occurredAt: string;
  recordedAt: string;
  title: string;
  actor: string;
  reason: string;
  content: string;
  backendChanges?: string;
  frontendChanges?: string;
  middlewareChanges?: string;
  attachments: string[];
  status?: string;
  relatedRequirementIds: string[];
  relatedDeliveryIds: string[];
};

export type LifecycleSortMode = "handover" | "latest";

const typeLabels: Record<LifecycleType, string> = {
  member: "人员",
  change: "需求",
  delivery: "发包",
  middleware: "中间件",
  issue: "问题",
  milestone: "里程碑",
};

function eventDate(value: string) {
  return (value || "").slice(0, 10);
}

function eventDateTime(value: string) {
  return value || eventDate(value);
}

function sourceKey(type: LifecycleType, id: string, fallback: string) {
  return `${type}:${id || fallback}`;
}

function compareDateTimeAsc(left: ProjectLifecycleEvent, right: ProjectLifecycleEvent) {
  return left.occurredAt.localeCompare(right.occurredAt) || left.recordedAt.localeCompare(right.recordedAt);
}

function compareDateTimeDesc(left: ProjectLifecycleEvent, right: ProjectLifecycleEvent) {
  return right.occurredAt.localeCompare(left.occurredAt) || right.recordedAt.localeCompare(left.recordedAt);
}

export function lifecycleTypeLabel(type: LifecycleType) {
  return typeLabels[type];
}

export function buildProjectLifecycleEvents(insight: LifecycleInsight, sortMode: LifecycleSortMode = "handover"): ProjectLifecycleEvent[] {
  const events: ProjectLifecycleEvent[] = [];

  for (const event of insight.timeline ?? []) {
    const eventType = event.sourceType ?? event.type;
    const legacySourceKey = (() => {
      if (event.sourceType && event.sourceId) return sourceKey(eventType, event.sourceId, `${event.date}-${event.title}`);
      const matchedChange = insight.changes.find((record) => eventType === "change" && eventDate(record.date) === eventDate(event.date) && (event.title.includes(record.summary) || record.summary.includes(event.title)));
      if (matchedChange) return sourceKey("change", matchedChange.id, `${event.date}-${event.title}`);
      const matchedDelivery = insight.deliveries.find((record) => eventType === "delivery" && eventDate(record.date) === eventDate(event.date) && (event.title.includes(record.version) || event.detail.includes(record.version) || event.title.includes(record.reason)));
      if (matchedDelivery) return sourceKey("delivery", matchedDelivery.id, `${event.date}-${event.title}`);
      return sourceKey(eventType, event.sourceId ?? event.id, `${event.date}-${event.title}`);
    })();
    events.push({
      id: event.id,
      sourceKey: legacySourceKey,
      eventType,
      occurredAt: eventDate(event.date),
      recordedAt: event.recordedAt ?? eventDateTime(event.date),
      title: event.title,
      actor: event.actor,
      reason: event.reason ?? "",
      content: event.detail,
      backendChanges: event.backendChanges,
      frontendChanges: event.frontendChanges,
      middlewareChanges: event.middlewareChanges,
      attachments: event.attachments ?? [],
      status: event.status,
      relatedRequirementIds: [],
      relatedDeliveryIds: [],
    });
  }

  for (const record of insight.changes) {
    events.push({
      id: `change-${record.id}`,
      sourceKey: sourceKey("change", record.id, `${record.date}-${record.summary}`),
      eventType: "change",
      occurredAt: eventDate(record.date),
      recordedAt: record.recordedAt ?? eventDateTime(record.date),
      title: record.summary,
      actor: record.requester,
      reason: record.reason ?? record.content ?? "需求范围发生调整",
      content: record.content ?? record.summary,
      backendChanges: record.backend,
      frontendChanges: record.frontend,
      attachments: [],
      status: record.status ?? "待关联发包",
      relatedRequirementIds: [record.id],
      relatedDeliveryIds: record.relatedDeliveryIds ?? [],
    });
  }

  for (const record of insight.deliveries) {
    events.push({
      id: `delivery-${record.id}`,
      sourceKey: sourceKey("delivery", record.id, `${record.date}-${record.version}`),
      eventType: "delivery",
      occurredAt: eventDate(record.date),
      recordedAt: record.recordedAt ?? eventDateTime(record.date),
      title: `${record.version} 发包 · ${record.reason}`,
      actor: record.operator ?? "项目负责人",
      reason: record.reason,
      content: record.solvedIssues ?? record.scope,
      backendChanges: record.scope,
      attachments: [record.packageName].filter(Boolean),
      status: record.environment ?? "已发包",
      relatedRequirementIds: record.relatedRequirementIds ?? [],
      relatedDeliveryIds: [record.id],
    });
  }

  for (const item of insight.middlewares) {
    events.push({
      id: `middleware-${item.id}`,
      sourceKey: sourceKey("middleware", item.id, `${item.name}-${item.host}`),
      eventType: "middleware",
      occurredAt: eventDate(item.recordedAt ?? ""),
      recordedAt: item.recordedAt ?? "",
      title: `${item.name} 配置登记`,
      actor: item.environment || "项目环境",
      reason: item.remark || "登记现场中间件配置",
      content: `${item.host || "地址待补充"}:${item.port || "端口待补充"}`,
      middlewareChanges: item.configFileName || item.configPath || item.content,
      attachments: [item.configFileName || item.configPath].filter(Boolean),
      status: item.environment,
      relatedRequirementIds: [],
      relatedDeliveryIds: [],
    });
  }

  for (const note of insight.notes ?? []) {
    events.push({
      id: `note-${note.id}`,
      sourceKey: sourceKey("issue", note.id, `${note.occurredAt}-${note.title}`),
      eventType: note.type === "ISSUE" ? "issue" : "milestone",
      occurredAt: eventDate(note.occurredAt),
      recordedAt: note.recordedAt ?? eventDateTime(note.occurredAt),
      title: note.title,
      actor: note.contact,
      reason: note.address || "项目过程事项记录",
      content: note.content,
      attachments: [note.documentName || note.documentUrl || ""].filter(Boolean),
      status: note.status,
      relatedRequirementIds: [],
      relatedDeliveryIds: [],
    });
  }

  const deduped = new Map<string, ProjectLifecycleEvent>();
  for (const event of events) {
    if (!event.occurredAt) continue;
    const existing = deduped.get(event.sourceKey);
    if (!existing || event.content.length >= existing.content.length) {
      deduped.set(event.sourceKey, event);
    }
  }

  return [...deduped.values()].sort(sortMode === "latest" ? compareDateTimeDesc : compareDateTimeAsc);
}

export function getLifecyclePreviewEvents(insight: LifecycleInsight, limit = 5) {
  return buildProjectLifecycleEvents(insight, "latest").slice(0, limit);
}
