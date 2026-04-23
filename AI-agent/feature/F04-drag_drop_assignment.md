# F-04+05: Drag & Drop + Task Modal & Assignment
## Overview
Tasks can be dragged across columns and reordered within columns. Clicking a task opens a modal to view details and manage assignee. All changes persist.

---
## APIs
- PATCH /tasks/:id → update status, position, or assignee_id

---
## Models
- Task (id, title, status, position, assignee_id, due_date, created_by)
- AssignmentHistory (task_id, old_assignee_id, new_assignee_id, changed_by, changed_at)
- User (id, name, email)

---
## Flow

**Drag & Drop**
- User drags card to new column → update status + position → PATCH /tasks/:id
- User reorders within column → update position → PATCH /tasks/:id
- UI updates immediately, persists after refresh

**Task Modal**
- User clicks card → modal opens with full task details
- Fields shown: Title, Status, Assignee, Due Date, Created By
- Assignee dropdown lists all registered users + "Unassigned" option
- User changes assignee → save → PATCH /tasks/:id
- On assignee change → write record to AssignmentHistory
- History list shown in modal (most recent first)

---
## Rules
- status and position always updated together on column change
- position recompute affects all tasks in source and target column
- assignee_id can be null (unassigned)
- created_by is read-only in modal
- AssignmentHistory recorded on every assignee change (including set to null)
- changed_by always from JWT

---
## Edge Cases
- drop in same column same position → no-op
- drop on empty column → position = 1
- concurrent drags → last write wins
- assignee set to same user → no history record written
- unauthenticated → 401

---
## Out of Scope
- editing title or due_date from modal
- deleting tasks
- real-time sync (WebSocket)
- column create/delete

---
## Constraints
- Follow existing architecture and patterns
- Reuse existing modules/services
- No unnecessary new abstractions