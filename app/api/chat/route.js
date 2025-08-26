// app/api/chat/route.js
import "dotenv/config";
import { NextResponse } from "next/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function uniqueSources(docs) {
  const set = new Set();
  const out = [];
  for (const d of docs) {
    const m = d.metadata || {};
    const src = m.source || m.url || m.title || "unknown";
    if (!set.has(src)) {
      set.add(src);
      out.push(src);
    }
  }
  return out;
}

function buildPrompt(userQuery, docs) {
  const ctx = docs
    .map((d, i) => `--- Snippet ${i + 1} ---\n${d.pageContent}`)
    .join("\n\n");

  return `
You are a retrieval-augmented assistant. Answer ONLY using the provided CONTEXT.
If the answer is not in the context, reply: "I do not have enough information to answer this question."

CONTEXT:
${ctx}

QUESTION: ${userQuery}
ANSWER:
`.trim();
}

export async function POST(req) {
  try {
    const { userQuery, collectionName } = await req.json();

    if (!userQuery) {
      return NextResponse.json({ error: "userQuery is required" }, { status: 400 });
    }
    if (!collectionName) {
      return NextResponse.json({ error: "collectionName is required" }, { status: 400 });
    }

    // 1) Use the same embedding family as indexing (text-embedding-3-small → 1536 dims)
    const embeddings = new OpenAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.EMBEDDING_MODEL || "text-embedding-3-small",
    });

    // 2) Connect to existing Qdrant collection
    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
      collectionName,
    });

    // 3) Retrieve top-k chunks
    const retriever = vectorStore.asRetriever({ k: 5 });
    const relevantChunks = await retriever.invoke(userQuery); // returns LangChain Documents

    // 4) Grounded prompt
    const prompt = buildPrompt(userQuery, relevantChunks);

    // 5) Single non-stream completion
    const chat = await openai.chat.completions.create({
      model: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const responseText = chat.choices?.[0]?.message?.content?.trim() || "";

    return NextResponse.json({
      response: responseText || "I do not have enough information to answer this question.",
      sources: uniqueSources(relevantChunks), // array of unique source identifiers
    });
  } catch (error) {
    console.error("🔥 Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process chat query.", details: error.message },
      { status: 500 }
    );
  }
}