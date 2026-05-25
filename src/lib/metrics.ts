import type { PersonDaySaturation, SaturationLevel, SummaryRow, TaskRating, WorkRecord } from "../types";

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function byKey(records: WorkRecord[], getKey: (record: WorkRecord) => string): SummaryRow[] {
  const map = new Map<string, WorkRecord[]>();
  for (const record of records) {
    const key = getKey(record).trim() || "未填写";
    map.set(key, [...(map.get(key) ?? []), record]);
  }
  return [...map.entries()]
    .map(([key, items]) => ({
      key,
      totalHours: Number(items.reduce((sum, record) => sum + record.hours, 0).toFixed(1)),
      taskCount: items.length,
      personCount: new Set(items.map((record) => record.person.trim()).filter(Boolean)).size,
      averageProgress: average(items.map((record) => record.progressPercent)),
    }))
    .sort((a, b) => b.totalHours - a.totalHours);
}

export function buildSummaries(records: WorkRecord[]) {
  return {
    byProject: byKey(records, (record) => record.project),
    byPerson: byKey(records, (record) => record.person),
    byModule: byKey(records, (record) => record.module),
  };
}

function complexityScore(record: WorkRecord): number {
  let score = 0;
  if (record.task.length >= 14) score += 1;
  if (/(联调|接口|报表|权限|现场|缺陷|阻塞|延期|等待)/.test(`${record.task}${record.remark}`)) score += 1;
  if (record.progressPercent < 80) score += 1;
  return score;
}

function saturationLevel(score: number): SaturationLevel {
  if (score >= 90) return "过载";
  if (score >= 70) return "饱和";
  if (score >= 40) return "正常";
  return "空闲";
}

export function calculateSaturation(records: WorkRecord[]): PersonDaySaturation[] {
  const groups = new Map<string, WorkRecord[]>();
  for (const record of records) {
    const key = `${record.person}__${record.date}`;
    groups.set(key, [...(groups.get(key) ?? []), record]);
  }

  return [...groups.entries()].map(([key, items]) => {
    const [person, date] = key.split("__");
    const totalHours = Number(items.reduce((sum, record) => sum + record.hours, 0).toFixed(1));
    const projectCount = new Set(items.map((record) => record.project)).size;
    const taskCount = items.length;
    const complexity = items.reduce((sum, record) => sum + complexityScore(record), 0);
    let score = totalHours * 8 + Math.max(0, projectCount - 1) * 8 + Math.max(0, taskCount - 2) * 5 + complexity * 4;
    const averageProgress = average(items.map((record) => record.progressPercent));
    if (totalHours > 10 && averageProgress < 80) score += 12;
    score = Math.min(100, Math.round(score));

    const reasons: string[] = [];
    if (totalHours < 4) reasons.push("总工时低于 4 小时");
    if (totalHours > 8) reasons.push("总工时超过 8 小时");
    if (totalHours > 10) reasons.push("总工时超过 10 小时");
    if (projectCount >= 3) reasons.push("同时投入 3 个及以上项目");
    if (taskCount >= 4) reasons.push("任务数量较多");
    if (averageProgress < 70) reasons.push("平均完成进度偏低");
    if (reasons.length === 0) reasons.push("投入与进度处于正常范围");

    return {
      person,
      date,
      totalHours,
      projectCount,
      taskCount,
      averageProgress,
      level: saturationLevel(score),
      score,
      reasons,
    };
  });
}

function minutes(time: string | undefined): number | null {
  if (!time) return null;
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

export function rateTasks(records: WorkRecord[]): TaskRating[] {
  return records.map((record) => {
    const plannedEnd = minutes(record.endTime);
    const actualEnd = minutes(record.actualFinishTime);

    if (record.progressPercent >= 100) {
      if (plannedEnd !== null && actualEnd !== null && actualEnd > plannedEnd) {
        return { recordId: record.id, stars: 4, label: "轻微延期", reason: "已完成，但实际完成时间晚于计划结束时间" };
      }
      return { recordId: record.id, stars: 5, label: "准时完成", reason: "完成进度 100%，且未晚于计划结束时间" };
    }
    if (record.progressPercent >= 80 && record.remark) {
      return { recordId: record.id, stars: 3, label: "基本可控", reason: "完成进度较高，且备注说明清楚" };
    }
    if (record.progressPercent >= 50) {
      return { recordId: record.id, stars: 2, label: "需要关注", reason: "完成进度不足，需关注后续推进" };
    }
    return { recordId: record.id, stars: 1, label: "高风险", reason: "完成进度低于 50% 或缺少有效说明" };
  });
}
