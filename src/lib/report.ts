import type { PersonDaySaturation, TaskRating, WorkRecord } from "../types";

type ReportInput = {
  date: string;
  project: string;
  records: WorkRecord[];
  saturation: PersonDaySaturation[];
  ratings: TaskRating[];
};

export function generateDailyReport(input: ReportInput): string {
  const requestedProject = input.project.trim();
  const projectLabel = requestedProject || "全部项目";
  const includeAllProjects = projectLabel === "全部项目";
  const filtered = input.records.filter(
    (record) => record.date === input.date && (includeAllProjects || record.project === projectLabel),
  );
  const totalHours = filtered.reduce((sum, record) => sum + record.hours, 0).toFixed(1);
  const people = [...new Set(filtered.map((record) => record.person.trim()).filter(Boolean))];

  const mainWork = filtered
    .map((record, index) => `${index + 1}. ${record.module}：${record.task}，进度 ${record.progressPercent}%。`)
    .join("\n");

  const ratingMap = new Map(input.ratings.map((rating) => [rating.recordId, rating]));
  const lowRatings = filtered
    .map((record) => ({ record, rating: ratingMap.get(record.id) }))
    .filter((item) => item.rating && item.rating.stars <= 2)
    .map(
      (item, index) =>
        `${index + 1}. ${item.record.person.trim() || "未填写人员"} - ${item.record.task}：${item.rating!.stars} 星，${item.rating!.label}，${item.rating!.reason}`,
    )
    .join("\n");

  const saturationLines = input.saturation
    .filter((item) => item.date === input.date && people.includes(item.person.trim()))
    .map((item) => `${item.person.trim()}：当日全项目饱和度 ${item.level}，${item.totalHours} 小时，${item.reasons.join("；")}`)
    .join("\n");

  return `【项目日报】
日期：${input.date}
项目：${projectLabel}

一、今日投入
今日共 ${people.length} 人参与，累计投入 ${totalHours} 小时。

二、主要工作
${mainWork || "暂无工作记录。"}

三、饱和度与星级摘要
${saturationLines || "暂无饱和度异常。"}

四、风险问题
${lowRatings || "暂无低星任务。"}

五、后续计划
请优先关注过载人员、低星任务和备注缺失的未完成事项。`;
}
