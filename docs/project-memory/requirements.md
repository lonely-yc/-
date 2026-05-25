# Requirements

## Confirmed

- Future projects should use the `project-memory-docs` skill to create and maintain Markdown project memory.
- Markdown docs must make context recoverable after conversation cleanup or context compaction.
- This project should preserve docs for requirements, design/plan links, progress, and resume notes.
- Conversation with the user should be in Chinese unless the user asks otherwise.
- The project management system should include project management and personnel management.
- Project records should include roles and permissions concepts: project manager, development manager, front-end, back-end, implementation, design, and other staff.
- Users should be able to record daily/project work context such as date, project, work content, and working hours in future scope.
- Project pages should record project info, documents, Git addresses, design links, timelines, requirement changes, deployment packages, middleware config, IP/ports, and handoff notes.
- The current competition MVP can use mock data or local data and does not need full production integrations.

## Existing Design Scope

The existing design spec covers:

- Project ledger
- Requirement change ledger
- Development change ledger
- Deployment ledger
- Middleware/configuration information
- Trace chain from requirement to development to deployment to config/result
- Dashboard and statistics
- Excel/mock data entry

See [existing design spec](../superpowers/specs/2026-05-21-project-change-deployment-design.md).

## Out Of Scope For Current MVP

- Real permission system
- Real approval workflow
- Git integration
- Deployment system integration
- Parsing real configuration files automatically
- Non-desensitized customer data

## Open Questions

- Should `src/App.tsx` remain the main project/personnel management interface, or should it switch back to `ChangeDeploymentApp` for the full traceability tracker?
- Should the backend become the source of truth for the current frontend, or should the competition demo remain frontend-only/mock-first?
- Should daily work-hours and calendar scheduling return as a first-class module?
