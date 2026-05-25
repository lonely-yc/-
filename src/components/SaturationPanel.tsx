import type { PersonDaySaturation, WorkRecord } from "../types";

type SaturationPanelProps = {
  saturation: PersonDaySaturation[];
  records: WorkRecord[];
};

export function SaturationPanel({ saturation, records }: SaturationPanelProps) {
  const recordGroups = new Map<string, WorkRecord[]>();
  for (const record of records) {
    const key = `${record.person}__${record.date}`;
    recordGroups.set(key, [...(recordGroups.get(key) ?? []), record]);
  }

  return (
    <div className="view-stack">
      <section className="saturation-grid" aria-label="人员饱和度">
        {saturation.length === 0 ? (
          <p className="empty-text">暂无饱和度数据。</p>
        ) : (
          saturation
            .slice()
            .sort((a, b) => b.score - a.score)
            .map((item) => (
              <article className={`saturation-card level-${item.level}`} key={`${item.person}-${item.date}`}>
                <div>
                  <span>{item.date}</span>
                  <strong>{item.person}</strong>
                </div>
                <b>{item.level}</b>
                <p>
                  {item.totalHours.toFixed(1)} 小时 · {item.projectCount} 项目 · {item.taskCount} 任务
                </p>
                <small>{item.reasons.join("；")}</small>
              </article>
            ))
        )}
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>投入时间线</h2>
          <span>重叠时段按 parallel投入 展示</span>
        </div>
        <div className="timeline-list">
          {saturation.length === 0 ? (
            <p className="empty-text">暂无时间线数据。</p>
          ) : (
            saturation.map((item) => {
              const rows = (recordGroups.get(`${item.person}__${item.date}`) ?? []).slice().sort((a, b) =>
                a.startTime.localeCompare(b.startTime),
              );
              return (
                <article className="timeline-row" key={`${item.person}-${item.date}`}>
                  <div className="timeline-owner">
                    <strong>{item.person}</strong>
                    <span>{item.date}</span>
                  </div>
                  <div className="timeline-items">
                    {rows.length === 0 ? (
                      <p className="empty-text">暂无投入记录。</p>
                    ) : (
                      rows.map((record) => (
                        <div className="timeline-item" key={record.id}>
                          <span>
                            {record.startTime}-{record.endTime}
                          </span>
                          <strong>{record.project}</strong>
                          <small>
                            {record.module} · {record.hours}h · parallel投入
                          </small>
                        </div>
                      ))
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
