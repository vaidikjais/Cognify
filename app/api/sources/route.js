// app/api/sources/route.js
import "dotenv/config";
import { NextResponse } from "next/server";
import { QdrantClient } from "@qdrant/js-client-rest";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const collectionName =
      url.searchParams.get("collectionName") || process.env.QDRANT_COLLECTION; // optional fallback

    if (!collectionName) {
      return NextResponse.json(
        { error: "collectionName is required" },
        { status: 400 }
      );
    }

    const client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY || undefined,
    });

    const counts = new Map();
    let totalPoints = 0;
    const BATCH = 1000;
    let offset = undefined;

    while (true) {
      const res = await client.scroll(collectionName, {
        limit: BATCH,
        with_payload: true,
        with_vectors: false,
        offset,
        // only fetch what we need to be fast
        payload_selector: { include: ["source"] },
      });

      const points = res.points || [];
      totalPoints += points.length;

      for (const p of points) {
        const meta = p.payload || {};
        const display = (
          meta.source ||
          meta.url ||
          meta.title ||
          "pasted-text"
        ).toString();
        counts.set(display, (counts.get(display) || 0) + 1);
      }

      if (!res.next_page_offset) break;
      offset = res.next_page_offset;
    }

    const items = Array.from(counts.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({ collectionName, totalPoints, items });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Failed to list sources." },
      { status: 500 }
    );
  }
}
