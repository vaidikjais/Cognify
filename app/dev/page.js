// app/dev/page.js
"use client";

import { useState } from "react";

export default function DevPanel() {
  // shared state
  const [collectionName, setCollectionName] = useState("vaidik-collection");

  // create collection
  const [createOut, setCreateOut] = useState("");

  // index
  const [sourceType, setSourceType] = useState("text");
  const [text, setText] = useState("This is a tiny test about mangoes and summer fruits.");
  const [url, setUrl] = useState("https://example.com");
  const [fileResp, setFileResp] = useState("");
  const [indexOut, setIndexOut] = useState("");

  // chat
  const [userQuery, setUserQuery] = useState("What did I index about mangoes?");
  const [chatOut, setChatOut] = useState("");

  // sources
  const [sourcesOut, setSourcesOut] = useState("");

  // clear / drop
  const [clearOut, setClearOut] = useState("");
  const [dropOut, setDropOut] = useState("");

  async function callJson(url, body, setOut) {
    setOut("…requesting");
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      let data;
      try {
        data = await res.json();
      } catch {
        data = { raw: await res.text() };
      }
      setOut(JSON.stringify(data, null, 2));
    } catch (e) {
      setOut(`⚠️ ${e.message}`);
    }
  }

  async function createCollection(e) {
    e.preventDefault();
    await callJson("/api/createCollection", { collectionName }, setCreateOut);
  }

  async function indexSubmit(e) {
    e.preventDefault();
    setIndexOut("…indexing");
    setFileResp("");
    try {
      const fd = new FormData();
      fd.append("collectionName", collectionName);
      fd.append("sourceType", sourceType);

      if (sourceType === "text") {
        fd.append("text", text);
      } else if (sourceType === "url") {
        fd.append("url", url);
      } else if (sourceType === "file") {
        const file = e.currentTarget.file.files[0];
        if (!file) {
          setIndexOut("⚠️ choose a file");
          return;
        }
        fd.append("file", file);
      }

      const res = await fetch("/api/index", { method: "POST", body: fd });
      let data;
      try {
        data = await res.json();
      } catch {
        data = { raw: await res.text() };
      }
      setIndexOut(JSON.stringify(data, null, 2));
    } catch (e) {
      setIndexOut(`⚠️ ${e.message}`);
    }
  }

  async function chatSubmit(e) {
    e.preventDefault();
    await callJson("/api/chat", { userQuery, collectionName }, setChatOut);
  }

  async function fetchSources() {
    try {
      const res = await fetch(`/api/sources?collectionName=${encodeURIComponent(collectionName)}`);
      let data;
      try {
        data = await res.json();
      } catch {
        data = { raw: await res.text() };
      }
      setSourcesOut(JSON.stringify(data, null, 2));
    } catch (e) {
      setSourcesOut(`⚠️ ${e.message}`);
    }
  }

  async function clearIndex(e) {
    e.preventDefault();
    await callJson("/api/clearIndex", { collectionName }, setClearOut);
  }

  async function dropCollection(e) {
    e.preventDefault();
    await callJson("/api/dropCollection", { collectionName, confirm: "DROP" }, setDropOut);
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      <h1 className="text-2xl font-bold">RAG Dev Panel</h1>

      {/* shared collection input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Collection Name</label>
        <input
          className="w-full border rounded p-2"
          value={collectionName}
          onChange={(e) => setCollectionName(e.target.value)}
          placeholder="vaidik-collection"
        />
      </div>

      {/* create collection */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Create Collection (1536, Cosine)</h2>
        <form onSubmit={createCollection} className="flex gap-2">
          <button className="px-4 py-2 rounded bg-black text-white">Create</button>
        </form>
        <pre className="bg-gray-50 p-3 rounded whitespace-pre-wrap text-sm">{createOut}</pre>
      </section>

      {/* index */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Index</h2>
        <form onSubmit={indexSubmit} className="space-y-3" encType="multipart/form-data">
          <div className="flex items-center gap-3">
            <label className="text-sm">sourceType:</label>
            <select
              className="border rounded p-2"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
            >
              <option value="text">text</option>
              <option value="url">url</option>
              <option value="file">file</option>
            </select>
          </div>

          {sourceType === "text" && (
            <textarea
              className="w-full border rounded p-2"
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          )}

          {sourceType === "url" && (
            <input
              className="w-full border rounded p-2"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          )}

          {sourceType === "file" && (
            <input name="file" type="file" className="w-full border rounded p-2" />
          )}

          <button className="px-4 py-2 rounded bg-black text-white">Index</button>
        </form>
        <pre className="bg-gray-50 p-3 rounded whitespace-pre-wrap text-sm">{indexOut}</pre>
        {fileResp && <pre className="bg-gray-50 p-3 rounded whitespace-pre-wrap text-sm">{fileResp}</pre>}
      </section>

      {/* chat */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Chat</h2>
        <form onSubmit={chatSubmit} className="space-y-2">
          <textarea
            className="w-full border rounded p-2"
            rows={3}
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
          />
          <button className="px-4 py-2 rounded bg-black text-white">Ask</button>
        </form>
        <pre className="bg-gray-50 p-3 rounded whitespace-pre-wrap text-sm">{chatOut}</pre>
      </section>

      {/* sources */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Sources</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded bg-black text-white" onClick={fetchSources}>
            Refresh
          </button>
          <a
            className="px-4 py-2 rounded border inline-block"
            href={`/api/sources?collectionName=${encodeURIComponent(collectionName)}`}
            target="_blank"
            rel="noreferrer"
          >
            Open raw JSON
          </a>
        </div>
        <pre className="bg-gray-50 p-3 rounded whitespace-pre-wrap text-sm">{sourcesOut}</pre>
      </section>

      {/* clear index */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Clear Index (delete all points)</h2>
        <form onSubmit={clearIndex} className="flex gap-2">
          <button className="px-4 py-2 rounded bg-red-600 text-white">Clear</button>
        </form>
        <pre className="bg-gray-50 p-3 rounded whitespace-pre-wrap text-sm">{clearOut}</pre>
      </section>

      {/* drop collection */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Drop Collection (danger!)</h2>
        <form onSubmit={dropCollection} className="flex gap-2">
          <button className="px-4 py-2 rounded bg-red-700 text-white">DROP</button>
        </form>
        <pre className="bg-gray-50 p-3 rounded whitespace-pre-wrap text-sm">{dropOut}</pre>
      </section>
    </div>
  );
}