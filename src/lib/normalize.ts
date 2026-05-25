import type { ProgressLevel, RawWorkRow, WorkRecord, WorkType } from "../types";

const WORK_TYPES: WorkType[] = ["开发", "测试", "联调", "会议", "现场支持", "文档", "其他"];

function text(value: unknown): string {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function excelSerialToDate(value: number): string {
  if (!Number.isFinite(value)) return "";
  const wholeDays = Math.floor(value);
  const date = new Date(Date.UTC(1899, 11, 30 + wholeDays));
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

function excelNumberToTime(value: number): string {
  if (!Number.isFinite(value)) return "";
  const fraction = ((value % 1) + 1) % 1;
  const totalMinutes = Math.round(fraction * 24 * 60) % (24 * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${pad2(hours)}:${pad2(minutes)}`;
}

function normalizeDate(value: unknown): string {
  if (typeof value === "number") return excelSerialToDate(value);
  return text(value);
}

function normalizeTime(value: unknown): string {
  if (typeof value === "number") return excelNumberToTime(value);
  return text(value);
}

function numberValue(value: unknown): number {
  if (typeof value === "number") return value;
  const parsed = Number(text(value).replace("小时", ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeWorkType(value: unknown): WorkType {
  const raw = text(value);
  return WORK_TYPES.includes(raw as WorkType) ? (raw as WorkType) : "其他";
}

function clampPercent(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
}

function progressLabel(percent: number): ProgressLevel {
  return percent >= 100 ? "已完成" : percent <= 0 ? "未开始" : "进行中";
}

function normalizeProgress(value: unknown): { percent: number; label: ProgressLevel } {
  const raw = text(value);
  if (!raw) return { percent: 0, label: "未开始" };
  if (raw.includes("%")) {
    const percent = clampPercent(Number(raw.replace("%", "")));
    return { percent, label: progressLabel(percent) };
  }
  if (raw === "已完成") return { percent: 100, label: "已完成" };
  if (raw === "阻塞") return { percent: 50, label: "阻塞" };
  if (raw === "进行中") return { percent: 50, label: "进行中" };
  if (raw === "未开始") return { percent: 0, label: "未开始" };
  const parsed = Number(raw);
  if (Number.isFinite(parsed)) {
    const percent = clampPercent(parsed <= 1 ? parsed * 100 : parsed);
    return { percent, label: progressLabel(percent) };
  }
  return { percent: 0, label: "未开始" };
}

export function normalizeRows(rows: RawWorkRow[]): WorkRecord[] {
  return rows.map((row, index) => {
    const progress = normalizeProgress(row["完成进度"]);
    return {
      id: `row-${index + 2}`,
      rowNumber: index + 2,
      sequence: numberValue(row["序号"]) || undefined,
      date: normalizeDate(row["日期"]),
      person: text(row["姓名"]),
      project: text(row["项目名称"]),
      module: text(row["任务模块"]),
      task: text(row["详细任务"]),
      workType: normalizeWorkType(row["工作类型"]),
      hours: numberValue(row["工作量(小时)"]),
      startTime: normalizeTime(row["开始时间"]),
      endTime: normalizeTime(row["结束时间"]),
      progressPercent: progress.percent,
      progressLabel: progress.label,
      actualFinishTime: normalizeTime(row["实际完成时间"]) || undefined,
      remark: text(row["备注"]),
    };
  });
}
