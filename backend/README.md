# ProtoLab — Backend

## 🚀 Overview

This repository contains the backend for ProtoLab — a collaborative research platform for teams to run experiments, manage papers, discuss findings, and leverage AI-assisted insights. The backend is built with TypeScript, Express, Prisma (Postgres), Socket.io (real-time collaboration), Redis (presence / transient state), and optional AI integrations (Groq / Google Generative AI).

## ✨ Key Features

- **User authentication** (JWT)
- **Team management** with roles (owner, editor, viewer)
- **Experiments**: create, update, delete, and annotate experiments
- **Papers**: upload, summarize, link/unlink to experiments, search
- **Comments** with mentions, real-time broadcasts, and simple reaction placeholder
- **Knowledge graphs** for teams and related-experiment relations
- **AI features**: paper summarization, experiment insights, next-step suggestions, key info extraction
- **Real-time collaboration**: Socket.io + Yjs for live editing, cursor presence, and comments
- **Redis** used for presence tracking and debounced persistence
- **Prisma** models and seed scripts for quick local development

---

## 🧰 Tech Stack

- Node.js + TypeScript
- Express
- Prisma (Postgres)
- Socket.io, Yjs
- Redis (ioredis)
- AI (optional): Groq / Google Generative AI

---

## ⚙️ Environment & Setup

Required environment variables (examples):

- `DATABASE_URL` (Postgres connection)
- `JWT_SECRET` (JWT signing secret)
- `REDIS_URL` (optional, default: `redis://localhost:6379`)
- `PORT` (optional)
- `CLIENT_URL` (for Socket CORS, optional)
- `GROQ_API_KEY` or `GOOGLE_GEMINI_API_KEY` (optional, for AI features)

Install & run (development):

1. install dependencies

```bash
cd backend
npm install
```

2. run database migrations & seed (if needed)

```bash
# apply migrations (prisma migrate) – run your migration commands
npx prisma migrate dev --name init
# seed database
npm run seed
```

3. start dev server

```bash
npm run dev
```

Scripts (package.json):

- `dev` — dev server (ts-node-dev)
- `build` — TypeScript build
- `start` — run compiled JS
- `seed` — run Prisma seed script

---

## 🗂️ Database (Prisma)

Main models: `User`, `Team`, `TeamMember`, `Experiment`, `Paper`, `ExperimentPaper`, `Comment`, `Tag`, `CodeVersion`.

Seed data creates sample users, teams, experiments, papers and links for local testing.

---

## 🔐 Authentication

- JWT auth is used. The middleware reads `Authorization: Bearer <token>` and sets `req.userId`.
- Endpoints listed require `authenticate` where noted.

---

## 🔌 API Reference

Base path: `/api`

Note: All endpoints marked **(auth)** require a valid `Authorization` header.

### /api/auth

- POST `/api/auth/register` — Register a new user
  - Body: `{ email, password, name, role? }`
  - Response: `{ user, token }`

- POST `/api/auth/login` — Login
  - Body: `{ email, password }`
  - Response: `{ user, token }`

### /api/teams

- GET `/api/teams/my-teams` **(auth)** — Get all teams for current user
- GET `/api/teams/:id` **(auth)** — Get single team (must be member)
- POST `/api/teams` **(auth)** — Create team
  - Body: `{ name, description? }`
- PUT `/api/teams/:id` **(auth)** — Update team (owner/editor)
- DELETE `/api/teams/:id` **(auth)** — Delete team (owner only)

- POST `/api/teams/:id/members` **(auth)** — Add member
  - Body: `{ userId, role? }`
- PUT `/api/teams/:id/members/:userId` **(auth)** — Update member role (owner only)
  - Body: `{ role }` (owner/editor/viewer)
- DELETE `/api/teams/:id/members/:userId` **(auth)** — Remove member (owner or self)
- GET `/api/teams/:id/stats` **(auth)** — Fetch team statistics (counts)

### /api/experiments

- GET `/api/experiments/team/:teamId` **(auth)** — Get all experiments for a team
- GET `/api/experiments/:id` **(auth)** — Get single experiment (with comments, tags, papers, code versions)
- POST `/api/experiments/new` **(auth)** — Create experiment
  - Body: `{ title, hypothesis?, method?, teamId, tags? }`
- PUT `/api/experiments/:id` **(auth)** — Update experiment
  - Body: `{ title?, hypothesis?, method?, observations?, results?, failures?, nextSteps?, status? }`
- DELETE `/api/experiments/:id` **(auth)** — Delete experiment

### /api/papers

- GET `/api/papers/team/:teamId` **(auth)** — Get all papers for team
- GET `/api/papers/:id` **(auth)** — Get single paper
- POST `/api/papers` **(auth)** — Create paper
  - Body: `{ title, authors?, url?, pdfUrl?, summary?, findings?, methodology?, limitations?, teamId }`
- PUT `/api/papers/:id` **(auth)** — Update paper
- DELETE `/api/papers/:id` **(auth)** — Delete paper (uploader or admin)
- POST `/api/papers/:paperId/link-experiment` **(auth)** — Link paper to an experiment
  - Body: `{ experimentId }`
- DELETE `/api/papers/:paperId/unlink-experiment/:experimentId` **(auth)** — Unlink paper
- GET `/api/papers/team/:teamId/search?query=...` **(auth)** — Search papers in team by title/authors/summary

### /api/comments

- GET `/api/comments/experiment/:experimentId` **(auth)** — Get comments for an experiment
- GET `/api/comments/:id` **(auth)** — Get single comment
- POST `/api/comments` **(auth)** — Create comment (realtime broadcast)
  - Body: `{ content, experimentId, mentions?: string[] }`
- PUT `/api/comments/:id` **(auth)** — Update comment (only author)
- DELETE `/api/comments/:id` **(auth)** — Delete comment (only author)
- GET `/api/comments/mentions/me` **(auth)** — Get comments which mention current user
- POST `/api/comments/:id/react` **(auth)** — React to comment (placeholder)
  - Body: `{ reaction }` (e.g. 'like')

### /api/graph

- GET `/api/graph/teams/:teamId` **(auth)** — Generate knowledge graph for a team (nodes, links, stats)
- GET `/api/graph/experiments/:experimentId/relations` **(auth)** — Get related experiments (shared papers / tags)

### /api/ai

- POST `/api/ai/papers/:id/summarize` **(auth)** — Summarize stored paper; caches summary on paper record
- POST `/api/ai/papers/quick-summary` **(auth)** — Quick summary from arbitrary text
  - Body: `{ title, content }`
- GET `/api/ai/teams/:teamId/insights` **(auth)** — Generate team insights from recent experiments
- POST `/api/ai/experiments/:id/suggest` **(auth)** — Suggest next steps for experiment
- POST `/api/ai/experiments/:id/extract` **(auth)** — Extract key methods, metrics, findings from experiment

---

## 🔁 WebSocket (Socket.io) — Real-time Events

Connect: set auth token in handshake (socket.handshake.auth.token)

Client -> Server events

- `join-experiment` (experimentId)
- `leave-experiment` (experimentId)
- `experiment-update` ({ experimentId, changes })
- `cursor-move` ({ experimentId, position })
- `new-comment` ({ experimentId, comment })
- `typing-start` ({ experimentId })
- `typing-stop` ({ experimentId })
- `yjs-sync-step1` ({ experimentId, stateVector }) — Yjs sync
- `yjs-update` ({ experimentId, update }) — Yjs realtime updates
- `update-presence` ({ experimentId, cursorPosition?, selection? })
- `get-presence` (experimentId)

Server -> Client events

- `user-joined` / `user-left`
- `active-users` — current active users for an experiment
- `experiment-changed` — broadcast of changes
- `cursor-update` — other users' cursors
- `comment-added` / `comment-updated` / `comment-deleted`
- `paper-added` / `paper-updated` / `paper-deleted` / `paper-linked` / `paper-unlinked`
- `member-added` / `member-removed` / `member-role-updated`
- `user-typing` / `user-stopped-typing`
- `yjs-sync-step2` / `yjs-update` (Yjs flows)
- `presence-update` / `presence-data`

Redis is used to track active users and presence with short TTLs.

---

## 🔬 AI Integration

- Implemented in `src/services/aiServices.ts`.
- Supports Groq or Google Generative AI via environment variables.
- Provides structured JSON outputs (summaries, insights, suggestions, extractions).
- If no AI API key is present, endpoints will return errors indicating no AI configured.

---

## 🧪 Testing & Seed Data

- `npm run seed` will populate the database with sample users, teams, papers and experiments (see `prisma/seed.ts`).
- Test credentials are printed by the seed script.

---

## ✅ Notes & Caveats

- Some features (comment reactions) are placeholders and may require DB schema changes to be persisted.
- AI outputs are parsed conservatively; downstream code handles parsing failures gracefully.
- Use strong `JWT_SECRET` in production and secure your DB/Redis connections.

---

If you'd like, I can also:
- Add a brief Postman collection / OpenAPI spec from these endpoints
- Add usage examples for each endpoint (curl / fetch)

Happy to expand the README with any of the above. ✨
