# F-07: Time Report
## Overview
Dedicated report page showing all tasks with total logged hours per task and a project grand total.

---
## APIs
- GET /reports/time → return all tasks with summed worklogs

---
## Models
- Task (id, title, status, assignee_id)
- WorkLog (task_id, hours)

---
## Flow
- User navigates to /reports/time
- Fetch report data
- Render table: Title | Status | Assignee | Total Hours
- Render grand total row at bottom

---
## Rules
- total hours = sum of all worklogs per task
- grand total = sum of all worklogs across all tasks
- tasks with zero worklogs show 0
- accessible to any authenticated user

---
## Edge Cases
- no worklogs exist → all totals show 0
- unauthenticated → 401

---
## Out of Scope
- filtering by user or date range
- exporting report

---
## Constraints
- Follow existing architecture and patterns
- Reuse existing modules/services
- No unnecessary new abstractions