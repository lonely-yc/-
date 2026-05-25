import type { PersonDaySaturation, TaskRating, ValidationIssue, WorkRecord } from "../types";
import { Stars } from "./Stars";

type RiskPanelProps = {
  records: WorkRecord[];
  issues: ValidationIssue[];
  saturation: PersonDaySaturation[];
  ratings: TaskRating[];
};

export function RiskPanel({ records, issues, saturation, ratings }: RiskPanelProps) {
  const recordMap = new Map(records.map((record) => [record.id, record]));
  const saturationWarnings = saturation.filter((item) => item.score >= 70);
  const lowStars = ratings.filter((rating) => rating.stars <= 2);
  const fieldIssues = issues.filter((issue) => issue.field !== "progressPercent");
  const progressIssues = issues.filter((issue) => issue.field === "progressPercent" || /进度|完成/.test(issue.message));

  return (
    <div className="view-stack">
      <RiskSection title="饱和度预警" subtitle="高投入人天" emptyText="暂无饱和度预警。">
        {saturationWarnings.map((item) => (
          <article className="risk-item warning" key={`${item.person}-${item.date}`}>
            <div>
              <strong>
                {item.person} · {item.level}
              </strong>
              <p>
                {item.date} · {item.totalHours.toFixed(1)} 小时 · {item.reasons.join("；")}
              </p>
            </div>
            <span className="status-pill">{item.score}</span>
          </article>
        ))}
      </RiskSection>

      <RiskSection title="低星任务" subtitle="1-2 星任务" emptyText="暂无低星任务。">
        {lowStars.map((rating) => {
          const record = recordMap.get(rating.recordId);
          if (!record) return null;
          return (
            <article className="risk-item danger" key={rating.recordId}>
              <div>
                <strong>{record.task}</strong>
                <p>
                  {record.person} · {record.project} · {rating.reason}
                </p>
              </div>
              <Stars rating={rating.stars} />
            </article>
          );
        })}
      </RiskSection>

      <RiskSection title="字段校验" subtitle="格式、必填与时间跨度" emptyText="暂无字段校验问题。">
        {fieldIssues.map((issue, index) => (
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
      </RiskSection>

      <RiskSection title="进度风险" subtitle="未完成、低进度与说明缺失" emptyText="暂无进度风险。">
        {progressIssues.map((issue, index) => (
          <article className={`risk-item ${issue.severity}`} key={`${issue.recordId}-progress-${index}`}>
            <div>
              <strong>第 {issue.rowNumber} 行</strong>
              <p>{issue.message}</p>
            </div>
            <span className="status-pill">进度</span>
          </article>
        ))}
      </RiskSection>
    </div>
  );
}

function RiskSection({
  title,
  subtitle,
  emptyText,
  children,
}: {
  title: string;
  subtitle: string;
  emptyText: string;
  children: React.ReactNode;
}) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children;
  const hasItems = Array.isArray(items) ? items.length > 0 : Boolean(items);

  return (
    <section className="panel">
      <div className="section-heading">
        <h2>{title}</h2>
        <span>{subtitle}</span>
      </div>
      <div className="risk-list">{hasItems ? items : <p className="empty-text">{emptyText}</p>}</div>
    </section>
  );
}
