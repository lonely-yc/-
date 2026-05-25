import { useState } from "react";
import type { SummaryRow } from "../types";

type SummaryKey = "project" | "person" | "module";

type SummaryTableProps = {
  summaries: {
    byProject: SummaryRow[];
    byPerson: SummaryRow[];
    byModule: SummaryRow[];
  };
};

const tabs: Array<{ key: SummaryKey; label: string }> = [
  { key: "project", label: "项目汇总" },
  { key: "person", label: "人员汇总" },
  { key: "module", label: "模块汇总" },
];

export function SummaryTable({ summaries }: SummaryTableProps) {
  const [activeTab, setActiveTab] = useState<SummaryKey>("project");
  const rows =
    activeTab === "project" ? summaries.byProject : activeTab === "person" ? summaries.byPerson : summaries.byModule;

  return (
    <section className="panel">
      <div className="section-heading">
        <h2>工时汇总</h2>
        <div className="segmented-control" role="tablist" aria-label="汇总维度">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              className={activeTab === tab.key ? "active" : ""}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>名称</th>
              <th>总工时</th>
              <th>任务数</th>
              <th>参与人员</th>
              <th>平均进度</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="table-empty" colSpan={5}>
                  暂无汇总数据。
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.key}>
                  <td>{row.key}</td>
                  <td>{row.totalHours.toFixed(1)}</td>
                  <td>{row.taskCount}</td>
                  <td>{row.personCount}</td>
                  <td>{row.averageProgress}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
