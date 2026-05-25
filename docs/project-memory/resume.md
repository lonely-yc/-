# Resume

## Current Goal

Build and maintain a project-management / delivery-traceability competition app, while using Markdown project memory so future Codex sessions can recover context after cleanup.

## Current State

- A reusable Codex skill exists at `C:\Users\12490\.codex\skills\project-memory-docs`.
- Current project memory starts in `docs/project-memory/README.md`.
- Existing formal design and implementation plan are in `docs/superpowers/specs/` and `docs/superpowers/plans/`.
- Current Vite entry renders `src/App.tsx`, which is a React project/personnel management interface.
- `src/changeTracker.ts` and `src/components/ChangeDeploymentApp.tsx` hold a richer requirement/development/deployment/middleware traceability tracker that may need reconnecting if the next goal is full traceability.
- Backend exists under `backend/` with Spring Boot + MySQL startup notes in `backend/README.md`.

## How To Run

- Frontend dev server: `npm run dev`
- Frontend tests: `npm test`
- Frontend build: `npm run build`
- Backend database: initialize `backend/sql/init.sql` in MySQL `localhost:13306`, `root / 1234`
- Backend server: run `mvn spring-boot:run` inside `backend/`

## Recent Changes

- 2026-05-23: Created `project-memory-docs` skill for future Markdown recovery docs.
- 2026-05-23: Added `docs/project-memory/` for this project.

## Next Steps

1. Decide whether the active UI should stay as `src/App.tsx` project/personnel management or switch/integrate `ChangeDeploymentApp` traceability modules.
2. Update design/plan docs after that direction is confirmed.
3. Run `npm test` and `npm run build` before claiming the project is ready.

## Watchouts

- Always answer the user in Chinese unless asked otherwise.
- Read this file and `README.md` first after any context cleanup.
- Keep Markdown docs updated before final responses on non-trivial project changes.
- Do not treat chat history as durable project memory.
