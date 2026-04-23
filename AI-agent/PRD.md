# Product Requirements Document (PRD)
## VibeFlow Kanban Board

---

## 1. Problem Statement
Teams need a simple, self-hosted task management tool to track work visually. Existing tools (e.g., Jira) are complex, heavy, and not optimized for small teams or local setups.

---

## 2. Goal
Build a lightweight, multi-user Kanban board that enables teams to:
- Manage tasks visually
- Track ownership and progress
- Log time spent on tasks
- View aggregated work reports

---

## 3. Target Users
- Small dev teams
- Freelancers
- Internal teams needing simple workflow tracking
- Users preferring self-hosted tools

---

## 4. Key Features (MVP)

### Authentication
- Register, login, logout
- JWT-based session

### Shared Kanban Board
- Single global board
- 8 workflow columns
- Task cards with key details

### Task Management
- Create, edit tasks
- Assign users
- Set due dates

### Drag & Drop
- Move tasks across columns
- Reorder within column

### Assignment History
- Track all assignee changes
- Show history in UI

### Time Logging
- Log hours per task
- Immutable logs

### Reporting
- Per-task time summary
- Total project time

---

## 5. User Journey

1. User registers/logs in
2. Lands on board
3. Creates tasks
4. Moves tasks across workflow
5. Assigns tasks to users
6. Logs time on tasks
7. Views report page for insights

---

## 6. Success Metrics (KPIs)

- Users can complete full task lifecycle (create → move → assign → log time)
- Data persists across sessions
- All users see consistent shared board
- Time reports correctly aggregate data
- System runs via Docker without issues

---

## 7. Non-Goals (Out of Scope)

- Multiple boards
- Real-time collaboration
- Notifications (email/in-app)
- File attachments
- Role-based access control
- OAuth login

---

## 8. Constraints

- Must run locally via Docker
- Use SQLite (no external DB)
- Keep UI simple and fast
- No third-party SaaS dependency

---

## 9. Assumptions

- Low to moderate number of users
- Single shared workflow is sufficient
- Users trust each other (no strict permissions needed)

---

## 10. Risks

- JWT handling errors may break auth flow
- Drag-and-drop state sync issues
- Incorrect time aggregation logic
- SQLite limitations under higher load

---

## 11. Future Enhancements

- Multiple boards/projects
- Real-time updates (WebSockets)
- Comments & attachments
- Notifications
- Role-based permissions
- Advanced reporting & filters