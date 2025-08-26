

Cognify

Summarize & Chat with Your Files and the Web

Cognify is a Retrieval-Augmented Generation (RAG) application that lets you create collections of documents or websites, generate AI-powered summaries, and chat with your sources — all while keeping answers grounded in your own data.

🎥 Watch the demo on YouTube

⸻

✨ Features
	•	📂 Collections – Organize your knowledge by project or topic.
	•	📑 Multiple Source Types – Add PDFs, CSVs, TXT files, or URLs into a single knowledge base.
	•	📝 AI Summaries – Generate clear, concise summaries of your sources.
	•	💬 Chat with Sources – Ask questions and get grounded answers with citations.
	•	⚡ Fast & Clean UI – Built with Next.js, Tailwind CSS, and shadcn/ui for a modern experience.
	•	🧠 OpenAI Embeddings – Uses text-embedding-3-small (1536 dimensions) for accurate retrieval.
	•	📦 Vector Search – Powered by Qdrant, running locally in Docker.

⸻

🖼️ Screenshots

Collections Page	Studio – Sources	Studio – Summary + Chat
		

(replace placeholders with your actual screenshots if you want)

⸻

🛠️ Tech Stack
	•	Frontend: Next.js (App Router), React, Tailwind CSS v3, shadcn/ui
	•	Backend: Next.js API routes, Node.js
	•	AI/LLM: OpenAI API (chat + embeddings)
	•	Vector DB: Qdrant (local Docker)
	•	Other: pdf.js, Papaparse, Mammoth, RecursiveCharacterTextSplitter

⸻

⚙️ Getting Started

1. Clone the repository

git clone https://github.com/yourusername/cognify.git
cd cognify

2. Install dependencies

npm install

3. Start Qdrant via Docker

npm run qdrant:up

Qdrant will be available at http://localhost:6333.

4. Create .env.local

OPENAI_API_KEY=your_openai_api_key
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=   # leave blank for local
EMBEDDING_MODEL=text-embedding-3-small

5. Run the app

npm run dev

Open http://localhost:3000.

⸻

🚀 Usage Flow
	1.	Landing Page → Learn about Cognify and get started.
	2.	Collections Page → Create or select a collection.
	3.	Studio
	•	Add sources (Text, File, or URL).
	•	View & manage sources.
	•	Generate AI summaries.
	•	Chat with your knowledge base.

⸻

📹 Demo

▶️ Watch the full demo on YouTube

⸻

🎯 Why This Project?

I built Cognify to explore retrieval-augmented generation (RAG) and create a practical, personal knowledge tool.
This project demonstrates my ability to:
	•	Design full-stack applications (frontend + backend).
	•	Integrate LLMs with vector databases.
	•	Build clean, user-friendly interfaces with shadcn/ui.
	•	Deploy and work with containerized services like Qdrant.

⸻

📌 Roadmap / Future Work
	•	✅ File (PDF/CSV/TXT) and URL support
	•	✅ AI summaries and chat with sources
	•	⬜ Authentication for private collections
	•	⬜ Export chat and summaries
	•	⬜ Deployment (Vercel + managed Qdrant)

⸻

📄 License

MIT License 

