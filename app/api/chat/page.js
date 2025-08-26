// app/chat/page.js
"use client";

import { useEffect, useRef, useState } from "react";

function SourceChips({ sources }) {
  if (!sources || sources.length === 0) return null;

  // Accept either ["src1","src2"] or array of Docs and map to strings
  const list = Array.isArray(sources)
    ? sources.map((s) => {
        if (typeof s === "string") return s;
        const m = s?.metadata || {};
        return m.source || m.url || m.title || "unknown";
      })
    : [];

  const unique = [...new Set(list)].filter(Boolean);

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {unique.map((src, i) => (
        <span
          key={i}
          className="px-2 py-1 text-xs rounded-full bg-gray-100 border border-gray-200"
          title={src}
        >
          {src}
        </span>
      ))}
    </div>
  );
}

export default function ChatPage() {
  const [collectionName, setCollectionName] = useState("vaidik-collection");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! Ask me about the docs you indexed." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastSources, setLastSources] = useState([]);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, lastSources]);

  async function send(e) {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;

    // push user message
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");

    // loading bubble
    setMessages((m) => [...m, { role: "assistant", content: "…thinking" }]);
    setLoading(true);
    setLastSources([]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userQuery: q, collectionName }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        // server returned HTML/text — show first lines
        const text = await res.text();
        data = { error: text.split("\n").slice(0, 10).join("\n") };
      }

      if (!res.ok) {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = {
            role: "assistant",
            content: `⚠️ ${data?.error || "Server error"}`,
          };
          return copy;
        });
        return;
      }

      const answer = data.response || data.text || "(no answer)";
      const sources = data.sources || [];
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: answer };
        return copy;
      });
      setLastSources(sources);
    } catch (err) {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: `⚠️ ${err.message}` };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full w-full max-w-3xl mx-auto p-6 flex flex-col gap-4">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Chat</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Collection:</label>
          <input
            className="border rounded px-2 py-1 text-sm"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            placeholder="vaidik-collection"
          />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : ""}>
            <div
              className={`inline-block rounded-2xl px-4 py-2 ${
                m.role === "user" ? "bg-blue-50" : "bg-gray-50"
              }`}
            >
              {m.content}
            </div>
            {i === messages.length - 1 && m.role === "assistant" && !loading && (
              <SourceChips sources={lastSources} />
            )}
          </div>
        ))}
        <div ref={endRef} />
      </main>

      <form onSubmit={send} className="flex gap-2 border-t pt-4">
        <textarea
          className="flex-1 border rounded p-3 h-28 resize-none"
          placeholder="Ask anything grounded in your collection…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(e);
            }
          }}
        />
        <button
          type="submit"
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-60 h-12 self-end"
          disabled={loading}
        >
          {loading ? "…" : "Send"}
        </button>
      </form>
    </div>
  );
}