// app/api/createCollection/route.js
import "dotenv/config";
import { NextResponse } from "next/server";
import { QdrantClient } from "@qdrant/js-client-rest";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
} 

/**
 * POST /api/createCollection
 * Body: { collectionName?: string, size?: number, distance?: "Cosine" | "Euclid" | "Dot" }
 * Defaults for OpenAI text-embedding-3-small: size=1536, distance="Cosine"
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const rawName = body?.collectionName;
    const size = Number(body?.size ?? 1536);
    const distance = body?.distance || "Cosine";

    if (!rawName) {
      return NextResponse.json({ error: "collectionName is required" }, { status: 400 });
    }

    const collectionName = slugify(rawName);
    if (!collectionName) {
      return NextResponse.json({ error: "collectionName slug resolved to empty" }, { status: 400 });
    }

    const client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY || undefined,
    });

    // 1) Check if it already exists
    try {
      const existing = await client.getCollection(collectionName);
      const existingSize = existing?.config?.params?.vectors?.size;
      const existingDistance = existing?.config?.params?.vectors?.distance;

      const warn =
        existingSize && existingSize !== size
          ? `Warning: existing vector size is ${existingSize}, but you requested ${size}.`
          : undefined;

      return NextResponse.json({
        message: "Collection already exists.",
        collectionName,
        size: existingSize ?? size,
        distance: existingDistance ?? distance,
        warning: warn,
      });
    } catch {
      // not found → create it
    }

    // 2) Create a new collection
    await client.createCollection(collectionName, {
      vectors: { size, distance },
    });

    return NextResponse.json({
      message: "Collection created successfully.",
      collectionName,
      size,
      distance,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create collection.", details: err?.message },
      { status: 500 }
    );
  }
}