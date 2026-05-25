# Project Work Hours Saturation Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-accessible BS-side tool that loads project work-plan data, validates it, calculates staff saturation and task star ratings, shows management dashboards, and generates a daily report.

**Architecture:** Implement a frontend-only single-page application so the competition demo can run with one command and mock data. Keep domain logic in focused JavaScript modules, separate from rendering, so validation, aggregation, saturation scoring, star rating, and report generation can be tested independently.

**Tech Stack:** Vite, React, TypeScript, Vitest, xlsx, CSS modules or plain CSS, browser local state.

---

## File Structure

- Create: `package.json` - npm scripts and dependencies.
- Create: `index.html` - Vite entry HTML.
- Create: `src/main.tsx` - React app bootstrap.
- Create: `src/App.tsx` - top-level layout, navigation, and state orchestration.
- Create: `src/styles.css` - global application styling.
- Create: `src/types.ts` - shared data types.
- Create: `src/data/mockRecords.ts` - mock project work-plan records for demo and tests.
- Create: `src/lib/normalize.ts` - normalize raw Excel/mock rows into typed records.
- Create: `src/lib/validation.ts` - field and row validation rules.
- Create: `src/lib/metrics.ts` - aggregation, saturation, and star rating calculations.
- Create: `src/lib/report.ts` - daily report text generation.
- Create: `src/lib/excel.ts` - Excel upload parsing using `xlsx`.
- Create: `src/components/Layout.tsx` - shell layout and navigation.
- Create: `src/components/Dashboard.tsx` - homepage metrics and summary lists.
- Create: `src/components/ImportPanel.tsx` - mock data loading and Excel upload.
- Create: `src/components/SummaryTable.tsx` - project/person/module summaries.
- Create: `src/components/SaturationPanel.tsx` - person saturation and timeline view.
- Create: `src/components/RiskPanel.tsx` - saturation and risk prompt list.
- Create: `src/components/ReportPanel.tsx` - report generation UI.
- Create: `src/components/Stars.tsx` - visual star rating component.
- Create: `src/lib/normalize.test.ts` - normalization tests.
- Create: `src/lib/validation.test.ts` - validation tests.
- Create: `src/lib/metrics.test.ts` - metric and rating tests.
- Create: `src/lib/report.test.ts` - report generation tests.

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/types.ts`

- [ ] **Step 1: Create package metadata and scripts**

Create `package.json`:

```json
{
  "name": "project-work-hours-dashboard",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc && vite build",
    "test": "vitest run",
    "preview": "vite preview --host 127.0.0.1"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "vite": "^7.0.0",
    "typescript": "^5.8.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "xlsx": "^0.18.5",
    "lucide-react": "^0.468.0"
  },
  "devDependencies": {
    "vitest": "^3.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0"
  }
}
```

- [ ] **Step 2: Create Vite HTML entry**

Create `index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>项目工时计划智能汇总与饱和度评估台</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Create shared types**

Create `src/types.ts`:

```ts
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
```

- [ ] **Step 4: Create React bootstrap**

Create `src/main.tsx`:

```tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 5: Create temporary app shell**

Create `src/App.tsx`:

```tsx
export default function App() {
  return (
    <main className="app-placeholder">
      <h1>项目工时计划智能汇总与饱和度评估台</h1>
      <p>应用骨架已就绪，后续任务会接入数据、看板和报表。</p>
    </main>
  );
}
```

- [ ] **Step 6: Create baseline styles**

Create `src/styles.css`:

```css
:root {
  color: #172033;
  background: #f4f7fb;
  font-family:
    "Microsoft YaHei",
    "PingFang SC",
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

.app-placeholder {
  min-height: 100vh;
  display: grid;
  place-content: center;
  gap: 12px;
  text-align: center;
}
```

- [ ] **Step 7: Install dependencies**

Run: `npm install`

Expected: dependencies install successfully and `package-lock.json` is created.

- [ ] **Step 8: Run build**

Run: `npm run build`

Expected: build completes with `vite` output and no TypeScript errors.

- [ ] **Step 9: Commit scaffold**

Run:

```bash
git add package.json package-lock.json index.html src/main.tsx src/App.tsx src/styles.css src/types.ts
git commit -m "feat: scaffold work hours dashboard"
```

Expected: commit succeeds if repository is initialized. If this workspace is not a git repository, record that commits are skipped.

## Task 2: Mock Data and Normalization

**Files:**
- Create: `src/data/mockRecords.ts`
- Create: `src/lib/normalize.ts`
- Create: `src/lib/normalize.test.ts`
- Modify: `src/types.ts`

- [ ] **Step 1: Write normalization tests**

Create `src/lib/normalize.test.ts`:

```ts
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
});
```

- [ ] **Step 2: Run failing normalization tests**

Run: `npm test -- src/lib/normalize.test.ts`

Expected: FAIL because `src/lib/normalize.ts` does not exist.

- [ ] **Step 3: Implement normalization**

Create `src/lib/normalize.ts`:

```ts
import type { ProgressLevel, RawWorkRow, WorkRecord, WorkType } from "../types";

const WORK_TYPES: WorkType[] = ["开发", "测试", "联调", "会议", "现场支持", "文档", "其他"];

function text(value: unknown): string {
  if (value === undefined || value === null) return "";
  return String(value).trim();
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

function normalizeProgress(value: unknown): { percent: number; label: ProgressLevel } {
  const raw = text(value);
  if (!raw) return { percent: 0, label: "未开始" };
  if (raw.includes("%")) {
    const percent = Math.max(0, Math.min(100, Number(raw.replace("%", ""))));
    return {
      percent: Number.isFinite(percent) ? percent : 0,
      label: percent >= 100 ? "已完成" : percent <= 0 ? "未开始" : "进行中",
    };
  }
  if (raw === "已完成") return { percent: 100, label: "已完成" };
  if (raw === "阻塞") return { percent: 50, label: "阻塞" };
  if (raw === "进行中") return { percent: 50, label: "进行中" };
  if (raw === "未开始") return { percent: 0, label: "未开始" };
  const parsed = Number(raw);
  if (Number.isFinite(parsed)) {
    const percent = parsed <= 1 ? parsed * 100 : parsed;
    return {
      percent: Math.max(0, Math.min(100, percent)),
      label: percent >= 100 ? "已完成" : percent <= 0 ? "未开始" : "进行中",
    };
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
      date: text(row["日期"]),
      person: text(row["姓名"]),
      project: text(row["项目名称"]),
      module: text(row["任务模块"]),
      task: text(row["详细任务"]),
      workType: normalizeWorkType(row["工作类型"]),
      hours: numberValue(row["工作量(小时)"]),
      startTime: text(row["开始时间"]),
      endTime: text(row["结束时间"]),
      progressPercent: progress.percent,
      progressLabel: progress.label,
      actualFinishTime: text(row["实际完成时间"]) || undefined,
      remark: text(row["备注"]),
    };
  });
}
```

- [ ] **Step 4: Create mock demo records**

Create `src/data/mockRecords.ts`:

```ts
import type { RawWorkRow } from "../types";
import { normalizeRows } from "../lib/normalize";

export const rawMockRows: RawWorkRow[] = [
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
    完成进度: "100%",
    实际完成时间: "11:50",
    备注: "接口联调完成"
  },
  {
    序号: 2,
    日期: "2026-05-21",
    姓名: "张三",
    项目名称: "数据中台",
    任务模块: "报表模块",
    详细任务: "开发项目投入统计报表",
    工作类型: "开发",
    "工作量(小时)": 5,
    开始时间: "10:00",
    结束时间: "17:00",
    完成进度: "80%",
    备注: "剩余导出样式待调整"
  },
  {
    序号: 3,
    日期: "2026-05-21",
    姓名: "李四",
    项目名称: "移动巡检系统",
    任务模块: "缺陷闭环",
    详细任务: "处理缺陷状态流转页面",
    工作类型: "开发",
    "工作量(小时)": 6,
    开始时间: "09:30",
    结束时间: "16:30",
    完成进度: "60%",
    备注: ""
  },
  {
    序号: 4,
    日期: "2026-05-21",
    姓名: "王五",
    项目名称: "项目管理驾驶舱",
    任务模块: "首页看板",
    详细任务: "补充项目风险指标卡",
    工作类型: "开发",
    "工作量(小时)": 10.5,
    开始时间: "09:00",
    结束时间: "20:00",
    完成进度: "100%",
    实际完成时间: "20:30",
    备注: "加班完成"
  },
  {
    序号: 5,
    日期: "2026-05-21",
    姓名: "赵六",
    项目名称: "智慧工地平台",
    任务模块: "权限模块",
    详细任务: "改bug",
    工作类型: "测试",
    "工作量(小时)": 2,
    开始时间: "14:00",
    结束时间: "13:00",
    完成进度: "30%",
    备注: ""
  },
  {
    序号: 6,
    日期: "2026-05-21",
    姓名: "张三",
    项目名称: "移动巡检系统",
    任务模块: "现场支持",
    详细任务: "配合现场处理移动端登录问题",
    工作类型: "现场支持",
    "工作量(小时)": 2,
    开始时间: "15:00",
    结束时间: "17:30",
    完成进度: "100%",
    实际完成时间: "17:20",
    备注: "现场问题已关闭"
  }
];

export const mockRecords = normalizeRows(rawMockRows);
```

- [ ] **Step 5: Run normalization tests**

Run: `npm test -- src/lib/normalize.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit normalization**

Run:

```bash
git add src/types.ts src/data/mockRecords.ts src/lib/normalize.ts src/lib/normalize.test.ts
git commit -m "feat: normalize work plan rows"
```

Expected: commit succeeds if repository is initialized. If this workspace is not a git repository, record that commits are skipped.

## Task 3: Validation Rules

**Files:**
- Create: `src/lib/validation.ts`
- Create: `src/lib/validation.test.ts`

- [ ] **Step 1: Write validation tests**

Create `src/lib/validation.test.ts`:

```ts
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
  remark: "等待第三方接口"
};

describe("validateRecords", () => {
  it("reports missing required fields", () => {
    const issues = validateRecords([{ ...baseRecord, project: "", person: "" }]);
    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "project", severity: "error" }),
        expect.objectContaining({ field: "person", severity: "error" })
      ])
    );
  });

  it("reports invalid time order", () => {
    const issues = validateRecords([{ ...baseRecord, startTime: "15:00", endTime: "11:00" }]);
    expect(issues).toContainEqual(
      expect.objectContaining({
        field: "endTime",
        severity: "error",
        message: "结束时间必须晚于开始时间"
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
        endTime: "11:00"
      }
    ]);
    expect(issues.some((issue) => issue.message.includes("时间冲突"))).toBe(false);
  });

  it("warns for short task descriptions and unfinished tasks without remarks", () => {
    const issues = validateRecords([{ ...baseRecord, task: "改bug", progressPercent: 50, remark: "" }]);
    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "task", severity: "warning" }),
        expect.objectContaining({ field: "remark", severity: "warning" })
      ])
    );
  });
});
```

- [ ] **Step 2: Run failing validation tests**

Run: `npm test -- src/lib/validation.test.ts`

Expected: FAIL because `src/lib/validation.ts` does not exist.

- [ ] **Step 3: Implement validation rules**

Create `src/lib/validation.ts`:

```ts
import type { ValidationIssue, WorkRecord } from "../types";

const REQUIRED_FIELDS: Array<keyof WorkRecord> = [
  "date",
  "person",
  "project",
  "module",
  "task",
  "hours",
  "startTime",
  "endTime"
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
  remark: "备注"
};

function minutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return hour * 60 + minute;
}

function issue(record: WorkRecord, field: ValidationIssue["field"], severity: ValidationIssue["severity"], message: string): ValidationIssue {
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
      if (value === "" || value === undefined || value === null || value === 0) {
        issues.push(issue(record, field, "error", `${FIELD_LABELS[field]}不能为空`));
      }
    }

    if (record.hours <= 0) {
      issues.push(issue(record, "hours", "error", "工作量(小时)必须大于 0"));
    }

    const start = minutes(record.startTime);
    const end = minutes(record.endTime);
    if (start === null) {
      issues.push(issue(record, "startTime", "error", "开始时间格式应为 HH:mm"));
    }
    if (end === null) {
      issues.push(issue(record, "endTime", "error", "结束时间格式应为 HH:mm"));
    }
    if (start !== null && end !== null && end <= start) {
      issues.push(issue(record, "endTime", "error", "结束时间必须晚于开始时间"));
    }
    if (start !== null && end !== null && end > start) {
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
```

- [ ] **Step 4: Run validation tests**

Run: `npm test -- src/lib/validation.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit validation**

Run:

```bash
git add src/lib/validation.ts src/lib/validation.test.ts
git commit -m "feat: validate work plan records"
```

Expected: commit succeeds if repository is initialized. If this workspace is not a git repository, record that commits are skipped.

## Task 4: Metrics, Saturation, and Star Rating

**Files:**
- Create: `src/lib/metrics.ts`
- Create: `src/lib/metrics.test.ts`

- [ ] **Step 1: Write metrics tests**

Create `src/lib/metrics.test.ts`:

```ts
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
    remark: "完成"
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
    remark: ""
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
    remark: "还差联调"
  }
];

describe("metrics", () => {
  it("builds project, person, and module summaries", () => {
    const summaries = buildSummaries(records);
    expect(summaries.byProject.find((item) => item.key === "智慧工地平台")).toMatchObject({
      totalHours: 7,
      taskCount: 2,
      personCount: 2
    });
    expect(summaries.byPerson.find((item) => item.key === "张三")).toMatchObject({
      totalHours: 11,
      taskCount: 2,
      personCount: 1
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
});
```

- [ ] **Step 2: Run failing metrics tests**

Run: `npm test -- src/lib/metrics.test.ts`

Expected: FAIL because `src/lib/metrics.ts` does not exist.

- [ ] **Step 3: Implement metrics**

Create `src/lib/metrics.ts`:

```ts
import type { PersonDaySaturation, SaturationLevel, SummaryRow, TaskRating, WorkRecord } from "../types";

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function byKey(records: WorkRecord[], getKey: (record: WorkRecord) => string): SummaryRow[] {
  const map = new Map<string, WorkRecord[]>();
  for (const record of records) {
    const key = getKey(record) || "未填写";
    map.set(key, [...(map.get(key) ?? []), record]);
  }
  return [...map.entries()]
    .map(([key, items]) => ({
      key,
      totalHours: Number(items.reduce((sum, record) => sum + record.hours, 0).toFixed(1)),
      taskCount: items.length,
      personCount: new Set(items.map((record) => record.person)).size,
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
  const match = /(\d{1,2}):(\d{2})/.exec(time);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
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
```

- [ ] **Step 4: Run metrics tests**

Run: `npm test -- src/lib/metrics.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit metrics**

Run:

```bash
git add src/lib/metrics.ts src/lib/metrics.test.ts
git commit -m "feat: calculate saturation and task ratings"
```

Expected: commit succeeds if repository is initialized. If this workspace is not a git repository, record that commits are skipped.

## Task 5: Report Generation

**Files:**
- Create: `src/lib/report.ts`
- Create: `src/lib/report.test.ts`

- [ ] **Step 1: Write report tests**

Create `src/lib/report.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { mockRecords } from "../data/mockRecords";
import { calculateSaturation, rateTasks } from "./metrics";
import { generateDailyReport } from "./report";

describe("generateDailyReport", () => {
  it("generates a structured project daily report", () => {
    const report = generateDailyReport({
      date: "2026-05-21",
      project: "智慧工地平台",
      records: mockRecords,
      saturation: calculateSaturation(mockRecords),
      ratings: rateTasks(mockRecords)
    });

    expect(report).toContain("【项目日报】");
    expect(report).toContain("项目：智慧工地平台");
    expect(report).toContain("今日投入");
    expect(report).toContain("饱和度与星级摘要");
    expect(report).toContain("主要工作");
  });
});
```

- [ ] **Step 2: Run failing report tests**

Run: `npm test -- src/lib/report.test.ts`

Expected: FAIL because `src/lib/report.ts` does not exist.

- [ ] **Step 3: Implement report generation**

Create `src/lib/report.ts`:

```ts
import type { PersonDaySaturation, TaskRating, WorkRecord } from "../types";

type ReportInput = {
  date: string;
  project: string;
  records: WorkRecord[];
  saturation: PersonDaySaturation[];
  ratings: TaskRating[];
};

export function generateDailyReport(input: ReportInput): string {
  const filtered = input.records.filter(
    (record) => record.date === input.date && (input.project === "全部项目" || record.project === input.project),
  );
  const totalHours = filtered.reduce((sum, record) => sum + record.hours, 0).toFixed(1);
  const people = [...new Set(filtered.map((record) => record.person).filter(Boolean))];
  const projectLabel = input.project || "全部项目";

  const mainWork = filtered
    .map((record, index) => `${index + 1}. ${record.module}：${record.task}，进度 ${record.progressPercent}%。`)
    .join("\n");

  const ratingMap = new Map(input.ratings.map((rating) => [rating.recordId, rating]));
  const lowRatings = filtered
    .map((record) => ({ record, rating: ratingMap.get(record.id) }))
    .filter((item) => item.rating && item.rating.stars <= 2)
    .map((item, index) => `${index + 1}. ${item.record.person} - ${item.record.task}：${item.rating!.stars} 星，${item.rating!.reason}`)
    .join("\n");

  const saturationLines = input.saturation
    .filter((item) => item.date === input.date && people.includes(item.person))
    .map((item) => `${item.person}：${item.level}，${item.totalHours} 小时，${item.reasons.join("；")}`)
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
```

- [ ] **Step 4: Run report tests**

Run: `npm test -- src/lib/report.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit report generation**

Run:

```bash
git add src/lib/report.ts src/lib/report.test.ts
git commit -m "feat: generate daily work reports"
```

Expected: commit succeeds if repository is initialized. If this workspace is not a git repository, record that commits are skipped.

## Task 6: Excel Parsing

**Files:**
- Create: `src/lib/excel.ts`

- [ ] **Step 1: Implement Excel parser**

Create `src/lib/excel.ts`:

```ts
import * as XLSX from "xlsx";
import type { RawWorkRow } from "../types";
import { normalizeRows } from "./normalize";

export async function parseExcelFile(file: File) {
  const lowerName = file.name.toLowerCase();
  if (!lowerName.endsWith(".xlsx") && !lowerName.endsWith(".xls")) {
    throw new Error("仅支持 xlsx 或 xls 文件");
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("Excel 文件中没有工作表");
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<RawWorkRow>(sheet, { defval: "" });
  return normalizeRows(rows);
}
```

- [ ] **Step 2: Run build**

Run: `npm run build`

Expected: PASS with no TypeScript errors.

- [ ] **Step 3: Commit Excel parser**

Run:

```bash
git add src/lib/excel.ts
git commit -m "feat: parse uploaded excel files"
```

Expected: commit succeeds if repository is initialized. If this workspace is not a git repository, record that commits are skipped.

## Task 7: App Layout and Navigation

**Files:**
- Create: `src/components/Layout.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Create layout component**

Create `src/components/Layout.tsx`:

```tsx
import { BarChart3, FileInput, Gauge, ListChecks, ScrollText, Table2 } from "lucide-react";

export type ViewKey = "dashboard" | "import" | "summary" | "saturation" | "risks" | "report";

const navItems: Array<{ key: ViewKey; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { key: "dashboard", label: "首页看板", icon: BarChart3 },
  { key: "import", label: "Excel 导入", icon: FileInput },
  { key: "summary", label: "工时汇总", icon: Table2 },
  { key: "saturation", label: "人员饱和度", icon: Gauge },
  { key: "risks", label: "风险提示", icon: ListChecks },
  { key: "report", label: "日报生成", icon: ScrollText },
];

type LayoutProps = {
  activeView: ViewKey;
  onViewChange: (view: ViewKey) => void;
  children: React.ReactNode;
  recordCount: number;
};

export function Layout({ activeView, onViewChange, children, recordCount }: LayoutProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <strong>工时饱和度评估台</strong>
          <span>Excel 增强工作台</span>
        </div>
        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={`nav-item ${activeView === item.key ? "active" : ""}`}
                onClick={() => onViewChange(item.key)}
                title={item.label}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
      <section className="main-area">
        <header className="topbar">
          <div>
            <h1>项目工时计划智能汇总与饱和度评估台</h1>
            <p>当前批次：{recordCount} 条记录</p>
          </div>
        </header>
        {children}
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Wire layout into App**

Replace `src/App.tsx` with:

```tsx
import { useMemo, useState } from "react";
import { mockRecords } from "./data/mockRecords";
import { Layout, type ViewKey } from "./components/Layout";
import { validateRecords } from "./lib/validation";
import { buildSummaries, calculateSaturation, rateTasks } from "./lib/metrics";
import type { WorkRecord } from "./types";

export default function App() {
  const [activeView, setActiveView] = useState<ViewKey>("dashboard");
  const [records] = useState<WorkRecord[]>(mockRecords);

  const issues = useMemo(() => validateRecords(records), [records]);
  const summaries = useMemo(() => buildSummaries(records), [records]);
  const saturation = useMemo(() => calculateSaturation(records), [records]);
  const ratings = useMemo(() => rateTasks(records), [records]);

  return (
    <Layout activeView={activeView} onViewChange={setActiveView} recordCount={records.length}>
      <section className="panel">
        <h2>{activeView}</h2>
        <p>数据已接入：{records.length} 条，问题 {issues.length} 条，项目汇总 {summaries.byProject.length} 个，饱和度 {saturation.length} 人天，星级 {ratings.length} 条。</p>
      </section>
    </Layout>
  );
}
```

- [ ] **Step 3: Add layout styles**

Append to `src/styles.css`:

```css
.app-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 240px 1fr;
}

.sidebar {
  background: #111827;
  color: #eef2ff;
  padding: 20px 14px;
}

.brand {
  display: grid;
  gap: 6px;
  margin-bottom: 24px;
}

.brand strong {
  font-size: 18px;
}

.brand span {
  color: #a7b0c4;
  font-size: 13px;
}

.nav-list {
  display: grid;
  gap: 8px;
}

.nav-item {
  width: 100%;
  border: 0;
  border-radius: 8px;
  padding: 11px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #d7deed;
  background: transparent;
  text-align: left;
}

.nav-item.active,
.nav-item:hover {
  background: #2563eb;
  color: #ffffff;
}

.main-area {
  min-width: 0;
  padding: 22px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.topbar h1 {
  margin: 0 0 6px;
  font-size: 24px;
}

.topbar p {
  margin: 0;
  color: #64748b;
}

.panel {
  background: #ffffff;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  padding: 18px;
  box-shadow: 0 8px 24px rgb(15 23 42 / 6%);
}

@media (max-width: 820px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
  }

  .nav-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```

- [ ] **Step 4: Run build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 5: Commit layout**

Run:

```bash
git add src/App.tsx src/components/Layout.tsx src/styles.css
git commit -m "feat: add dashboard layout navigation"
```

Expected: commit succeeds if repository is initialized. If this workspace is not a git repository, record that commits are skipped.

## Task 8: Feature Components

**Files:**
- Create: `src/components/Stars.tsx`
- Create: `src/components/Dashboard.tsx`
- Create: `src/components/ImportPanel.tsx`
- Create: `src/components/SummaryTable.tsx`
- Create: `src/components/SaturationPanel.tsx`
- Create: `src/components/RiskPanel.tsx`
- Create: `src/components/ReportPanel.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Create star component**

Create `src/components/Stars.tsx`:

```tsx
export function Stars({ value }: { value: number }) {
  return (
    <span className="stars" aria-label={`${value} 星`}>
      {"★★★★★".split("").map((star, index) => (
        <span key={index} className={index < value ? "filled" : ""}>
          {star}
        </span>
      ))}
    </span>
  );
}
```

- [ ] **Step 2: Create dashboard component**

Create `src/components/Dashboard.tsx`:

```tsx
import type { PersonDaySaturation, SummaryRow, TaskRating, ValidationIssue, WorkRecord } from "../types";
import { Stars } from "./Stars";

type DashboardProps = {
  records: WorkRecord[];
  issues: ValidationIssue[];
  projectSummary: SummaryRow[];
  saturation: PersonDaySaturation[];
  ratings: TaskRating[];
};

export function Dashboard({ records, issues, projectSummary, saturation, ratings }: DashboardProps) {
  const totalHours = records.reduce((sum, record) => sum + record.hours, 0);
  const people = new Set(records.map((record) => record.person)).size;
  const projects = new Set(records.map((record) => record.project)).size;
  const overloaded = saturation.filter((item) => item.level === "饱和" || item.level === "过载").length;
  const lowStars = ratings.filter((rating) => rating.stars <= 2).length;

  return (
    <div className="page-grid">
      <section className="metric-grid">
        <div className="metric"><span>今日总工时</span><strong>{totalHours.toFixed(1)}</strong></div>
        <div className="metric"><span>参与人员</span><strong>{people}</strong></div>
        <div className="metric"><span>涉及项目</span><strong>{projects}</strong></div>
        <div className="metric"><span>提示数量</span><strong>{issues.length}</strong></div>
        <div className="metric"><span>饱和人员</span><strong>{overloaded}</strong></div>
        <div className="metric"><span>低星任务</span><strong>{lowStars}</strong></div>
      </section>
      <section className="panel">
        <h2>项目投入排行</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>项目</th><th>工时</th><th>任务数</th><th>人数</th><th>平均进度</th></tr></thead>
            <tbody>
              {projectSummary.map((row) => (
                <tr key={row.key}><td>{row.key}</td><td>{row.totalHours}</td><td>{row.taskCount}</td><td>{row.personCount}</td><td>{row.averageProgress}%</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel">
        <h2>低星任务</h2>
        <div className="risk-list">
          {ratings.filter((rating) => rating.stars <= 2).map((rating) => {
            const record = records.find((item) => item.id === rating.recordId);
            return record ? (
              <div className="risk-item" key={rating.recordId}>
                <strong>{record.person} · {record.project}</strong>
                <span>{record.task}</span>
                <Stars value={rating.stars} />
              </div>
            ) : null;
          })}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Create import panel**

Create `src/components/ImportPanel.tsx`:

```tsx
import { Upload } from "lucide-react";
import { parseExcelFile } from "../lib/excel";
import type { ValidationIssue, WorkRecord } from "../types";

type ImportPanelProps = {
  records: WorkRecord[];
  issues: ValidationIssue[];
  onRecordsChange: (records: WorkRecord[]) => void;
  onLoadMock: () => void;
};

export function ImportPanel({ records, issues, onRecordsChange, onLoadMock }: ImportPanelProps) {
  async function handleFile(file: File | undefined) {
    if (!file) return;
    try {
      onRecordsChange(await parseExcelFile(file));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Excel 解析失败");
    }
  }

  return (
    <div className="page-grid">
      <section className="panel import-actions">
        <div>
          <h2>Excel 导入</h2>
          <p>支持字段：序号、日期、姓名、项目名称、任务模块、详细任务、工作类型、工作量(小时)、开始时间、结束时间、完成进度、实际完成时间、备注。</p>
        </div>
        <label className="upload-button">
          <Upload size={18} />
          上传 Excel
          <input type="file" accept=".xlsx,.xls" onChange={(event) => handleFile(event.target.files?.[0])} />
        </label>
        <button className="secondary-button" onClick={onLoadMock}>加载演示数据</button>
      </section>
      <section className="panel">
        <h2>校验结果</h2>
        <div className="metric-grid compact">
          <div className="metric"><span>记录数</span><strong>{records.length}</strong></div>
          <div className="metric"><span>错误</span><strong>{issues.filter((issue) => issue.severity === "error").length}</strong></div>
          <div className="metric"><span>警告</span><strong>{issues.filter((issue) => issue.severity === "warning").length}</strong></div>
        </div>
        <div className="risk-list">
          {issues.map((issue, index) => (
            <div className={`risk-item ${issue.severity}`} key={`${issue.recordId}-${issue.field}-${index}`}>
              <strong>第 {issue.rowNumber} 行</strong>
              <span>{issue.message}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Create summary table**

Create `src/components/SummaryTable.tsx`:

```tsx
import { useState } from "react";
import type { SummaryRow } from "../types";

type SummaryTableProps = {
  byProject: SummaryRow[];
  byPerson: SummaryRow[];
  byModule: SummaryRow[];
};

const labels = {
  project: "按项目汇总",
  person: "按人员汇总",
  module: "按任务模块汇总",
};

export function SummaryTable({ byProject, byPerson, byModule }: SummaryTableProps) {
  const [mode, setMode] = useState<keyof typeof labels>("project");
  const rows = mode === "project" ? byProject : mode === "person" ? byPerson : byModule;

  return (
    <section className="panel">
      <div className="section-head">
        <h2>工时汇总</h2>
        <div className="segmented">
          {Object.entries(labels).map(([key, label]) => (
            <button key={key} className={mode === key ? "active" : ""} onClick={() => setMode(key as keyof typeof labels)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>名称</th><th>累计工时</th><th>任务数</th><th>人数</th><th>平均进度</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}><td>{row.key}</td><td>{row.totalHours}</td><td>{row.taskCount}</td><td>{row.personCount}</td><td>{row.averageProgress}%</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create saturation panel**

Create `src/components/SaturationPanel.tsx`:

```tsx
import type { PersonDaySaturation, WorkRecord } from "../types";

type SaturationPanelProps = {
  records: WorkRecord[];
  saturation: PersonDaySaturation[];
};

export function SaturationPanel({ records, saturation }: SaturationPanelProps) {
  return (
    <div className="page-grid">
      <section className="panel">
        <h2>人员饱和度</h2>
        <div className="saturation-grid">
          {saturation.map((item) => (
            <article className={`saturation-card level-${item.level}`} key={`${item.person}-${item.date}`}>
              <div>
                <strong>{item.person}</strong>
                <span>{item.date}</span>
              </div>
              <b>{item.level}</b>
              <p>{item.totalHours} 小时 · {item.projectCount} 个项目 · {item.taskCount} 个任务</p>
              <small>{item.reasons.join("；")}</small>
            </article>
          ))}
        </div>
      </section>
      <section className="panel">
        <h2>并行投入时间轴</h2>
        <div className="timeline-list">
          {records.map((record) => (
            <div className="timeline-row" key={record.id}>
              <span>{record.person}</span>
              <div className="timeline-block">
                <strong>{record.startTime}-{record.endTime}</strong>
                <em>{record.project} · {record.task}</em>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 6: Create risk panel**

Create `src/components/RiskPanel.tsx`:

```tsx
import type { PersonDaySaturation, TaskRating, ValidationIssue, WorkRecord } from "../types";
import { Stars } from "./Stars";

type RiskPanelProps = {
  records: WorkRecord[];
  issues: ValidationIssue[];
  saturation: PersonDaySaturation[];
  ratings: TaskRating[];
};

export function RiskPanel({ records, issues, saturation, ratings }: RiskPanelProps) {
  const ratingMap = new Map(ratings.map((rating) => [rating.recordId, rating]));

  return (
    <div className="page-grid">
      <section className="panel">
        <h2>饱和度提示</h2>
        <div className="risk-list">
          {saturation.filter((item) => item.level === "饱和" || item.level === "过载").map((item) => (
            <div className="risk-item warning" key={`${item.person}-${item.date}`}>
              <strong>{item.person} · {item.level}</strong>
              <span>{item.totalHours} 小时，{item.reasons.join("；")}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <h2>低星任务</h2>
        <div className="risk-list">
          {records.filter((record) => (ratingMap.get(record.id)?.stars ?? 5) <= 2).map((record) => {
            const rating = ratingMap.get(record.id)!;
            return (
              <div className="risk-item error" key={record.id}>
                <strong>{record.person} · {record.project}</strong>
                <span>{record.task}</span>
                <Stars value={rating.stars} />
              </div>
            );
          })}
        </div>
      </section>
      <section className="panel">
        <h2>字段与进度提示</h2>
        <div className="risk-list">
          {issues.map((issue, index) => (
            <div className={`risk-item ${issue.severity}`} key={`${issue.recordId}-${index}`}>
              <strong>第 {issue.rowNumber} 行</strong>
              <span>{issue.message}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 7: Create report panel**

Create `src/components/ReportPanel.tsx`:

```tsx
import { useMemo, useState } from "react";
import type { PersonDaySaturation, TaskRating, WorkRecord } from "../types";
import { generateDailyReport } from "../lib/report";

type ReportPanelProps = {
  records: WorkRecord[];
  saturation: PersonDaySaturation[];
  ratings: TaskRating[];
};

export function ReportPanel({ records, saturation, ratings }: ReportPanelProps) {
  const dates = [...new Set(records.map((record) => record.date).filter(Boolean))];
  const projects = ["全部项目", ...new Set(records.map((record) => record.project).filter(Boolean))];
  const [date, setDate] = useState(dates[0] ?? "");
  const [project, setProject] = useState(projects[0] ?? "全部项目");
  const report = useMemo(
    () => generateDailyReport({ date, project, records, saturation, ratings }),
    [date, project, records, saturation, ratings],
  );

  return (
    <section className="panel">
      <div className="section-head">
        <h2>日报生成</h2>
        <div className="filters">
          <select value={date} onChange={(event) => setDate(event.target.value)}>
            {dates.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={project} onChange={(event) => setProject(event.target.value)}>
            {projects.map((item) => <option key={item}>{item}</option>)}
          </select>
          <button onClick={() => navigator.clipboard.writeText(report)}>复制日报</button>
        </div>
      </div>
      <pre className="report-box">{report}</pre>
    </section>
  );
}
```

- [ ] **Step 8: Wire components into App**

Replace `src/App.tsx` with:

```tsx
import { useMemo, useState } from "react";
import { mockRecords } from "./data/mockRecords";
import { Dashboard } from "./components/Dashboard";
import { ImportPanel } from "./components/ImportPanel";
import { Layout, type ViewKey } from "./components/Layout";
import { ReportPanel } from "./components/ReportPanel";
import { RiskPanel } from "./components/RiskPanel";
import { SaturationPanel } from "./components/SaturationPanel";
import { SummaryTable } from "./components/SummaryTable";
import { validateRecords } from "./lib/validation";
import { buildSummaries, calculateSaturation, rateTasks } from "./lib/metrics";
import type { WorkRecord } from "./types";

export default function App() {
  const [activeView, setActiveView] = useState<ViewKey>("dashboard");
  const [records, setRecords] = useState<WorkRecord[]>(mockRecords);

  const issues = useMemo(() => validateRecords(records), [records]);
  const summaries = useMemo(() => buildSummaries(records), [records]);
  const saturation = useMemo(() => calculateSaturation(records), [records]);
  const ratings = useMemo(() => rateTasks(records), [records]);

  return (
    <Layout activeView={activeView} onViewChange={setActiveView} recordCount={records.length}>
      {activeView === "dashboard" && (
        <Dashboard records={records} issues={issues} projectSummary={summaries.byProject} saturation={saturation} ratings={ratings} />
      )}
      {activeView === "import" && (
        <ImportPanel records={records} issues={issues} onRecordsChange={setRecords} onLoadMock={() => setRecords(mockRecords)} />
      )}
      {activeView === "summary" && (
        <SummaryTable byProject={summaries.byProject} byPerson={summaries.byPerson} byModule={summaries.byModule} />
      )}
      {activeView === "saturation" && <SaturationPanel records={records} saturation={saturation} />}
      {activeView === "risks" && <RiskPanel records={records} issues={issues} saturation={saturation} ratings={ratings} />}
      {activeView === "report" && <ReportPanel records={records} saturation={saturation} ratings={ratings} />}
    </Layout>
  );
}
```

- [ ] **Step 9: Add component styles**

Append to `src/styles.css`:

```css
.page-grid {
  display: grid;
  gap: 16px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(120px, 1fr));
  gap: 12px;
}

.metric-grid.compact {
  grid-template-columns: repeat(3, minmax(120px, 1fr));
}

.metric {
  background: #ffffff;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  padding: 16px;
  display: grid;
  gap: 8px;
}

.metric span {
  color: #64748b;
  font-size: 13px;
}

.metric strong {
  font-size: 26px;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px;
  border-bottom: 1px solid #e5ebf3;
  text-align: left;
  white-space: nowrap;
}

th {
  color: #475569;
  background: #f8fafc;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.segmented {
  display: flex;
  gap: 6px;
  background: #eef2f7;
  padding: 4px;
  border-radius: 8px;
}

.segmented button,
.filters button,
.secondary-button {
  border: 0;
  border-radius: 6px;
  padding: 8px 12px;
  background: #ffffff;
  color: #1f2937;
}

.segmented button.active,
.filters button {
  background: #2563eb;
  color: #ffffff;
}

.filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filters select {
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 8px 10px;
}

.import-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  justify-content: space-between;
}

.upload-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 6px;
  padding: 10px 14px;
  color: #ffffff;
  background: #2563eb;
}

.upload-button input {
  display: none;
}

.risk-list {
  display: grid;
  gap: 10px;
}

.risk-item {
  border: 1px solid #dbe3ef;
  border-left: 4px solid #2563eb;
  border-radius: 8px;
  padding: 12px;
  display: grid;
  gap: 6px;
  background: #ffffff;
}

.risk-item.warning {
  border-left-color: #f59e0b;
}

.risk-item.error {
  border-left-color: #dc2626;
}

.stars {
  color: #cbd5e1;
  letter-spacing: 0;
}

.stars .filled {
  color: #f59e0b;
}

.saturation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.saturation-card {
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  padding: 14px;
  display: grid;
  gap: 8px;
  background: #ffffff;
}

.saturation-card div {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.saturation-card b {
  font-size: 22px;
}

.level-空闲 b {
  color: #16a34a;
}

.level-正常 b {
  color: #2563eb;
}

.level-饱和 b {
  color: #ca8a04;
}

.level-过载 b {
  color: #dc2626;
}

.timeline-list {
  display: grid;
  gap: 10px;
}

.timeline-row {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 12px;
  align-items: center;
}

.timeline-block {
  background: #edf4ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 10px 12px;
  display: grid;
  gap: 4px;
}

.timeline-block em {
  color: #475569;
  font-style: normal;
}

.report-box {
  margin: 0;
  padding: 16px;
  border-radius: 8px;
  background: #0f172a;
  color: #e2e8f0;
  white-space: pre-wrap;
  line-height: 1.7;
  overflow-x: auto;
}

@media (max-width: 1100px) {
  .metric-grid {
    grid-template-columns: repeat(3, minmax(120px, 1fr));
  }
}

@media (max-width: 680px) {
  .metric-grid,
  .metric-grid.compact {
    grid-template-columns: 1fr;
  }

  .import-actions,
  .section-head {
    align-items: stretch;
    flex-direction: column;
  }
}
```

- [ ] **Step 10: Run build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 11: Commit components**

Run:

```bash
git add src/App.tsx src/components src/styles.css
git commit -m "feat: add work hours dashboard screens"
```

Expected: commit succeeds if repository is initialized. If this workspace is not a git repository, record that commits are skipped.

## Task 9: Final Verification

**Files:**
- Modify: none unless verification reveals a specific issue.

- [ ] **Step 1: Run all tests**

Run: `npm test`

Expected: all test files pass.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: TypeScript and Vite build pass.

- [ ] **Step 3: Start local dev server**

Run: `npm run dev`

Expected: Vite prints a local URL such as `http://127.0.0.1:5173/`.

- [ ] **Step 4: Browser smoke test**

Open the local URL and verify:

- 首页看板 displays metrics and project ranking.
- Excel 导入 displays validation summary and can reload mock data.
- 工时汇总 switches between project, person, and module tabs.
- 人员饱和度 shows saturation cards and timeline rows.
- 风险提示 shows overload, low-star tasks, and validation messages.
- 日报生成 produces copyable Chinese report text.

- [ ] **Step 5: Final commit**

Run:

```bash
git status --short
git add .
git commit -m "chore: verify project work hours dashboard"
```

Expected: commit succeeds if repository is initialized and there are verification-related changes. If this workspace is not a git repository, record that commits are skipped.

## Self-Review Notes

- Spec coverage: Excel/mock data import, field validation, project/person/module summaries, saturation scoring, star rating, risk prompts, daily report generation, browser-accessible BS app, and mock-data-only demo are covered.
- Scope check: Login, permissions, backend database, real internal system integration, and real customer data are intentionally excluded.
- Placeholder scan: No TODO/TBD placeholders are used in implementation steps.
- Type consistency: `WorkRecord`, `ValidationIssue`, `PersonDaySaturation`, `TaskRating`, and `SummaryRow` are defined once in `src/types.ts` and reused across tasks.
