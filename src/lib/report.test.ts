import { describe, expect, it } from "vitest";
import { mockRecords } from "../data/mockRecords";
import type { PersonDaySaturation, TaskRating, WorkRecord } from "../types";
import { calculateSaturation, rateTasks } from "./metrics";
import { generateDailyReport } from "./report";

const baseRecord: WorkRecord = {
  id: "record-1",
  rowNumber: 1,
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
  remark: "接口联调完成",
};

const baseSaturation: PersonDaySaturation = {
  person: "张三",
  date: "2026-05-21",
  totalHours: 3,
  projectCount: 1,
  taskCount: 1,
  averageProgress: 100,
  level: "正常",
  score: 40,
  reasons: ["投入与进度处于正常范围"],
};

const baseRating: TaskRating = {
  recordId: "record-1",
  stars: 5,
  label: "准时完成",
  reason: "完成进度 100%",
};

describe("generateDailyReport", () => {
  it("generates a structured project daily report", () => {
    const report = generateDailyReport({
      date: "2026-05-21",
      project: "智慧工地平台",
      records: mockRecords,
      saturation: calculateSaturation(mockRecords),
      ratings: rateTasks(mockRecords),
    });

    expect(report).toContain("【项目日报】");
    expect(report).toContain("项目：智慧工地平台");
    expect(report).toContain("今日投入");
    expect(report).toContain("饱和度与星级摘要");
    expect(report).toContain("主要工作");
  });

  it("treats whitespace project input as all projects", () => {
    const records: WorkRecord[] = [
      baseRecord,
      {
        ...baseRecord,
        id: "record-2",
        rowNumber: 2,
        person: "李四",
        project: "数据中台",
        module: "报表模块",
        task: "完成统计报表",
        hours: 2.5,
      },
    ];

    const report = generateDailyReport({
      date: "2026-05-21",
      project: "   ",
      records,
      saturation: [
        baseSaturation,
        {
          ...baseSaturation,
          person: "李四",
          totalHours: 2.5,
        },
      ],
      ratings: [
        baseRating,
        {
          ...baseRating,
          recordId: "record-2",
        },
      ],
    });

    expect(report).toContain("项目：全部项目");
    expect(report).toContain("今日共 2 人参与，累计投入 5.5 小时。");
    expect(report).toContain("完成登录接口联调");
    expect(report).toContain("完成统计报表");
  });

  it("ignores whitespace-only people in participant counts and saturation output", () => {
    const records: WorkRecord[] = [
      {
        ...baseRecord,
        id: "blank-person",
        person: "   ",
        task: "空白人员任务",
      },
      {
        ...baseRecord,
        id: "named-person",
        person: "王五",
        task: "实名人员任务",
      },
    ];

    const report = generateDailyReport({
      date: "2026-05-21",
      project: "全部项目",
      records,
      saturation: [
        {
          ...baseSaturation,
          person: "   ",
          level: "过载",
          reasons: ["空白人员不应输出"],
        },
        {
          ...baseSaturation,
          person: "王五",
        },
      ],
      ratings: [
        {
          ...baseRating,
          recordId: "blank-person",
        },
        {
          ...baseRating,
          recordId: "named-person",
        },
      ],
    });

    expect(report).toContain("今日共 1 人参与");
    expect(report).toContain("王五：当日全项目饱和度");
    expect(report).not.toContain("   ：当日全项目饱和度");
    expect(report).not.toContain("空白人员不应输出");
  });

  it("labels project-specific saturation as same-day all-project saturation", () => {
    const report = generateDailyReport({
      date: "2026-05-21",
      project: "智慧工地平台",
      records: [baseRecord],
      saturation: [baseSaturation],
      ratings: [baseRating],
    });

    expect(report).toContain("当日全项目饱和度");
  });

  it("includes the rating label in low-star output", () => {
    const report = generateDailyReport({
      date: "2026-05-21",
      project: "智慧工地平台",
      records: [
        {
          ...baseRecord,
          progressPercent: 50,
        },
      ],
      saturation: [baseSaturation],
      ratings: [
        {
          recordId: "record-1",
          stars: 2,
          label: "需要关注",
          reason: "完成进度不足",
        },
      ],
    });

    expect(report).toContain("2 星，需要关注，完成进度不足");
  });
});
