# 🧠 QuizMind AI

> An intelligent study companion that transforms your documents into interactive quizzes using a **custom-built RAG pipeline from scratch**.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-brightgreen?style=for-the-badge)](https://quizmind-ai.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)

---

## ✨ What Is QuizMind AI?

QuizMind AI lets you upload any study document (PDF, TXT, Markdown, HTML) and instantly generates smart multiple-choice quizzes powered by AI. No manual question writing — just upload, generate, and learn!

---

## 🚀 Live Demo

🔗 **[https://quizmind-ai.vercel.app](https://quizmind-ai.vercel.app)**

---

## 🔁 RAG Pipeline — Built From Scratch

The core of this project is a **Retrieval-Augmented Generation (RAG) pipeline** built entirely from scratch without using LangChain or any RAG framework.

```
📄 Document Upload
       │
       ▼
┌─────────────────┐
│  Text Extraction │  ← PDF / TXT / MD / HTML
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Text Chunking   │  ← Split into overlapping chunks (lib/chunker.ts)
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│  Vector Embeddings    │  ← HuggingFace all-MiniLM-L6-v2 (lib/embedder.ts)
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  Turso Vector Store   │  ← Store chunks + embeddings (lib/db.ts)
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  Similarity Search    │  ← Cosine similarity retrieval
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  Groq LLM (LLaMA 3)  │  ← Generate quiz questions from context
└────────┬─────────────┘
         │
         ▼
🎯 Interactive Quiz + Results
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4 |
| **Backend** | Next.js API Routes (Serverless) |
| **LLM** | Groq API (LLaMA 3) |
| **Embeddings** | HuggingFace Inference API (all-MiniLM-L6-v2) |
| **Vector Database** | Turso (libSQL) |
| **PDF Parsing** | unpdf |
| **HTML Parsing** | Cheerio |
| **Language** | TypeScript |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
quizmind-ai/
├── app/
│   ├── api/
│   │   ├── ingest/     → Upload & process documents
│   │   ├── generate/   → Generate quiz questions
│   │   └── grade/      → Grade quiz answers
│   ├── upload/         → Upload page
│   ├── generate/       → Quiz generation page
│   ├── quiz/           → Take quiz page
│   └── results/        → Results page
├── lib/
│   ├── chunker.ts      → Text chunking logic
│   ├── embedder.ts     → Vector embedding via HuggingFace
│   ├── db.ts           → Turso database operations
│   └── retriever.ts    → Similarity search
├── components/         → Reusable UI components
└── types/              → TypeScript type definitions
```

---

## ⚙️ How To Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/aqsaafzal702/quizmind-ai.git
cd quizmind-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file:
```env
GROQ_API_KEY=your_groq_api_key
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token
HF_TOKEN=your_huggingface_token
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

| Variable | Description | Get It From |
|----------|-------------|-------------|
| `GROQ_API_KEY` | LLM API key | [console.groq.com](https://console.groq.com) |
| `TURSO_DATABASE_URL` | Vector database URL | [turso.tech](https://turso.tech) |
| `TURSO_AUTH_TOKEN` | Database auth token | [turso.tech](https://turso.tech) |
| `HF_TOKEN` | Embeddings API token | [huggingface.co](https://huggingface.co) |

---

## 📖 Getting Started (Next.js)

This is a Next.js project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Groq API Docs](https://console.groq.com/docs)
- [Turso Documentation](https://docs.turso.tech)
- [HuggingFace Inference API](https://huggingface.co/docs/api-inference)

---

## 🚀 Deploy on Vercel

The easiest way to deploy is using [Vercel](https://vercel.com). Add your environment variables in the Vercel dashboard and connect your GitHub repository.

---

⭐ **If you found this useful, please give it a star!**
