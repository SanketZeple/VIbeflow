# F-02: Shared Board

## Overview
Single global Kanban board visible to all authenticated users with fixed workflow columns.

---

## APIs
- GET /board → fetch board with all columns + tasks

---

## Models
- Column (name, order)
- Task (title, status, position, assignee_id, due_date, created_by)

---

## Flow
- User logs in → opens `/board`
- Fetch board data
- Render 8 columns in fixed order
- Render tasks under respective columns

---

## Rules
- board is shared across all users
- columns are fixed (no create/update/delete)
- tasks must belong to a column (status)

---

## Edge Cases
- no tasks → show empty columns
- invalid token → unauthorized
- missing column data → fail gracefully

---

## Out of Scope
- multiple boards
- custom columns

## Constraints
- Follow existing architecture and patterns
- Reuse existing modules/services
- No unnecessary new abstractions