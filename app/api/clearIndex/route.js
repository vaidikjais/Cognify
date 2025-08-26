// app/api/clearIndex/route.js
import "dotenv/config";
import { NextResponse } from "next/server";
import { QdrantClient } from "@qdrant/js-client-rest";

export async function POST(req) {
  try {
    const { collectionName } = await req.json();
    if (!collectionName) {
      return NextResponse.json({ error: "collectionName is required" }, { status: 400 });
    }

    const client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY || undefined,
    });

    // Delete ALL points in the collection (empty filter), wait until done
    await client.delete(collectionName, { filter: { must: [] }, wait: true });

    return NextResponse.json({
      success: true,
      message: `All points deleted from "${collectionName}".`,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Failed to clear index." },
      { status: 500 }
    );
  }
}