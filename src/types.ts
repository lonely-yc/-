export type WorkType = "开发" | "测试" | "联调" | "会议" | "现场支持" | "文档" | "其他";

export type ProgressLevel = "未开始" | "进行中" | "已完成" | "阻塞";

export type WorkRecord = {
  id: string;
  rowNumber: number;
  sequence?: number;
  date: string;
  person: string;
  project: string;
  module: string;
  task: string;
  workType: WorkType;
  hours: number;
  startTime: string;
  endTime: string;
  progressPercent: number;
  progressLabel: ProgressLevel;
  actualFinishTime?: string;
  remark: string;
};

export type RawWorkRow = Record<string, unknown>;

export type ValidationSeverity = "error" | "warning";

export type ValidationIssue = {
  recordId: string;
  rowNumber: number;
  field: keyof WorkRecord | "row";
  severity: ValidationSeverity;
  message: string;
};

export type SaturationLevel = "空闲" | "正常" | "饱和" | "过载";

export type PersonDaySaturation = {
  person: string;
  date: string;
  totalHours: number;
  projectCount: number;
  taskCount: number;
  averageProgress: number;
  level: SaturationLevel;
  score: number;
  reasons: string[];
};

export type TaskRating = {
  recordId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  label: string;
  reason: string;
};

export type SummaryRow = {
  key: string;
  totalHours: number;
  taskCount: number;
  personCount: number;
  averageProgress: number;
};
