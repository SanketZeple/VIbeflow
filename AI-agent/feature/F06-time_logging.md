# F-06: Time Logging
## Overview
Authenticated users can log work hours against any task via the task modal. Worklogs are immutable once created.

---
## APIs
- POST /tasks/:id/worklogs → create worklog

---
## Models
- WorkLog (task_id, user_id, hours, description, logged_at)

---
## Flow
- User opens task modal → clicks "Log Work"
- Fields: Hours (decimal, required), Description (optional)
- Submit → POST /tasks/:id/worklogs
- Worklog appears in modal list (immutable)

---
## Rules
- hours must be positive decimal (e.g. 0.5, 2.5)
- user_id always from JWT
- worklogs are immutable (no edit or delete via UI or API)
- multiple worklogs allowed per task

---
## Edge Cases
- hours = 0 or negative → reject
- non-numeric hours → reject
- unauthenticated → 401

---
## Out of Scope
- editing or deleting worklogs
- worklog categories or tags

---
## Constraints
- Follow existing architecture and patterns
- Reuse existing modules/services
- No unnecessary new abstractions