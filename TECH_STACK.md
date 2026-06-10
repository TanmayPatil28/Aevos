# GradeFlow Technology Stack

This document outlines the finalized stack for GradeFlow, representing the optimal intersection of bleeding-edge AI capability, maximum developer velocity, and absolute minimum operating cost.

| Capability | Recommended Technology | Primary Architectural Justification |
| :--- | :--- | :--- |
| **LLM Core Engine** | Gemini 3.1 Flash-Lite | Unbeatable cost-to-performance ratio ($0.10/M tokens) with multi-modal capabilities. |
| **Advanced Logic / Planning** | DeepSeek R1 (Fireworks) | Enterprise-grade reasoning at open-source pricing with zero data retention. |
| **Agent Framework** | Mastra | TypeScript native, fits smoothly into Next.js without a "two-language" problem. |
| **OCR / Parsing** | Mistral OCR 3 | Extracts structured JSON tables at 98% less cost than AWS Textract. |
| **Voice Synthesis (TTS)** | Cartesia Sonic-3 | 40ms latency via State Space Models ensures real-time "Jarvis" conversational flow. |
| **Voice Recognition (STT)** | Deepgram Nova-2 | Rapid WebSocket streaming capabilities enable token-by-token intent detection. |
| **Memory / Graph** | Zep | Temporal knowledge graph at $25/mo prevents LLM chronological amnesia. |
| **Database & Identity** | Supabase Postgres/Auth | Eliminates the need for separate Database, Authentication, and Realtime providers. |
| **Vector Database** | pgvector $\rightarrow$ Qdrant | Starts free inside the DB, scales infinitely on a cheap VPS when RAM limits are hit. |
| **Web Search / RAG Context** | Tavily | Purpose-built JSON web search for AI agents with a generous free tier. |
| **File Storage** | Cloudflare R2 | Zero egress fees prevent unexpected bandwidth bankruptcy when serving heavy PDFs. |
| **Automation** | Self-hosted n8n | Infinite workflow executions for a flat $10/mo server cost, highly visual API mapping. |
| **Analytics** | PostHog | Native session replays and 1 million free events per month for deep UX tracking. |
