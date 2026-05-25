import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { parseExcelFile } from "./excel";
import { validateRecords } from "./validation";

describe("parseExcelFile", () => {
  it("rejects unsupported file extensions with the expected message", async () => {
    const file = new File(["demo"], "demo.txt");

    await expect(parseExcelFile(file)).rejects.toThrow("仅支持 xlsx 或 xls 文件");
  });

  it("normalizes typed numeric Excel date and time cells", async () => {
    const worksheet = XLSX.utils.json_to_sheet([
      {
        序号: 1,
        日期: 46163,
        姓名: "张三",
        项目名称: "智慧工地平台",
        任务模块: "登录模块",
        详细任务: "完成登录接口联调",
        工作类型: "联调",
        "工作量(小时)": 3,
        开始时间: 9 / 24,
        结束时间: 12 / 24,
        完成进度: "100%",
        实际完成时间: 46163 + 11 / 24 + 50 / 1440,
        备注: "按计划完成"
      }
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "日报");
    const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });

    const records = await parseExcelFile(new File([buffer], "demo.xlsx"));

    expect(records[0]).toMatchObject({
      date: "2026-05-21",
      startTime: "09:00",
      endTime: "12:00",
      actualFinishTime: "11:50"
    });
    expect(validateRecords(records).filter((issue) => issue.message.includes("格式应为 HH:mm"))).toEqual([]);
  });
});
