# VibeFlow Kanban Board — Project Scope

## What Is This Project?

VibeFlow is a **multi-user Kanban board** web application inspired by Jira's Kanban template. Teams manage tasks on a shared board with drag-and-drop workflow, assignment tracking, time logging, and reporting — fully self-hosted via Docker.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React (Vite) + TailwindCSS |
| Drag & Drop | `@dnd-kit/core` |
| Backend | Python + FastAPI |
| Database | Postgresql (SQLAlchemy + Alembic) |
| Auth | JWT + bcrypt |
| Testing | pytest |
| Container | Docker + docker-compose |

---

## MVP Features

### 🔐 Authentication
- Register / Login with email + password
- Hashed passwords (bcrypt), JWT sessions
- Session persists across browser restarts
- Protected routes; logout terminates session

### 📋 Shared Board
- All authenticated users share one global board
- Task cards show: Title, Assignee, Due Date, Created By

### ✏️ Task Management
- Create task with Title only (min required, max 255 chars)
- New tasks default to Backlog, no assignee, position at bottom
- Edit task: title, description, assignee, due date via modal

### 🖱️ Drag & Drop
- Move tasks between columns (status update persists)
- Reorder tasks within a column (position persists)

### 👤 Assignment & History
- Assign any registered user; set to Unassigned
- Every assignee change logged with old/new values, who changed it, and timestamp
- History visible in task modal (most recent first)

### ⏱️ Time Logging
- Log work in decimal hours (e.g. `2.5`) with optional description
- Worklogs are immutable (no edit/delete)
- Multiple worklogs per task

### 📊 Time Report
- Dedicated page at `/reports/time`
- Shows per-task: Title, Status, Assignee, Total Hours
- Project-level grand total

---

## Out of Scope (v1)

- Multiple boards
- Real-time collaboration (WebSockets)
- File attachments, comments, mentions
- Email notifications
- Role-based permissions
- OAuth login
