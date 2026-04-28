# Product Requirements Document (PRD)
## VibeFlow Kanban Board

---

## 1. Problem Statement
Teams need a simple, self-hosted task management tool to track work visually. Existing tools (e.g., Jira) are complex, heavy, and not optimized for small teams or local setups.

---

## 2. Goal
Build a lightweight, multi-user Kanban board inspired by the [Atlassian Jira Kanban template](https://www.atlassian.com/software/jira/templates/kanban) that enables teams to:
- Manage tasks visually with an 8-column workflow
- Track ownership and progress through drag-and-drop
- Log time spent on tasks for accurate productivity tracking
- View aggregated work reports for data-driven insights

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

## Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **Interactions:** `@dnd-kit` for drag-and-drop, Framer Motion for animations
- **HTTP Client:** Axios

### Backend
- **Framework:** FastAPI (Python)
- **ORM & Database:** PostgreSQL (`psycopg2-binary`)
- **Migrations:** Alembic
- **Validation:** Pydantic
- **Authentication:** JWT (`python-jose`), `passlib` for bcrypt hashing

### Infrastructure & Tools
- **Containerization:** Docker & Docker Compose
- **Testing:** Pytest (Backend), Vitest (Frontend)

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

## 6. Completion KPIs: VibeFlow Kanban Board

These KPIs are grouped by functional area and are designed to be **binary** (Pass/Fail). All must be **Pass** for the assignment to be considered complete.

### 6.0 KPI Execution Summary

| Category | Total KPIs | Status |
| :-- | :-- | :-- |
| 6.1 Authentication | 6 | 0 / 6 PASS |
| 6.2 Board Visibility | 3 | 0 / 3 PASS |
| 6.3 Task Creation | 6 | 0 / 6 PASS |
| 6.4 Drag & Drop | 3 | 0 / 3 PASS |
| 6.5 Assignment | 6 | 0 / 6 PASS |
| 6.6 Time Logging | 5 | 0 / 5 PASS |
| 6.7 Reporting | 5 | 0 / 5 PASS |
| 6.8 Deployment | 4 | 0 / 4 PASS |
| 6.9 Testing | 6 | 0 / 6 PASS |
| **Total** | **44** | **0 / 44 PASS** |

---

---

### 6.1 🔐 User Management & Authentication

| # | KPI | Verification Method | Status | Notes |
| :-- | :-- | :-- | :-- | :-- |
| 1 | User can register with email and password | Create a new account via UI; confirm success redirect/message. | | |
| 2 | Registered user can log in successfully | Log in with created credentials; session established. | | |
| 3 | Invalid login credentials are rejected with appropriate error | Attempt login with wrong password; see error message. | | |
| 4 | Session persists after browser restart | Close and reopen browser; user remains logged in. | | |
| 5 | User can log out and session is terminated | Click logout; attempt to access protected page; redirected to login. | | |
| 6 | Password is stored hashed (not plaintext) | Inspect database; password column contains bcrypt hash or similar. | | |

---

### 6.2 📋 Shared Board Visibility

| # | KPI | Verification Method | Status | Notes |
| :-- | :-- | :-- | :-- | :-- |
| 7 | All authenticated users see the same board and tasks | Log in as User A, create a task. Log in as User B; verify task is visible. | | |
| 8 | Board displays all 8 columns in correct order | Visual inspection of UI. | | |
| 9 | Task card displays: Title, Assignee (if any), Due Date (if any), Created By | Create task with all fields; verify all information appears on card. | | |

---

### 6.3 ✏️ Task Creation & Validation

| # | KPI | Verification Method | Status | Notes |
| :-- | :-- | :-- | :-- | :-- |
| 10 | New task creation requires only Title | Submit form with only Title; task created successfully. | | |
| 11 | Title exceeding 255 characters is rejected | Attempt to create task with 300-character title; receive error. | | |
| 12 | New task defaults to `Backlog` column | Create task; verify it appears in the Backlog column. | | |
| 13 | New task has no assignee by default | Create task; verify Assignee field is empty/blank. | | |
| 14 | New task records the creating user as `created_by` | Create task; verify "Created By" shows the logged-in user's email/name. | | |
| 15 | New task appears at the bottom of the Backlog column | Create multiple tasks; verify newest is last in list. | | |

---

### 6.4 🖱️ Drag-and-Drop Workflow

| # | KPI | Verification Method | Status | Notes |
| :-- | :-- | :-- | :-- | :-- |
| 16 | Task can be dragged from one column to another | Drag a task card; drop in different column; UI updates immediately. | | |
| 17 | Status change persists after page refresh | Drag task to new column, refresh page; task remains in new column. | | |
| 18 | Tasks can be reordered within the same column | Drag task vertically; order changes and persists after refresh. | | |

---

### 6.5 👤 Assignment Management & History

| # | KPI | Verification Method | Status | Notes |
| :-- | :-- | :-- | :-- | :-- |
| 19 | Task modal contains a dropdown of all registered users for assignee | Open modal; dropdown lists all users. | | |
| 20 | Assignee can be changed and saved | Select new assignee, save; task card updates. | | |
| 21 | Assignee can be set to "Unassigned" (null) | Select empty option, save; assignee removed. | | |
| 22 | Assignment history is recorded when assignee changes | Change assignee; check AssignmentHistory table for new record. | | |
| 23 | Assignment history displays in task modal | Open modal; see list of changes with old/new values, who changed, and timestamp. | | |
| 24 | Assignment history shows correct chronological order (most recent first) | Make multiple changes; verify order in UI. | | |

---

### 6.6 ⏱️ Time Logging

| # | KPI | Verification Method | Status | Notes |
| :-- | :-- | :-- | :-- | :-- |
| 25 | "Log Work" button exists in task modal | Open any task modal; button is visible. | | |
| 26 | Time can be logged as decimal hours (e.g., 2.5) | Enter 2.5, add description, save; worklog created. | | |
| 27 | Worklog is associated with the logged-in user | Log time as User A; check worklog record has correct user_id. | | |
| 28 | Worklog is immutable (cannot edit or delete via UI) | No edit/delete buttons present for existing worklogs. | | |
| 29 | Multiple worklogs can be added to the same task | Log time twice; both appear in database. | | |

---

### 6.7 📊 Time Report View

| # | KPI | Verification Method | Status | Notes |
| :-- | :-- | :-- | :-- | :-- |
| 30 | Dedicated report page exists and is navigable | Click nav link; page loads at `/reports/time`. | | |
| 31 | Report shows each task with Title, Status, Assignee, and Total Hours | Verify all fields present for each task. | | |
| 32 | Task total hours correctly sums all worklogs for that task | Manually sum worklogs; compare with displayed total. | | |
| 33 | Project grand total correctly sums all worklogs across all tasks | Manually sum all worklogs; compare with grand total. | | |
| 34 | Report is accessible to any logged-in user | Log in as any user; report page loads. | | |

---

### 6.8 🐳 Docker & Deployment

| # | KPI | Verification Method | Status | Notes |
| :-- | :-- | :-- | :-- | :-- |
| 35 | `docker-compose up` builds and starts the application without errors | Run command; observe successful container startup. | | |
| 36 | Application is accessible at `http://localhost:8080` | Open browser to URL; login page loads. | | |
| 37 | Database file persists in a Docker volume/mount | Stop and restart container; previously created data remains. | | |
| 38 | All application features work inside the Docker container | Perform a smoke test of key features (create task, drag, log time). | | |

---

### 6.9 🧪 Testing & Documentation

| # | KPI | Verification Method | Status | Notes |
| :-- | :-- | :-- | :-- | :-- |
| 39 | Unit test exists for time logging logic | Check test suite; run tests; verify pass. | | |
| 40 | Unit test exists for assignment history creation | Check test suite; run tests; verify pass. | | |
| 41 | Unit test exists for time report calculation | Check test suite; run tests; verify pass. | | |
| 42 | All unit tests pass | Run test command; observe all green. | | |
| 43 | README.md contains clear Docker setup instructions | Read README; follow steps; app starts without guesswork. | | |
| 44 | API endpoints are documented (in README or separate file) | Locate documentation; contains list of endpoints and example payloads. | | |

---

### 6.10 🤖 AI Agent Integration (AI-specific)

| # | KPI | Verification Method | Status | Notes |
| :-- | :-- | :-- | :-- | :-- |
| 45 | AI Agent correctly identifies the board state | Ask AI "How many tasks are in Backlog?"; verify count matches UI. | | |
| 46 | AI can perform CRUD actions via natural language | Command AI "Create task X" or "Assign Y to me"; verify task/assignee update in DB. | | |
| 47 | Persona-based responses are distinct and relevant | Switch to "Frontend Agent"; ask for tech advice; verify React/Vite focus in response. | | |
| 48 | AI actions are recorded in history with "AI Action" tag | Perform AI command; check history list in modal for correct attribution. | | |

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

## 9. Future Enhancements

- Multiple boards/projects
- Real-time updates (WebSockets)
- Comments & attachments
- Notifications
- Role-based permissions
- Advanced reporting & filters