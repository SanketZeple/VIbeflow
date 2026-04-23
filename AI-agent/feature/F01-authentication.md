# F-01: Authentication

## Overview
JWT-based email/password authentication. All routes protected except `/auth/login` and `/auth/register`.

---

## APIs
- POST /auth/register → create user, return token
- POST /auth/login → verify user, return token
- GET /auth/me → return current user (auth required)

---

## Models
- User (email, password_hash, created_at)

---

## Flow
- Register → validate → create user → return JWT
- Login → verify credentials → return JWT
- Auth → validate JWT on protected routes → reject if invalid/expired
- Logout → client removes token

---

## Rules
- email must be valid + unique
- password min 8 chars
- password stored as bcrypt hash
- JWT contains user_id + expiry

---

## Edge Cases
- invalid login → generic error
- duplicate email → reject
- expired/invalid token → unauthorized
- no token on protected route → unauthorized

---

## Out of Scope
- password reset
- email verification
- OAuth
- rate limiting