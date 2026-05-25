import { useState, type ChangeEvent } from "react";
import { mockRecords } from "../data/mockRecords";
import { parseExcelFile } from "../lib/excel";
import { countIssues } from "../lib/validation";
import type { ValidationIssue, WorkRecord } from "../types";

type ImportPanelProps = {
  records: WorkRecord[];
  issues: ValidationIssue[];
  onRecordsChange: (records: WorkRecord[]) => void;
};

export function ImportPanel({ records, issues, onRecordsChange }: ImportPanelProps) {
  const [fileName, setFileName] = useState("当前使用内置示例数据");
  const counts = countIssues(issues);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseExcelFile(file);
      onRecordsChange(parsed);
      setFileName(file.name);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Excel 解析失败";
      alert(message);
    } finally {
      event.target.value = "";
    }
  }

  function reloadMockData() {
    onRecordsChange(mockRecords);
    setFileName("当前使用内置示例数据");
  }

  return (
    <div className="view-stack">
      <section className="panel">
        <div className="section-heading">
          <h2>Excel 导入</h2>
          <span>{fileName}</span>
        </div>
        <div className="import-actions">
          <label className="file-button">
            选择 Excel
            <input type="file" accept=".xlsx,.xls" onChange={handleUpload} />
          </label>
          <button className="secondary-button" type="button" onClick={reloadMockData}>
            重新载入示例数据
          </button>
        </div>
      </section>

      <section className="metric-grid compact" aria-label="导入校验统计">
        <article className="metric-card">
          <span>记录数</span>
          <strong>{records.length}</strong>
          <small>当前批次</small>
        </article>
        <article className="metric-card">
          <span>错误</span>
          <strong>{counts.errors}</strong>
          <small>需修正后使用</small>
        </article>
        <article className="metric-card">
          <span>提醒</span>
          <strong>{counts.warnings}</strong>
          <small>建议补充说明</small>
        </article>
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>校验问题</h2>
          <span>字段与进度完整性</span>
        </div>
        <IssueList issues={issues} />
      </section>
    </div>
  );
}

function IssueList({ issues }: { issues: ValidationIssue[] }) {
  if (issues.length === 0) return <p className="empty-text">暂无校验问题。</p>;

  return (
    <div className="risk-list">
      {issues.map((issue, index) => (
        <article className={`risk-item ${issue.severity}`} key={`${issue.recordId}-${issue.field}-${index}`}>
          <div>
            <strong>
              第 {issue.rowNumber} 行 · {String(issue.field)}
            </strong>
            <p>{issue.message}</p>
          </div>
          <span className="status-pill">{issue.severity === "error" ? "错误" : "提醒"}</span>
        </article>
      ))}
    </div>
  );
}
