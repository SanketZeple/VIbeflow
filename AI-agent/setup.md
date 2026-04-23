# Role
You are a senior software architect.

# Context
Workspace is empty. Build a production-ready fullstack project.

Tech Stack:
- Frontend: React (Vite) + Tailwind
- Backend: FastAPI (Python)
- Database: Postgresql (SQLAlchemy + Alembic)
- Auth: JWT

# Task
Create a complete project structure with separate frontend and backend in the root directory.

# Constraints
- Do NOT implement any business features
- Do NOT add Docker or deployment setup
- Focus only on clean, scalable structure
- Follow industry-standard practices

# Requirements

## Root
- frontend/
- backend/
- README.md

---

## Backend Structure (FastAPI)

backend/
- app/
  - main.py
  - api/          (route handlers)
  - models/       (DB models)
  - schemas/      (request/response)
  - services/     (business logic)
  - core/         (config, security, utils)
  - db/           (session, base)
- tests/
- alembic/
- requirements.txt

---

## Frontend Structure (React)

frontend/
- src/
  - pages/
  - components/
  - hooks/
  - services/     (API calls)
  - utils/
- public/
- index.html
- package.json

---

## Output
- Folder structure
- Minimal starter files only
- No feature implementation

