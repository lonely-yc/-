import type { PersonDaySaturation, SummaryRow, TaskRating, ValidationIssue, WorkRecord } from "../types";
import { Stars } from "./Stars";

type DashboardProps = {
  records: WorkRecord[];
  issues: ValidationIssue[];
  summaries: {
    byProject: SummaryRow[];
    byPerson: SummaryRow[];
    byModule: SummaryRow[];
  };
  saturation: PersonDaySaturation[];
  ratings: TaskRating[];
};

export function Dashboard({ records, issues, summaries, saturation, ratings }: DashboardProps) {
  const totalHours = records.reduce((sum, record) => sum + record.hours, 0);
  const peopleCount = new Set(records.map((record) => record.person.trim()).filter(Boolean)).size;
  const projectCount = new Set(records.map((record) => record.project.trim()).filter(Boolean)).size;
  const saturatedCount = saturation.filter((item) => item.score >= 70).length;
  const ratingMap = new Map(ratings.map((rating) => [rating.recordId, rating]));
  const lowStarTasks = records
    .map((record) => ({ record, rating: ratingMap.get(record.id) }))
    .filter((item): item is { record: WorkRecord; rating: TaskRating } => Boolean(item.rating && item.rating.stars <= 2))
    .slice(0, 6);

  const metrics = [
    { label: "今日总工时", value: `${totalHours.toFixed(1)}h`, hint: `${records.length} 条记录` },
    { label: "参与人员", value: peopleCount, hint: "去重人员数" },
    { label: "涉及项目", value: projectCount, hint: "有效项目数" },
    { label: "提示数量", value: issues.length, hint: "校验错误与提醒" },
    { label: "饱和人员", value: saturatedCount, hint: "饱和/过载人天" },
    { label: "低星任务", value: lowStarTasks.length, hint: "1-2 星任务" },
  ];

  return (
    <div className="view-stack">
      <section className="metric-grid" aria-label="核心指标">
        {metrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.hint}</small>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>项目投入排行</h2>
          <span>按工时降序</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>项目</th>
                <th>总工时</th>
                <th>任务数</th>
                <th>参与人员</th>
                <th>平均进度</th>
              </tr>
            </thead>
            <tbody>
              {summaries.byProject.length === 0 ? (
                <tr>
                  <td className="table-empty" colSpan={5}>
                    暂无项目汇总数据。
                  </td>
                </tr>
              ) : (
                summaries.byProject.slice(0, 8).map((row) => (
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

      <section className="panel">
        <div className="section-heading">
          <h2>低星任务</h2>
          <span>优先跟进 1-2 星</span>
        </div>
        <div className="risk-list">
          {lowStarTasks.length === 0 ? (
            <p className="empty-text">暂无低星任务。</p>
          ) : (
            lowStarTasks.map(({ record, rating }) => (
              <article className="risk-item" key={record.id}>
                <div>
                  <strong>{record.task}</strong>
                  <p>
                    {record.person} · {record.project} · 进度 {record.progressPercent}%
                  </p>
                </div>
                <div className="risk-meta">
                  <Stars rating={rating.stars} />
                  <span>{rating.label}</span>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
