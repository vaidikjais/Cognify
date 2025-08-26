"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function slugify(s = "") {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .slice(0, 64);
}

export default function CollectionsPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // inline feedback

  async function createAndGo() {
    const raw = name.trim();
    if (!raw) return;

    const collectionName = slugify(raw);
    try {
      setLoading(true);
      setStatus(null);

      const res = await fetch("/api/createCollection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionName }),
      });

      const data = await res.json().catch(async () => ({ raw: await res.text() }));
      if (!res.ok) throw new Error(data?.error || "Failed to create collection");

      setStatus({ type: "success", message: data?.message || "Collection ready" });
      router.push(`/studio?c=${encodeURIComponent(collectionName)}`);
    } catch (e) {
      setStatus({ type: "error", message: e.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Create or use a collection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Collection name</Label>
            <Input
              id="name"
              placeholder="e.g., my-research-notes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading && name.trim()) {
                  createAndGo();
                }
              }}
            />
          </div>

          {status && (
            <p
              className={`text-sm ${
                status.type === "error" ? "text-red-500" : "text-green-500"
              }`}
            >
              {status.message}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="flex-1"
              disabled={!name.trim() || loading}
              onClick={createAndGo}
            >
              {loading ? "Creating…" : "Continue to Studio"}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/studio")}
            >
              Skip (use default)
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            We’ll create the collection if it doesn’t exist yet. You can change
            the active collection anytime from the Studio header.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}