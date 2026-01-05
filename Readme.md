
# 🧪 ProtoLab

### The Operating System for Modern Research

**Cross-Campus Collaborative Research & Knowledge Persistence Platform**

---

## 📑 Executive Summary

**ProtoLab** is a full-stack research engine designed to solve the "tribal knowledge" crisis in academia. It replaces scattered emails, local notebooks, and disconnected GitHub repositories with a single, **live operating system**.

By combining **Real-Time Collaboration (CRDTs)**, **Knowledge Graphs**, and **AI Agents**, ProtoLab ensures that when a student graduates, their knowledge doesn't leave with them. It transforms static experiment logs into a living, reproducible institutional memory.

---

## 🛑 The Problem: The "Bus Factor" in Academia

Research environments currently suffer from a critical fragmentation of knowledge:

| Pain Point | The Reality Today | The Cost |
| --- | --- | --- |
| **Knowledge Silos** | Senior students leave with logs/configs on local machines. | **3-6 months** lost per new student re-discovering failed approaches. |
| **Reproducibility Crisis** | "It works on my machine." Dependencies aren't documented. | **20+ experiments** repeated unnecessarily due to lack of environment context. |
| **Disconnected Data** | Code is on GitHub, data on Drive, notes in physical notebooks. | **Zero unified view** for Faculty supervisors managing 10+ students. |
| **Duplicate Effort** | 5 students in the same lab read the same 50 papers. | **Wasted cycles** on redundant literature reviews. |

---

## 💡 The Solution: ProtoLab

ProtoLab is not just a digital notebook; it is a **semantic web of research activity**.

1. **Unified Workspace:** Experiments, papers, code, and datasets live in one context.
2. **Institutional Memory:** A persistent Knowledge Graph linking *Method A*  *Experiment B*  *Result C*.
3. **One-Click Reproducibility:** Dockerized environments linked to specific Git commits and Data versions.
4. **AI Co-Pilot:** An LLM that understands the *entire* lab's history to suggest next steps.

---

## 🏗 System Architecture

ProtoLab utilizes a Monorepo structure designed for real-time performance and data integrity.

```mermaid
graph TD
    User[Researcher] --> Client[Next.js Frontend]
    Client -->|Real-time Edits (Yjs)| Socket[Socket.io Server]
    Client -->|REST API| API[Express Backend]
    
    subgraph Data Layer
        Socket --> Redis[Redis (Presence/State)]
        API --> DB[(PostgreSQL + Prisma)]
        API --> S3[Object Storage (Datasets/PDFs)]
    end
    
    subgraph Intelligence Layer
        API --> Queue[Bull Queue]
        Queue --> AI[Groq/Gemini LLM]
        Queue --> Vector[Vector DB (Embeddings)]
        Queue --> Graph[Knowledge Graph Builder]
    end
    
    subgraph Reproducibility
        API --> Docker[Docker Engine]
        Docker --> Container[Exp Environment]
    end

```

---

## 🚀 Key Features & Technical Implementation

### 1. Live Collaborative Notebook (CRDTs)

* **Feature:** Google Docs-style editing for experiment protocols.
* **Tech:** Uses **Yjs** (CRDT library) over **Socket.io**.
* **Why it matters:** Allows conflict-free editing even with high latency. Supports rich text, code blocks (Monaco), and inline images.

### 2. The Knowledge Graph

* **Feature:** An interactive visual map connecting *Papers*, *Experiments*, *Methods*, and *Authors*.
* **Tech:** **D3.js** for frontend visualization, relational queries (or Neo4j) on the backend.
* **Insight:** "Show me all failed experiments that used ResNet-50 in Q3."

### 3. AI-Powered Literature Matrix

* **Feature:** Upload a PDF (or arXiv link)  AI extracts Methodology, Findings, and Limitations.
* **Tech:** **LangChain** + **Groq** for high-speed inference.
* **Deep Link:** Papers are semantically linked to the specific experiments that implement their methods.

### 4. 30-Second Reproducibility

* **Feature:** The "Reproduce" button.
* **Tech:** Dynamically generates a `Dockerfile` based on the experiment's `requirements.txt` and checkouts the specific Git commit hash associated with the log.
* **Impact:** Solves the "it works on my machine" crisis instantly.

### 5. AI Research Analyst

* **Feature:** Lab-level insights and recommendations.
* **Tech:** RAG (Retrieval Augmented Generation) pipeline. The AI scans previous experiment results to suggest:
* *"Your accuracy has plateaued. Paper X suggests lowering the learning rate."*
* *"You are repeating an experiment done by Alice in 2023. See results here."*



---

## 🛠️ Tech Stack

### Frontend

* **Framework:** Next.js 14 (App Router)
* **Styling:** Tailwind CSS + Shadcn/UI + Framer Motion (Animations)
* **State:** Zustand (Global store)
* **Real-time:** Socket.io-client + Yjs
* **Viz:** D3.js (Graphs) + Recharts (Data analytics)

### Backend

* **Runtime:** Node.js + Express
* **Database:** PostgreSQL (via Prisma ORM)
* **Caching:** Redis (Collab sessions)
* **Queues:** BullMQ (Async jobs for PDF parsing/AI)

### AI & DevOps

* **LLM:** Groq API (Llama-3-70b) or Google Gemini Flash
* **Embeddings:** OpenAI text-embedding-3-small
* **Containerization:** Docker

---

## ⚡ Getting Started

### Prerequisites

* Node.js  18
* PostgreSQL & Redis (Local or Cloud)
* Git

### 1. Backend Setup

```bash
cd backend
npm install

# Setup Environment
cp .env.example .env
# Fill in DATABASE_URL, REDIS_URL, AI_KEYS

# Initialize DB
npx prisma migrate dev --name init
npm run seed  # 👈 Critical: Seeds the 'Alice Johnson' demo data

# Start Server
npm run dev

```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Setup Environment
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
echo "NEXT_PUBLIC_SOCKET_URL=http://localhost:5000" >> .env.local

# Start Client
npm run dev

```

Visit `http://localhost:3000`.

---



## ✨ Why This Wins

* **Engineering Depth:** It's not just a ChatGPT wrapper. It uses CRDTs for sync, Graph theory for data relationships, and Docker for infra.
* **Real Problem:** It solves a specific, painful problem in a massive market ($Trillions in R&D spending).
* **Polished UI:** The "Void" aesthetic looks professional and futuristic, differentiating it from standard student projects.
