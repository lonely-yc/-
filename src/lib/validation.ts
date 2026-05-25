import type { ValidationIssue, WorkRecord } from "../types";

const REQUIRED_FIELDS: Array<keyof WorkRecord> = [
  "date",
  "person",
  "project",
  "module",
  "task",
  "hours",
  "startTime",
  "endTime",
];

const FIELD_LABELS: Partial<Record<keyof WorkRecord, string>> = {
  date: "日期",
  person: "姓名",
  project: "项目名称",
  module: "任务模块",
  task: "详细任务",
  hours: "工作量(小时)",
  startTime: "开始时间",
  endTime: "结束时间",
  remark: "备注",
};

function minutes(time: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return hour * 60 + minute;
}

function issue(
  record: WorkRecord,
  field: ValidationIssue["field"],
  severity: ValidationIssue["severity"],
  message: string
): ValidationIssue {
  return {
    recordId: record.id,
    rowNumber: record.rowNumber,
    field,
    severity,
    message,
  };
}

export function validateRecords(records: WorkRecord[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const record of records) {
    for (const field of REQUIRED_FIELDS) {
      const value = record[field];
      if (value === "" || value === undefined || value === null) {
        issues.push(issue(record, field, "error", `${FIELD_LABELS[field]}不能为空`));
      }
    }

    if (record.hours <= 0) {
      issues.push(issue(record, "hours", "error", "工作量(小时)必须大于 0"));
    }

    const hasStartTime = record.startTime !== "";
    const hasEndTime = record.endTime !== "";
    const start = hasStartTime ? minutes(record.startTime) : null;
    const end = hasEndTime ? minutes(record.endTime) : null;
    if (hasStartTime && start === null) {
      issues.push(issue(record, "startTime", "error", "开始时间格式应为 HH:mm"));
    }
    if (hasEndTime && end === null) {
      issues.push(issue(record, "endTime", "error", "结束时间格式应为 HH:mm"));
    }
    if (start !== null && end !== null && end <= start) {
      issues.push(issue(record, "endTime", "error", "结束时间必须晚于开始时间"));
    }
    if (record.hours > 0 && start !== null && end !== null && end > start) {
      const spanHours = (end - start) / 60;
      if (Math.abs(spanHours - record.hours) >= 2) {
        issues.push(issue(record, "hours", "warning", "工作量与开始/结束时间跨度差异较大"));
      }
    }

    if (record.task.length > 0 && record.task.length < 6) {
      issues.push(issue(record, "task", "warning", "详细任务描述过短"));
    }

    if (record.progressPercent < 100 && !record.remark) {
      issues.push(issue(record, "remark", "warning", "未完成任务建议填写备注说明"));
    }
  }

  return issues;
}

export function countIssues(issues: ValidationIssue[]) {
  return {
    errors: issues.filter((issueItem) => issueItem.severity === "error").length,
    warnings: issues.filter((issueItem) => issueItem.severity === "warning").length,
  };
}
