import { describe, expect, it } from "vitest";
import type { WorkRecord } from "../types";
import { validateRecords } from "./validation";

const baseRecord: WorkRecord = {
  id: "row-2",
  rowNumber: 2,
  sequence: 1,
  date: "2026-05-21",
  person: "张三",
  project: "智慧工地平台",
  module: "登录模块",
  task: "完成登录接口联调",
  workType: "联调",
  hours: 3,
  startTime: "09:00",
  endTime: "12:00",
  progressPercent: 80,
  progressLabel: "进行中",
  remark: "等待第三方接口",
};

describe("validateRecords", () => {
  it("reports missing required fields", () => {
    const issues = validateRecords([{ ...baseRecord, project: "", person: "" }]);
    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "project", severity: "error" }),
        expect.objectContaining({ field: "person", severity: "error" }),
      ])
    );
  });

  it("reports invalid time order", () => {
    const issues = validateRecords([{ ...baseRecord, startTime: "15:00", endTime: "11:00" }]);
    expect(issues).toContainEqual(
      expect.objectContaining({
        field: "endTime",
        severity: "error",
        message: "结束时间必须晚于开始时间",
      })
    );
  });

  it("reports start time without two hour digits", () => {
    const issues = validateRecords([{ ...baseRecord, startTime: "9:00" }]);
    expect(issues).toContainEqual(
      expect.objectContaining({
        field: "startTime",
        severity: "error",
        message: "开始时间格式应为 HH:mm",
      })
    );
  });

  it("does not report format errors for empty time fields", () => {
    const issues = validateRecords([{ ...baseRecord, startTime: "", endTime: "" }]);
    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "startTime", severity: "error" }),
        expect.objectContaining({ field: "endTime", severity: "error" }),
      ])
    );
    expect(issues).not.toContainEqual(
      expect.objectContaining({
        field: "startTime",
        message: "开始时间格式应为 HH:mm",
      })
    );
    expect(issues).not.toContainEqual(
      expect.objectContaining({
        field: "endTime",
        message: "结束时间格式应为 HH:mm",
      })
    );
  });

  it("reports non-positive hours without span mismatch warning", () => {
    const issues = validateRecords([{ ...baseRecord, hours: 0 }]);
    expect(issues).toContainEqual(
      expect.objectContaining({
        field: "hours",
        severity: "error",
        message: "工作量(小时)必须大于 0",
      })
    );
    expect(issues).not.toContainEqual(
      expect.objectContaining({
        field: "hours",
        message: "工作量与开始/结束时间跨度差异较大",
      })
    );
  });

  it("allows overlapping project times for the same person", () => {
    const issues = validateRecords([
      baseRecord,
      {
        ...baseRecord,
        id: "row-3",
        rowNumber: 3,
        project: "数据中台",
        startTime: "10:00",
        endTime: "11:00",
      },
    ]);
    expect(issues.some((issue) => issue.message.includes("时间冲突"))).toBe(false);
  });

  it("warns for short task descriptions and unfinished tasks without remarks", () => {
    const issues = validateRecords([{ ...baseRecord, task: "改bug", progressPercent: 50, remark: "" }]);
    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "task", severity: "warning" }),
        expect.objectContaining({ field: "remark", severity: "warning" }),
      ])
    );
  });
});
