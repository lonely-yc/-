import { describe, expect, it } from "vitest";
import { normalizeRows } from "./normalize";

describe("normalizeRows", () => {
  it("maps Chinese Excel headers into typed work records", () => {
    const records = normalizeRows([
      {
        序号: 1,
        日期: "2026-05-21",
        姓名: "张三",
        项目名称: "智慧工地平台",
        任务模块: "登录模块",
        详细任务: "完成登录接口联调",
        工作类型: "联调",
        "工作量(小时)": 3,
        开始时间: "09:00",
        结束时间: "12:00",
        完成进度: "80%",
        实际完成时间: "",
        备注: "等待第三方接口确认"
      }
    ]);

    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
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
      progressPercent: 80,
      progressLabel: "进行中",
      remark: "等待第三方接口确认"
    });
  });

  it("uses safe defaults for optional fields", () => {
    const records = normalizeRows([
      {
        项目名称: "数据中台",
        任务模块: "报表",
        详细任务: "整理日报字段",
        "工作量(小时)": "2.5",
        开始时间: "14:00",
        结束时间: "16:30",
        完成进度: "已完成"
      }
    ]);

    expect(records[0].person).toBe("");
    expect(records[0].date).toBe("");
    expect(records[0].workType).toBe("其他");
    expect(records[0].progressPercent).toBe(100);
    expect(records[0].progressLabel).toBe("已完成");
  });

  it("normalizes malformed percent and numeric progress values", () => {
    const records = normalizeRows([
      { 完成进度: "abc%" },
      { 完成进度: 0.8 },
      { 完成进度: 1 }
    ]);

    expect(records[0].progressPercent).toBe(0);
    expect(records[0].progressLabel).toBe("未开始");
    expect(records[1].progressPercent).toBe(80);
    expect(records[1].progressLabel).toBe("进行中");
    expect(records[2].progressPercent).toBe(100);
    expect(records[2].progressLabel).toBe("已完成");
  });
});
