// app/api/index/route.js
import "dotenv/config";
import { NextResponse } from "next/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { RecursiveUrlLoader } from "@langchain/community/document_loaders/web/recursive_url";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";

/* ---------------- Config ---------------- */
const CONFIG = {
  QDRANT_URL: process.env.QDRANT_URL,
  QDRANT_API_KEY: process.env.QDRANT_API_KEY,
  EMBEDDING_MODEL: process.env.EMBEDDING_MODEL || "text-embedding-3-small",
  CHUNK_SIZE: 1000,
  CHUNK_OVERLAP: 200,
};

/* ---------------- Utils ---------------- */
function slugSafe(s = "") {
  return String(s).trim().slice(0, 120);
}
function nameFromUrl(u) {
  try {
    const url = new URL(String(u));
    return url.hostname || String(u);
  } catch {
    return String(u);
  }
}

/* ---------------- Helpers ---------------- */
function cleanDocuments(docs, fallbackSource = "") {
  return docs.map((d) => {
    const meta = d.metadata || {};
    const outMeta = {};
    if (meta.source) outMeta.source = meta.source;
    if (meta.url) outMeta.url = meta.url;
    if (meta.title) outMeta.title = meta.title;
    if (!outMeta.source && fallbackSource) outMeta.source = fallbackSource;

    return new Document({
      pageContent: d.pageContent ?? "",
      metadata: outMeta,
    });
  });
}

async function splitDocuments(rawDocs) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CONFIG.CHUNK_SIZE,
    chunkOverlap: CONFIG.CHUNK_OVERLAP,
  });
  return splitter.splitDocuments(rawDocs);
}

/* ---------------- Loaders ---------------- */
async function loadText(text, sourceName = "pasted-text") {
  return [
    new Document({
      pageContent: String(text),
      metadata: { source: sourceName },
    }),
  ];
}

async function loadPDF(file, sourceName) {
  console.log(`📄 Loading PDF: ${file.name}`);
  const loader = new PDFLoader(file);
  const rawDocs = await loader.load();
  const split = await splitDocuments(rawDocs);
  // prefer explicit sourceName, fallback to file.name
  return cleanDocuments(split, sourceName || file.name);
}

async function loadCSV(file, sourceName) {
  console.log(`📄 Loading CSV: ${file.name}`);
  const loader = new CSVLoader(file);
  const rawDocs = await loader.load();
  const split = await splitDocuments(rawDocs);
  return cleanDocuments(split, sourceName || file.name);
}

async function loadTXT(file, sourceName) {
  console.log(`📝 Loading TXT: ${file.name}`);
  const text = await file.text();
  // create a single Document carrying the chosen source, then split (metadata propagates)
  const docs = await loadText(text, sourceName || file.name);
  return splitDocuments(docs);
}

async function loadWebsite(url, sourceName) {
  console.log(`🌐 Crawling website: ${url}`);
  const loader = new RecursiveUrlLoader(String(url), {
    maxDepth: 2,
    excludeDirs: ["#"],
  });
  const rawDocs = await loader.load();
  const split = await splitDocuments(rawDocs);
  // prefer explicit sourceName, else hostname or full URL
  return cleanDocuments(split, sourceName || nameFromUrl(url));
}

// batch upserts (keeps memory/timeouts sane)
async function insertInBatches(docs, embeddings, collectionName, batchSize = 100) {
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize);

    await QdrantVectorStore.fromDocuments(batch, embeddings, {
      url: CONFIG.QDRANT_URL,
      apiKey: CONFIG.QDRANT_API_KEY,
      collectionName,
      // Auto-create collection if missing
      collectionConfig: { vectors: { size: 1536, distance: "Cosine" } },
    });

    console.log(`✅ Inserted batch ${i / batchSize + 1} into "${collectionName}"`);
  }
}

/* ---------------- API Handler ---------------- */
export async function POST(req) {
  try {
    const formData = await req.formData();
    const sourceType = formData.get("sourceType")?.toLowerCase();
    const collectionName = formData.get("collectionName");
    const sourceNameRaw = formData.get("sourceName") || "";
    const sourceNameOverride = String(sourceNameRaw).trim();


    if (!sourceType) {
      return NextResponse.json({ error: "sourceType is required" }, { status: 400 });
    }
    if (!collectionName) {
      return NextResponse.json({ error: "collectionName is required" }, { status: 400 });
    }

    let docs = [];
    let identity = "unknown";

    switch (sourceType) {
      case "text": {
        const text = formData.get("text");
        if (!text) {
          return NextResponse.json(
            { error: 'Text content is required for sourceType "text"' },
            { status: 400 }
          );
        }
        const display = sourceNameOverride || "pasted-text";
        docs = await loadText(text, display);
        identity = display;
        break;
      }

      case "file": {
        const file = formData.get("file");
        if (!file) {
          return NextResponse.json(
            { error: 'A file is required for sourceType "file"' },
            { status: 400 }
          );
        }
        identity = sourceNameOverride || file.name;
        if (file.type === "application/pdf") {
          docs = await loadPDF(file, identity);
        } else if (file.type === "text/csv") {
          docs = await loadCSV(file, identity);
        } else if (file.type === "text/plain") {
          docs = await loadTXT(file, identity);
        } else {
          return NextResponse.json(
            { error: "Unsupported file type. Please use PDF, CSV, or TXT." },
            { status: 400 }
          );
        }
        break;
      }

      case "url": {
        const url = formData.get("url");
        if (!url) {
          return NextResponse.json(
            { error: 'A URL is required for sourceType "url"' },
            { status: 400 }
          );
        }
        identity = sourceNameOverride || nameFromUrl(url) || String(url);
        docs = await loadWebsite(url, identity);
        break;
      }

      default:
        return NextResponse.json(
          { error: "Invalid sourceType. Use 'text', 'file', or 'url'." },
          { status: 400 }
        );
    }

    if (!docs.length) {
      return NextResponse.json({ error: "No documents to insert" }, { status: 400 });
    }

    const embeddings = new OpenAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY,
      model: CONFIG.EMBEDDING_MODEL, // 1536 dims
    });

    await insertInBatches(docs, embeddings, collectionName, 100);

    return NextResponse.json({
      success: true,
      message: `Indexing of ${identity} done.`,
      inserted: docs.length,
      collectionName,
      identity,
    });
  } catch (error) {
    console.error("🔥 Error during indexing:", error);
    return NextResponse.json(
      { error: "Failed to index documents.", details: error.message },
      { status: 500 }
    );
  }
}