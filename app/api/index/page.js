// app/index/page.js
"use client";

import { useState } from "react";

export default function IndexPage() {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [fileResp, setFileResp] = useState("");
  const [resp, setResp] = useState("");

  async function ingestText(e) {
    e.preventDefault();
    setResp("…indexing text");
    const r = await fetch("/api/index", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceType: "text", text, sourceName: "pasted-text" }),
    });
    setResp(await r.text());
  }

  async function ingestUrl(e) {
    e.preventDefault();
    setResp("…indexing url");
    const r = await fetch("/api/index", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceType: "url", url }),
    });
    setResp(await r.text());
  }

  async function ingestFile(e) {
    e.preventDefault();
    setFileResp("…indexing file");
    const fd = new FormData();
    const file = e.target.file.files[0];
    fd.append("sourceType", "file");
    fd.append("file", file);
    const r = await fetch("/api/index", { method: "POST", body: fd });
    setFileResp(await r.text());
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Index</h1>

      <form onSubmit={ingestText} className="space-y-2">
        <textarea className="w-full border p-2 rounded" rows={6} value={text} onChange={e => setText(e.target.value)} placeholder="Paste text…"/>
        <button className="px-4 py-2 bg-black text-white rounded">Index Text</button>
      </form>

      <form onSubmit={ingestUrl} className="space-y-2">
        <input className="w-full border p-2 rounded" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/article"/>
        <button className="px-4 py-2 bg-black text-white rounded">Index URL</button>
      </form>

      <form onSubmit={ingestFile} className="space-y-2">
        <input name="file" type="file" className="w-full border p-2 rounded" />
        <button className="px-4 py-2 bg-black text-white rounded">Index File (.txt/.csv)</button>
      </form>

      <pre className="bg-gray-50 p-3 rounded">{resp}</pre>
      <pre className="bg-gray-50 p-3 rounded">{fileResp}</pre>
    </div>
  );
}