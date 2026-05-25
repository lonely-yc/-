import { describe, expect, it } from "vitest";
import { buildProjectLifecycleEvents, getLifecyclePreviewEvents, type LifecycleInsight } from "./projectLifecycle";

const insight: LifecycleInsight = {
  changes: [
    {
      id: "change-1",
      date: "2026-05-24",
      requester: "国网运维中心",
      summary: "需求修改",
      backend: "新增 cause_review 表",
      frontend: "新增审核按钮",
      content: "新增停电原因回填和 AI 研判复核入口。",
      recordedAt: "2026-05-25 09:00",
    },
  ],
  deliveries: [
    {
      id: "delivery-1",
      date: "2026-05-26 20:10",
      version: "v1.3.0",
      reason: "首轮现场联调",
      packageName: "power-agent-release-1.3.0.zip",
      scope: "前后端联调包、Redis 初始化脚本、Nginx 代理配置",
      operator: "陈越",
      recordedAt: "2026-05-26 20:20",
    },
    {
      id: "delivery-2",
      date: "2026-05-30 23:35",
      version: "v1.4.2",
      reason: "需求变更后的稳定版",
      packageName: "power-agent-release-1.4.2.zip",
      scope: "前端修复包、Spring Boot服务、部署变更单",
      operator: "陈越",
      recordedAt: "2026-05-30 23:40",
    },
  ],
  middlewares: [],
  timeline: [
    {
      id: "tl-start",
      date: "2026-05-21",
      title: "项目启动",
      actor: "李楠",
      detail: "项目启动会完成。",
      type: "milestone",
    },
    {
      id: "tl-delivery-legacy",
      date: "2026-05-26",
      title: "联调发包",
      actor: "陈越",
      detail: "发包 v1.3.0。",
      type: "delivery",
      sourceType: "delivery",
      sourceId: "delivery-1",
    },
  ],
};

describe("project lifecycle", () => {
  it("builds handover events in project-history order and removes duplicated delivery timeline entries", () => {
    const events = buildProjectLifecycleEvents(insight, "handover");

    expect(events.map((event) => event.title)).toEqual([
      "项目启动",
      "需求修改",
      "v1.3.0 发包 · 首轮现场联调",
      "v1.4.2 发包 · 需求变更后的稳定版",
    ]);
    expect(events.filter((event) => event.sourceKey === "delivery:delivery-1")).toHaveLength(1);
  });

  it("builds latest preview events using business time and limits to five records", () => {
    const preview = getLifecyclePreviewEvents({
      ...insight,
      timeline: [
        ...(insight.timeline ?? []),
        { id: "tl-member", date: "2026-05-23", title: "实施加入", actor: "惠晓峰", detail: "负责现场环境。", type: "member" },
        { id: "tl-issue", date: "2026-05-28", title: "弱网问题修复", actor: "现场实施组", detail: "补充离线缓存。", type: "issue" },
      ],
    });

    expect(preview).toHaveLength(5);
    expect(preview.map((event) => event.occurredAt)).toEqual(["2026-05-30", "2026-05-28", "2026-05-26", "2026-05-24", "2026-05-23"]);
  });
});
