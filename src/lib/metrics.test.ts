import { describe, expect, it } from "vitest";
import type { WorkRecord } from "../types";
import { buildSummaries, calculateSaturation, rateTasks } from "./metrics";

const records: WorkRecord[] = [
  {
    id: "row-2",
    rowNumber: 2,
    date: "2026-05-21",
    person: "张三",
    project: "智慧工地平台",
    module: "登录模块",
    task: "完成登录接口联调",
    workType: "联调",
    hours: 3,
    startTime: "09:00",
    endTime: "12:00",
    progressPercent: 100,
    progressLabel: "已完成",
    actualFinishTime: "11:50",
    remark: "完成",
  },
  {
    id: "row-3",
    rowNumber: 3,
    date: "2026-05-21",
    person: "张三",
    project: "数据中台",
    module: "报表模块",
    task: "开发项目投入统计报表",
    workType: "开发",
    hours: 8,
    startTime: "10:00",
    endTime: "19:00",
    progressPercent: 60,
    progressLabel: "进行中",
    remark: "",
  },
  {
    id: "row-4",
    rowNumber: 4,
    date: "2026-05-21",
    person: "李四",
    project: "智慧工地平台",
    module: "权限模块",
    task: "权限菜单调整",
    workType: "开发",
    hours: 4,
    startTime: "09:00",
    endTime: "13:00",
    progressPercent: 80,
    progressLabel: "进行中",
    remark: "还差联调",
  },
];

describe("metrics", () => {
  it("builds project, person, and module summaries", () => {
    const summaries = buildSummaries(records);
    expect(summaries.byProject.find((item) => item.key === "智慧工地平台")).toMatchObject({
      totalHours: 7,
      taskCount: 2,
      personCount: 2,
    });
    expect(summaries.byPerson.find((item) => item.key === "张三")).toMatchObject({
      totalHours: 11,
      taskCount: 2,
      personCount: 1,
    });
  });

  it("calculates saturation without treating overlap as an error", () => {
    const saturation = calculateSaturation(records);
    const zhang = saturation.find((item) => item.person === "张三")!;
    expect(zhang.totalHours).toBe(11);
    expect(zhang.projectCount).toBe(2);
    expect(zhang.level).toBe("过载");
    expect(zhang.reasons.join(" ")).toContain("总工时超过 10 小时");
  });

  it("rates tasks by progress and finish time", () => {
    const ratings = rateTasks(records);
    expect(ratings.find((item) => item.recordId === "row-2")).toMatchObject({ stars: 5 });
    expect(ratings.find((item) => item.recordId === "row-3")).toMatchObject({ stars: 2 });
    expect(ratings.find((item) => item.recordId === "row-4")).toMatchObject({ stars: 3 });
  });

  it("treats invalid actual finish time as unknown for completed tasks", () => {
    const ratings = rateTasks([
      {
        ...records[0],
        id: "invalid-time",
        endTime: "17:30",
        actualFinishTime: "abc25:99",
      },
    ]);

    expect(ratings[0]).toMatchObject({ stars: 5 });
  });

  it("rates completed tasks as delayed when valid actual finish time is after planned end", () => {
    const ratings = rateTasks([
      {
        ...records[0],
        id: "delayed-time",
        endTime: "17:30",
        actualFinishTime: "17:31",
      },
    ]);

    expect(ratings[0]).toMatchObject({ stars: 4 });
  });

  it("falls back whitespace-only project, module, and person group keys to 未填写", () => {
    const summaries = buildSummaries([
      {
        ...records[0],
        id: "blank-keys",
        person: "   ",
        project: "   ",
        module: "   ",
      },
    ]);

    expect(summaries.byProject[0].key).toBe("未填写");
    expect(summaries.byModule[0].key).toBe("未填写");
    expect(summaries.byPerson[0].key).toBe("未填写");
  });

  it("does not count blank people in project and module participant counts", () => {
    const summaries = buildSummaries([
      { ...records[0], id: "named-person", person: "寮犱笁", project: "Project", module: "Module" },
      { ...records[1], id: "blank-person", person: "   ", project: "Project", module: "Module" },
    ]);

    expect(summaries.byProject[0]).toMatchObject({ key: "Project", personCount: 1 });
    expect(summaries.byModule[0]).toMatchObject({ key: "Module", personCount: 1 });
  });
});
