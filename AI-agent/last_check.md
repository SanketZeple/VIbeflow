# KPI-CHECKLIST: VibeFlow Kanban Board

## Instructions
You are auditing the VibeFlow Kanban Board codebase. Go through every KPI below. For each one:
- Inspect the relevant code, files, routes, models, and UI components
- Mark as PASS or FAIL
- If FAIL, state exactly what is missing or broken in one line

Return results in this format:
| # | KPI | Status | Notes |
|:--|:--|:--|:--|
| 1 | ... | PASS / FAIL | reason if FAIL |

All 44 must be PASS for the project to be considered complete.

---

## 🔐 User Management & Authentication

| # | KPI | What to Check |
|:--|:--|:--|
| 1 | User can register with email and password | POST /auth/register exists; accepts email + password; returns success response |
| 2 | Registered user can log in successfully | POST /auth/login exists; valid credentials return JWT token |
| 3 | Invalid login credentials are rejected with appropriate error | Wrong password returns 401 with error message (not 200 or 500) |
| 4 | Session persists after browser restart | JWT stored in httpOnly cookie or localStorage; not lost on browser close |
| 5 | User can log out and session is terminated | POST /auth/logout or client clears token; protected routes reject cleared token |
| 6 | Password is stored hashed (not plaintext) | User model uses bcrypt or similar; password_hash column, never raw password stored |

---

## 📋 Shared Board Visibility

| # | KPI | What to Check |
|:--|:--|:--|
| 7 | All authenticated users see the same board and tasks | GET /board returns all tasks regardless of which user calls it; no user-scoped filtering |
| 8 | Board displays all 8 columns in correct order | Columns seeded: Backlog, Selected for Development, In Progress, In Review, In QA, Done, Blocked, Cancelled — in this order |
| 9 | Task card displays Title, Assignee, Due Date, Created By | GET /board task objects include title, assignee (name/email), due_date, created_by (name/email) |

---

## ✏️ Task Creation & Validation

| # | KPI | What to Check |
|:--|:--|:--|
| 10 | New task creation requires only Title | POST /tasks with only title field succeeds; all other fields optional |
| 11 | Title exceeding 255 characters is rejected | POST /tasks with 256+ char title returns 400 with validation error |
| 12 | New task defaults to Backlog column | Newly created task has status = "Backlog" in DB |
| 13 | New task has no assignee by default | Newly created task has assignee_id = null in DB |
| 14 | New task records the creating user as created_by | created_by set from JWT user_id, not from request body |
| 15 | New task appears at the bottom of the Backlog column | position = MAX(position) + 1 for existing Backlog tasks |

---

## 🖱️ Drag-and-Drop Workflow

| # | KPI | What to Check |
|:--|:--|:--|
| 16 | Task can be dragged from one column to another | PATCH /tasks/:id accepts status + position update; UI triggers on drop |
| 17 | Status change persists after page refresh | Updated status saved to DB; GET /board returns task in new column |
| 18 | Tasks can be reordered within the same column | PATCH /tasks/:id accepts position-only update; order persists after refresh |

---

## 👤 Assignment Management & History

| # | KPI | What to Check |
|:--|:--|:--|
| 19 | Task modal contains a dropdown of all registered users | GET /users returns all registered users; frontend populates dropdown |
| 20 | Assignee can be changed and saved | PATCH /tasks/:id accepts assignee_id update; task card reflects new assignee |
| 21 | Assignee can be set to Unassigned (null) | PATCH /tasks/:id with assignee_id: null accepted; assignee removed from task |
| 22 | Assignment history is recorded when assignee changes | AssignmentHistory row written on every assignee change (including to null) |
| 23 | Assignment history displays in task modal | GET /tasks/:id or /tasks/:id/history returns history with old_assignee, new_assignee, changed_by, timestamp |
| 24 | Assignment history shows correct chronological order (most recent first) | History records ordered by changed_at DESC |

---

## ⏱️ Time Logging

| # | KPI | What to Check |
|:--|:--|:--|
| 25 | "Log Work" button exists in task modal | Button present in task modal UI; not hidden or disabled |
| 26 | Time can be logged as decimal hours (e.g. 2.5) | POST /tasks/:id/worklogs accepts hours as decimal; record created in DB |
| 27 | Worklog is associated with the logged-in user | WorkLog.user_id set from JWT, not request body |
| 28 | Worklog is immutable (cannot edit or delete via UI) | No PATCH or DELETE /worklogs/:id endpoint or UI button exists |
| 29 | Multiple worklogs can be added to the same task | POST /tasks/:id/worklogs can be called multiple times; all records persist |

---

## 📊 Time Report View

| # | KPI | What to Check |
|:--|:--|:--|
| 30 | Dedicated report page exists and is navigable | GET /reports/time route exists in backend; /reports/time page exists in frontend |
| 31 | Report shows each task with Title, Status, Assignee, Total Hours | All 4 fields present per task row in response and UI |
| 32 | Task total hours correctly sums all worklogs for that task | SUM(hours) per task_id matches manual sum of WorkLog records |
| 33 | Project grand total correctly sums all worklogs across all tasks | Grand total = SUM of all WorkLog.hours across entire project |
| 34 | Report is accessible to any logged-in user | /reports/time only requires valid JWT; no role check |

---

## 🐳 Docker & Deployment

| # | KPI | What to Check |
|:--|:--|:--|
| 35 | docker-compose up builds and starts without errors | docker-compose.yml exists; all services build and start cleanly |
| 36 | Application accessible at http://localhost:8080 | Port 8080 mapped in docker-compose.yml; login page loads |
| 37 | Database file persists in a Docker volume/mount | SQLite DB path mounted as volume in docker-compose.yml; data survives restart |
| 38 | All features work inside Docker container | Auth, task create, drag, modal, time log, report all functional in container |

---

## 🧪 Testing & Documentation

| # | KPI | What to Check |
|:--|:--|:--|
| 39 | Unit test exists for time logging logic | Test file exists; covers hours validation, worklog creation, user association |
| 40 | Unit test exists for assignment history creation | Test file exists; covers history record on assignee change including null |
| 41 | Unit test exists for time report calculation | Test file exists; covers per-task sum and grand total calculation |
| 42 | All unit tests pass | Run npm test or pytest; zero failures |
| 43 | README.md contains clear Docker setup instructions | README has: clone repo → docker-compose up → open localhost:8080 |
| 44 | API endpoints are documented | README or separate API.md lists all endpoints with method, path, example payload |

---

## Summary
After auditing all 44 KPIs, return:
- Total PASS count
- Total FAIL count
- List of all FAILed KPIs with fix recommendation
- Overall verdict: COMPLETE or INCOMPLETE