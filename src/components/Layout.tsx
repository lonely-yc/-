import type { ComponentType, ReactNode } from "react";
import { BarChart3, Boxes, Braces, FolderKanban, GitBranch, PackageCheck, ScrollText } from "lucide-react";

export type ViewKey = "projects" | "dashboard" | "changes" | "deployments" | "timeline" | "middleware" | "apis";

const navItems: Array<{ key: ViewKey; label: string; icon: ComponentType<{ size?: number }> }> = [
  { key: "projects", label: "项目信息", icon: FolderKanban },
  { key: "dashboard", label: "首页看板", icon: BarChart3 },
  { key: "changes", label: "需求改动", icon: ScrollText },
  { key: "deployments", label: "发包部署", icon: PackageCheck },
  { key: "timeline", label: "项目时间线", icon: GitBranch },
  { key: "middleware", label: "中间件配置", icon: Boxes },
  { key: "apis", label: "后端接口", icon: Braces },
];

type LayoutProps = {
  activeView: ViewKey;
  onViewChange: (view: ViewKey) => void;
  children: ReactNode;
  recordCount: number;
};

export function Layout({ activeView, onViewChange, children, recordCount }: LayoutProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <strong>项目交付信息台</strong>
          <span>项目主档 / 变更 / 发包 / 配置</span>
        </div>
        <nav className="nav-list" aria-label="主导航">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.key;
            return (
              <button
                key={item.key}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => onViewChange(item.key)}
                aria-current={isActive ? "page" : undefined}
                aria-pressed={isActive}
                title={item.label}
                type="button"
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
            <h1>项目全生命周期交付追踪台</h1>
            <p>当前台账：{recordCount} 条记录</p>
          </div>
        </header>
        {children}
      </section>
    </div>
  );
}
