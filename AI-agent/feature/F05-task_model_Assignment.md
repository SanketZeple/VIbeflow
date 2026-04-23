# F-05: Task Modal & Assignment
## Overview
Clicking a task opens a modal to view details, manage assignee, and view assignment history. All changes persist.

---
## APIs
- PATCH /tasks/:id → update assignee_id
- GET /users → fetch all registered users for dropdown

---
## Models
- Task (id, title, status, assignee_id, due_date, created_by)
- AssignmentHistory (task_id, old_assignee_id, new_assignee_id, changed_by, changed_at)
- User (id, name, email)

---
## Flow
- User clicks card → modal opens
- Fields shown: Title, Status, Assignee, Due Date, Created By
- Assignee dropdown lists all users + "Unassigned" option
- User changes assignee → save → PATCH /tasks/:id
- On change → write record to AssignmentHistory
- History shown in modal (most recent first)

---
## Rules
- assignee_id can be null (unassigned)
- created_by is read-only
- AssignmentHistory recorded on every assignee change including set to null
- changed_by always from JWT
- no history record if assignee unchanged

---
## Edge Cases
- no registered users → dropdown shows only "Unassigned"
- assignee set to same value → no-op, no history written
- unauthenticated → 401

---
## Out of Scope
- editing title, status, or due_date from modal
- deleting tasks
- comments

---
## Constraints
- Follow existing architecture and patterns
- Reuse existing modules/services
- No unnecessary new abstractions