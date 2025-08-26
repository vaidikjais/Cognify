// app/api/dropCollection/route.js
import "dotenv/config";
import { NextResponse } from "next/server";
import { QdrantClient } from "@qdrant/js-client-rest";

export async function POST(req) {
  try {
    const { collectionName, confirm } = await req.json();

    if (!collectionName) {
      return NextResponse.json({ error: "collectionName is required" }, { status: 400 });
    }
    if (confirm !== "DROP") {
      return NextResponse.json(
        { error: 'Set "confirm":"DROP" to delete the collection.' },
        { status: 400 }
      );
    }

    const client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY || undefined,
    });

    await client.deleteCollection(collectionName);

    return NextResponse.json({
      success: true,
      message: `Collection "${collectionName}" deleted.`,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Failed to drop collection." },
      { status: 500 }
    );
  }
}