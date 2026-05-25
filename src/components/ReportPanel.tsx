import { useEffect, useMemo, useState } from "react";
import { generateDailyReport } from "../lib/report";
import type { PersonDaySaturation, TaskRating, WorkRecord } from "../types";

type ReportPanelProps = {
  records: WorkRecord[];
  saturation: PersonDaySaturation[];
  ratings: TaskRating[];
};

export function ReportPanel({ records, saturation, ratings }: ReportPanelProps) {
  const dates = useMemo(() => [...new Set(records.map((record) => record.date))].sort(), [records]);
  const projects = useMemo(() => [...new Set(records.map((record) => record.project.trim()).filter(Boolean))].sort(), [records]);
  const [date, setDate] = useState(dates[0] ?? "");
  const [project, setProject] = useState("");
  const [report, setReport] = useState("");
  const [copyState, setCopyState] = useState("复制");
  const selectedDate = dates.includes(date) ? date : dates[0] ?? "";
  const selectedProject = project === "" || projects.includes(project) ? project : "";

  useEffect(() => {
    if (date !== selectedDate) setDate(selectedDate);
  }, [date, selectedDate]);

  useEffect(() => {
    if (project !== selectedProject) setProject(selectedProject);
  }, [project, selectedProject]);

  function buildReport() {
    setReport(generateDailyReport({ date: selectedDate, project: selectedProject, records, saturation, ratings }));
    setCopyState("复制");
  }

  async function copyReport() {
    if (!report) return;
    if (!navigator.clipboard?.writeText) {
      setCopyState("复制失败");
      return;
    }

    try {
      await navigator.clipboard.writeText(report);
      setCopyState("已复制");
    } catch {
      setCopyState("复制失败");
    }
  }

  return (
    <div className="view-stack">
      <section className="panel">
        <div className="section-heading">
          <h2>日报生成</h2>
          <span>按日期与项目生成</span>
        </div>
        <div className="report-controls">
          <label>
            日期
            <select value={selectedDate} onChange={(event) => setDate(event.target.value)} disabled={dates.length === 0}>
              {dates.length === 0 ? (
                <option value="">暂无日期</option>
              ) : (
                dates.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))
              )}
            </select>
          </label>
          <label>
            项目
            <select value={selectedProject} onChange={(event) => setProject(event.target.value)}>
              <option value="">全部项目</option>
              {projects.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={buildReport} disabled={!selectedDate}>
            生成日报
          </button>
          <button className="secondary-button" type="button" onClick={copyReport} disabled={!report}>
            {copyState}
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>日报文本</h2>
          <span>可直接复制到工作群或文档</span>
        </div>
        <pre className="report-box">{report || "请选择日期和项目后生成日报。"}</pre>
      </section>
    </div>
  );
}
