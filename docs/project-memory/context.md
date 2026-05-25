# Context

## Background

The workspace is for an “AI 赋能·数智创新实践赛” entry. The intended system solves a real project-management pain point: project requirement changes, front-end/back-end edits, deployment packages, middleware IP/port/configuration, and implementation notes are often scattered across chats, Excel files, commits, and deployment records.

The tool should help a project manager or successor quickly reconstruct what changed, why it changed, who handled it, when it was deployed, and what environment configuration was involved.

## Users

- 项目经理: reviews project status, requirement changes, delivery frequency, deployment risks, and handoff records.
- 开发经理: checks development changes, code/version links, affected front-end/back-end/database/config scope.
- 普通成员: front-end, back-end, implementation, design, and testing roles participate in project records.
- 后续接管人员: reads project workspace, timeline, people, documents, Git addresses, middleware config, and deployment notes.

## Tech Stack

- Current frontend: React 19, TypeScript, Vite, lucide-react, xlsx, plain CSS.
- Current backend folder: Spring Boot + MySQL backend under `backend/`.
- Separate reference implementation: `minimax/` contains Vue/Spring Boot/MySQL implementation files.
- Current Vite entry: `src/main.tsx` renders `src/App.tsx`.

## Important Local Commands

- Install frontend dependencies: `npm install`
- Start frontend dev server: `npm run dev`
- Run frontend tests: `npm test`
- Build frontend: `npm run build`
- Start backend: run `mvn spring-boot:run` in `backend/`
- Backend database setup: run `backend/sql/init.sql` against MySQL on `localhost:13306` with `root / 1234`

## Important Files

- `src/App.tsx`: current visible React app with system home, project management, personnel management, project detail modal, middleware config upload simulation, timeline, documents, changes, deployments, and members.
- `src/changeTracker.ts`: domain module for project delivery tracker: projects, changes, development changes, deployments, middleware, dashboard metrics, trace chains, backend endpoint descriptions.
- `src/components/ChangeDeploymentApp.tsx`: alternate/full project delivery tracker UI using `changeTracker.ts`.
- `src/components/Layout.tsx`: layout/navigation for the tracker UI.
- `backend/README.md`: backend startup and API summary.

## User Preferences

- Answer in Chinese by default.
- Keep Markdown docs updated for future recovery.
- Prefer planning before implementation.
- Do not rely only on chat history; write durable docs.
