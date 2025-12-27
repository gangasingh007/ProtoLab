ResearchWeb – Cross-Campus Collaborative Research Platform 

## Overview

ResearchWeb is a full-stack platform where research teams maintain **live, reproducible, collaborative research records** across labs, departments, and universities.  It combines a lab notebook, code/data versioning, literature management, team collaboration, AI insights, and a visual knowledge graph into a single system. 

## Problem & Solution

### The Problem: Knowledge Fragmentation

- Senior students graduate with experiment logs, failed attempts, setup details, and vendor info on local machines, causing knowledge loss. 
- New students spend 3–6 months rediscovering what was already tried, often repeating 20+ failed experiments. 
- Supervisors manage 10+ students across labs via email, WhatsApp, and scattered GitHub repos, with no unified view of lab progress. 
- Literature reviews are duplicated as multiple students separately read the same 50+ papers. 
- Experiments cannot be reliably reproduced because exact environments, datasets, and commands are not documented. 

### The Solution: ResearchWeb

> A platform where research teams maintain live, reproducible, collaborative research records with AI-powered insights and persistent institutional memory across cohorts. 

Key ideas:  
- Central lab workspace for all experiments, papers, and discussions. 
- Real-time collaborative editing of lab notebooks with CRDT-based conflict resolution. 
- Strong links between experiments, code commits, dataset versions, and reproducible Docker environments. 
- AI for paper summarization, lab insights, and experiment recommendations. 
- Knowledge graph to visualize relationships between experiments, methods, metrics, results, and papers. 

## Core Features

### 1. Live Lab Notebook

- Structured experiment logging: hypothesis, method, observations, results, failures, and next steps. 
- Rich content: text, code blocks, plots, images, tables, and links. 
- Full version history with who-changed-what and when. 
- Reproducibility checklist: environment, dataset version, code commit, and exact commands. 

### 2. Integrated Code & Data Versioning

- Each experiment is linked to a specific Git commit and dataset version. 
- Large datasets handled via Git-LFS / S3-like storage (not bloating Git). 
- One-click “Reproduce” spins up a Docker environment, installs dependencies, fetches the dataset, and checks out the exact commit. 

### 3. AI-Powered Literature Management

- Import papers via PDF or arXiv link. 
- AI generates concise summaries, key findings, methodology, and limitations. 
- Semantic organization: e.g., “papers using attention mechanisms” or “papers on medical image segmentation.” 
- Papers are linked to experiments that implement their methods. 

### 4. Real-Time Collaboration

- Multiple users can edit the same experiment in real-time with presence indicators and live cursors. 
- Threaded comments with @mentions on specific experiment sections. 
- Status tracking: In Progress, Blocked, Complete. 
- Shared lab checklists for tasks like equipment booking or statistical tests. 

### 5. Knowledge Graph (Flowchart View)

- Nodes: Experiments, Papers, Methods, Metrics, Users. 
- Edges: “Experiment uses Method”, “Paper informs Experiment”, “Experiment measures Metric”, and “User authored Experiment”. 
- Interactive flowchart-style layout to explore how methods, datasets, and results connect across the lab. 

### 6. Lab Ontology & Standardization

- Shared vocabularies for equipment, methods (e.g., ResNet-50 fine-tuning), and metrics (Accuracy, F1-Score, Inference time). 
- Protocol templates for common workflows and onboarding new students. 
- Standard metadata fields to enable cross-experiment comparisons. 

### 7. Cross-Institution Collaboration

- Invite external collaborators with view/edit permissions per team or experiment. 
- Institutional memory export when students graduate while keeping their work searchable. 
- Shared, cross-college literature reviews and joint annotations on papers. 

### 8. AI-Generated Insights

- Lab-level insights: hyperparameter search analysis, bottleneck detection, and publication-ready experiment groupings. 
- Recommendations: suggest methods from relevant papers that have not yet been tried in current experiments. 
- Experiment-level suggestions for next steps based on current results and literature. 

## Tech Stack

### Frontend

- React + Next.js (App Router) for SPA-like UX and real-time dashboards. 
- TypeScript for end-to-end type safety. 
- Tailwind CSS for responsive UI. 
- Socket.io-client for real-time collaboration and presence. 
- D3.js + Dagre for flowchart-style knowledge graph visualization. 
- Monaco Editor for inline code viewing/editing in experiment pages. 
- Zustand for global state management (auth, teams, experiments, papers, presence). 

### Backend

- Node.js + Express for a lightweight REST API. 
- Prisma ORM (v6) with PostgreSQL for relational data (users, teams, experiments, papers, comments). 
- Socket.io server for real-time updates (experiment editing, comments, presence). 
- Yjs CRDT for conflict-free collaborative document editing. 
- Redis for WebSocket presence and debounced persistence of real-time edits. 
- Bull Queue (planned) for background jobs like PDF processing and AI analysis. 

### Databases & Storage

- PostgreSQL: main relational datastore for users, teams, experiments, papers, and tags. 
- Redis: real-time session storage and collaboration metadata. 
- S3/Minio/Cloudinary: storage for PDFs, datasets, and code archives. 
- Optional Neo4j or graph queries on Postgres for advanced knowledge graph features. 

### AI & NLP

- Groq API or Google Gemini for fast LLM calls (summarization and insights). 
- Embeddings (OpenAI/Groq) for semantic search across papers and experiments. 
- LangChain-style orchestration for multi-step LLM pipelines (summaries + insights). 

### Reproducibility

- Docker containers to reproduce experiment environments end-to-end. 
- Git for code versioning and linking commits to experiments. 
- DVC or similar for dataset versioning separate from Git. 
- environment.yml / requirements.txt for dependency management. 

### Deployment

- Frontend on Vercel for quick deployments and previews. 
- Backend on Railway/Render for managed Node.js hosting. 
- PostgreSQL via Supabase or Railway. 
- S3-compatible storage via Cloudinary/Minio. 

## Project Structure

High-level structure (monorepo style):

- `backend/` – Express API, Prisma, Socket.io, AI services.  
- `frontend/` – Next.js app with dashboards, notebooks, and graphs.  
- `prisma/` – Schema, migrations, and seed script. 
- `docs/` (optional) – Architecture notes, pitch deck, and demo script. 

## Getting Started

### Prerequisites

- Node.js ≥ 18  
- PostgreSQL database instance  
- Redis instance  
- (Optional) Groq or Google Gemini API key for AI features 

### 1. Backend Setup

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run seed   # optional: load mock lab data
npm run dev
```

Environment variables (`backend/.env`):

```env
DATABASE_URL=postgresql://user:password@localhost:5432/researchweb
JWT_SECRET=your-jwt-secret
REDIS_URL=redis://localhost:6379

GROQ_API_KEY=your-groq-key        # or
GOOGLE_GEMINI_API_KEY=your-gemini-key
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Environment variables (`frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Then open `http://localhost:3000` and log in with seeded users (e.g., `alice@research.edu / password123`).  

## Key User Flows

### Student Journey

- Join a lab team and see previous experiments as a “Research Setup Kit”. 
- Follow documented equipment setup and protocols instead of reinventing them. 
- Read AI-summarized key papers and link them directly into experiments. 
- Log experiments daily with linked code, datasets, and results. 
- Use the knowledge graph to discover similar past experiments and avoid repeated failures. 
- Generate AI suggestions for next experiments and potential paper directions. 

### Faculty Journey

- Open a dashboard showing all students and current experiment statuses (In Progress / Blocked / Complete). 
- Drill down into any student’s experiments and code/results in one place. 
- Use lab insights to see which methods are strong/weak, and where the lab should focus. 
- End-of-year: export experiments, papers, and AI insights into a concise research report. 

## Live Demo Script (2–3 Minutes)

- Show the “fragmented research” problem with chat/email/code screenshots. 
- Navigate to an existing experiment showing hypothesis, method, code, dataset, and results. 
- Demonstrate real-time editing between two browser windows with comments and status updates. 
- Open the knowledge graph flowchart and click through the connections between experiments and papers. 
- Press “Reproduce” on a prior experiment and show the environment spin up. 
- Open “Lab Insights” to highlight AI-generated recommendations and potential paper groupings. 

## Why This Project Stands Out

- Tackles a **real, painful research problem** that judges and academics personally recognize. 
- Demonstrates **deep engineering**: CRDTs, real-time systems, Docker reproducibility, graph modeling, and LLM integration. 
- Visually impressive demo: live collaboration, AI insights, and a rich knowledge graph/flowchart. 
- Immediately deployable in real universities with clear paths for extension (equipment booking, publication pipeline, etc.). 
