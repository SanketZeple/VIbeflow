# F-03: Task Creation & Validation
## Overview
Authenticated users create tasks via a modal. Only Title is required. Task defaults to `Backlog` column, bottom position, no assignee.

---
## APIs
- `POST /tasks` → create task, return created task

---
## Models
- Task (title, status, position, assignee_id, due_date, created_by)

---
## Flow
- User clicks "+ Create Task" → modal opens
- Fields: Title (required), Due Date (optional)
- Validate → `POST /tasks`
- Success → append card to bottom of Backlog
- Error → show inline message, keep modal open

---
## Rules
- title is required, non-empty after trim, max 255 chars
- due_date is optional, must be valid ISO date if provided
- status defaults to `Backlog`, position = last in Backlog
- assignee_id defaults to null
- created_by always derived from JWT
- position compute must be atomic (concurrent-safe)

---
## Edge Cases
- whitespace-only title → trim → reject
- title exactly 255 → accept; 256 → reject
- unauthenticated → 401
- concurrent creates → no position collision

---
## Out of Scope
- creating tasks in non-Backlog columns
- setting assignee on creation
- subtasks, bulk create

---
## Constraints
- Follow existing architecture and patterns
- Reuse existing modules/services
- No unnecessary new abstractions