# Project Change Deployment Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the current work-hours dashboard into a project manager workspace for tracking requirement changes, development changes, deployment records, middleware configuration, trace chains, and delivery statistics.

**Architecture:** Keep the existing Vite + React + TypeScript app. Add a focused project-change domain module with mock data, statistics, validation helpers, and lightweight Excel import support; replace the visible UI with concise project-manager pages. Existing work-hour modules can remain unused so the refactor stays low-risk.

**Tech Stack:** React, TypeScript, Vite, Vitest, xlsx, lucide-react, plain CSS.

---

## File Structure

- Create: `src/changeTracker.ts` - domain types, mock data, Excel row parsing, relationship helpers, statistics.
- Create: `src/changeTracker.test.ts` - lightweight tests for statistics and trace relationships.
- Create: `src/components/ChangeDeploymentApp.tsx` - all visible pages for the new MVP.
- Modify: `src/App.tsx` - render the new tracker app.
- Modify: `src/components/Layout.tsx` - update navigation and app title.
- Modify: `src/styles.css` - replace the old work-hours dashboard look with a simpler fresh project-management UI.

## Task 1: Domain Model And Statistics

- [ ] Create `src/changeTracker.ts` with four ledgers: projects, requirement changes, development changes, deployments.
- [ ] Add mock data covering normal project, late urgent change, multiple development changes, multi-change deployment, middleware IP/port/config, failed/pending deployment, and unlinked change id.
- [ ] Add helpers for dashboard metrics, project stats, trace chains, relationship gaps, and Excel row ingestion.
- [ ] Add `src/changeTracker.test.ts` covering late change ratio, deployment anomaly count, trace chain linking, and unlinked deployment ids.
- [ ] Run `npm test -- src/changeTracker.test.ts`.

## Task 2: UI Shell And Pages

- [ ] Update `src/components/Layout.tsx` navigation to: 首页看板、Excel 导入、需求变更、开发改动、发包部署、项目追踪链、统计分析.
- [ ] Create `src/components/ChangeDeploymentApp.tsx` with state for ledgers and active view.
- [ ] Implement pages for dashboard, import/mock loading, requirement changes, development changes, deployments, trace chain, and statistics.
- [ ] Add simple add/edit form behavior for requirement changes and deployments inside page state.
- [ ] Keep style minimal, fresh, and utilitarian: white surfaces, soft blue/green accents, compact tables, no decorative AI gradients.

## Task 3: Styling And Verification

- [ ] Replace/adjust `src/styles.css` for the new tracker UI.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Start or reuse local dev server and provide URL.

## Self-Review Notes

- Spec coverage: The plan covers mock/Excel entry, four ledgers, trace chain, statistics, project-manager view, and no login/permissions.
- Scope exclusions: No real auth, Git integration, deployment-system integration, approval flow, or real config-file parsing.
- Test scope: User requested simple passing tests; tests focus on domain statistics and relationship correctness.
