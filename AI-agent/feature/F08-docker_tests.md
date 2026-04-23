# F-08+09: Delivery (Docker + Tests & Docs)
## Overview
Application runs via docker-compose. Data persists across restarts. Core logic has unit tests. README documents setup and API.

---
## Docker
- docker-compose up → builds and starts full stack, no manual steps
- App accessible at http://localhost:8080
- Postgresql DB mounted via Docker volume (persists on container restart)
- All features functional inside container

---
## Tests
- Unit test: time logging logic
- Unit test: assignment history creation
- Unit test: time report total calculation
- All tests pass via single command (npm test or pytest)

---
## Docs
- README.md: clone → docker-compose up → open browser (no guesswork)
- API endpoints documented with routes + example request/response payloads

---
## Rules
- No hardcoded secrets → use .env with .env.example committed
- DB file must not be baked into image → volume mount only

---
## Edge Cases
- Container restart → all previously created data intact
- Missing .env → app fails with clear error message on startup

---
## Out of Scope
- CI/CD pipeline
- Production deployment
- Multi-environment config

---
## Constraints
- Follow existing architecture and patterns
- Reuse existing modules/services
- No unnecessary new abstractions