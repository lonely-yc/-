# Project Portfolio Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the prototype into a project-centered delivery information desk with project CRUD, detail timeline, middleware details, and backend API notes.

**Architecture:** Keep the React app local-state driven. Expand the domain model in `src/changeTracker.ts`, then update `ChangeDeploymentApp.tsx` and CSS around project master data and detail views.

**Tech Stack:** React 19, TypeScript, Vite, lucide-react, xlsx, Vitest.

---

### Task 1: Expand Domain Model

**Files:**
- Modify: `src/changeTracker.ts`
- Modify: `src/changeTracker.test.ts`

- [ ] Add project personnel, resources, middleware, backend stack, CRUD helpers, and timeline helpers.
- [ ] Add tests for project upsert/delete, project detail lookup, middleware lookup, and timeline ordering.

### Task 2: Project-Centered UI

**Files:**
- Modify: `src/components/Layout.tsx`
- Modify: `src/components/ChangeDeploymentApp.tsx`

- [ ] Update navigation to include project center, project detail, middleware, timeline, and backend APIs.
- [ ] Add project list with add/edit/delete form.
- [ ] Add project detail panel with personnel, documents, Git links, technology stack, middleware tags, and timeline.
- [ ] Add backend API design page for Spring Boot + MySQL.

### Task 3: Styling And Verification

**Files:**
- Modify: `src/styles.css`

- [ ] Add clean operational UI styles for project cards, editable forms, resource lists, middleware tags, timeline, and API blocks.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Keep the existing dev server available for manual browser testing.
