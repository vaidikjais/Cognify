// app/studio/page.js
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

export default function StudioPage() {
  const { toast } = useToast();
  // shared
  const search = useSearchParams();
  const initial = search?.get("c") || "vaidik-collection";
  const [collectionName, setCollectionName] = useState(initial);

  // sources
  const [open, setOpen] = useState(false);
  const [textSource, setTextSource] = useState("");
  const [textName, setTextName] = useState("");
  const [urlSource, setUrlSource] = useState("");
  const [urlName, setUrlName] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [indexing, setIndexing] = useState(false);
  const [sources, setSources] = useState([]);
  const [sourcesLoading, setSourcesLoading] = useState(false);

  // chat
  const [question, setQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState([]); // {role: "user"|"assistant", content, sources?}

  // summary
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  async function fetchSources() {
    try {
      setSourcesLoading(true);
      const res = await fetch(
        `/api/sources?collectionName=${encodeURIComponent(collectionName)}`
      );
      const data = await res
        .json()
        .catch(async () => ({ raw: await res.text() }));
      if (!res.ok) throw new Error(data?.error || "Failed to fetch sources");
      setSources(data?.items || []);
    } catch (e) {
      toast({
        title: "Sources error",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setSourcesLoading(false);
    }
  }

  useEffect(() => {
    fetchSources();
  }, [collectionName]);

  async function askLLM(q) {
    const body = { userQuery: q, collectionName };
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res
      .json()
      .catch(async () => ({ raw: await res.text() }));
    if (!res.ok) throw new Error(data?.error || "Chat failed");
    return data;
  }

  async function indexText() {
    if (!textSource.trim()) {
      toast({
        title: "Missing text",
        description: "Paste some content.",
        variant: "destructive",
      });
      return;
    }
    const fd = new FormData();
    fd.append("collectionName", collectionName);
    fd.append("sourceType", "text");
    fd.append("text", textSource);
    fd.append("sourceName", textName || "pasted-text");
    await doIndex(fd, "Text indexed");
  }

  async function indexUrl() {
    if (!urlSource.trim()) {
      toast({
        title: "Missing URL",
        description: "Enter a website URL.",
        variant: "destructive",
      });
      return;
    }
    const fd = new FormData();
    fd.append("collectionName", collectionName);
    fd.append("sourceType", "url");
    fd.append("url", urlSource);
    fd.append("sourceName", urlName || "");
    await doIndex(fd, "URL fetched & indexed");
  }

  async function indexFile() {
    if (!file) {
      toast({
        title: "Missing file",
        description: "Choose a PDF/CSV/TXT.",
        variant: "destructive",
      });
      return;
    }
    const fd = new FormData();
    fd.append("collectionName", collectionName);
    fd.append("sourceType", "file");
    fd.append("file", file);
    fd.append("sourceName", fileName || "");
    await doIndex(fd, `Uploaded ${file.name}`);
  }

  async function doIndex(formData, successMsg) {
    try {
      setIndexing(true);
      const res = await fetch("/api/index", { method: "POST", body: formData });
      const data = await res
        .json()
        .catch(async () => ({ raw: await res.text() }));
      if (!res.ok) throw new Error(data?.error || "Failed to index");
      toast({ title: "Success", description: successMsg });
      setOpen(false);
      setTextSource("");
      setUrlSource("");
      setFile(null);
      await fetchSources();
    } catch (e) {
      toast({
        title: "Index error",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setIndexing(false);
    }
  }

  async function sendMessage() {
    const q = question.trim();
    if (!q) return;
    try {
      setChatLoading(true);
      setMessages((m) => [...m, { role: "user", content: q }]);
      setQuestion("");
      const data = await askLLM(q);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.response || "",
          sources: data.sources || [],
        },
      ]);
    } catch (e) {
      toast({
        title: "Chat error",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setChatLoading(false);
    }
  }

  async function generateSummary() {
    try {
      setSummaryLoading(true);
      const data = await askLLM(
        "Provide a concise, neutral summary of the key information in the context."
      );
      setSummary(data.response || "No summary generated.");
    } catch (e) {
      toast({
        title: "Summary error",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setSummaryLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        {/* top bar: collection already created in previous step */}
        <Card>
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <CardTitle>Active Collection</CardTitle>
              <p className="text-sm text-gray-500">
                Use the same name you created earlier. All sources will be
                indexed into this collection.
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., vaidik-collection"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                className="w-64"
              />
              <Button onClick={fetchSources} variant="outline">
                Refresh Sources
              </Button>
              <a
                href="/collections"
                className="inline-flex items-center justify-center rounded-md border border-border px-3 text-sm hover:bg-accent"
              >
                Change
              </a>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          {/* LEFT: Sources */}
          <Card className="md:col-span-3 h-[70vh] flex flex-col">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Sources</CardTitle>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild onClick={() => setOpen(true)}>
                  <Button size="sm">+ Add New Source</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add a new source</DialogTitle>
                  </DialogHeader>

                  <Tabs defaultValue="text" className="w-full">
                    <TabsList className="mb-3">
                      <TabsTrigger value="text">Text</TabsTrigger>
                      <TabsTrigger value="url">URL</TabsTrigger>
                      <TabsTrigger value="file">File</TabsTrigger>
                    </TabsList>

                    <TabsContent value="text" className="space-y-3">
                      <Label htmlFor="txt">Content</Label>
                      <Textarea
                        id="txt"
                        rows={8}
                        placeholder="Paste content here…"
                        value={textSource}
                        onChange={(e) => setTextSource(e.target.value)}
                      />
                      <div className="grid gap-2">
  <Label htmlFor="txt-name">Source name (optional)</Label>
   <Input
     id="txt-name"
     placeholder="e.g., MCA 140 colleges (notes)"
     value={textName}
     onChange={(e) => setTextName(e.target.value)}
   />
 </div>
                      <Button onClick={indexText} disabled={indexing}>
                        {indexing ? "Indexing…" : "Add Text Source"}
                      </Button>
                    </TabsContent>

                    <TabsContent value="url" className="space-y-3">
                      <Label htmlFor="url">Website URL</Label>
                      <Input
                        id="url"
                        placeholder="https://example.com"
                        value={urlSource}
                        onChange={(e) => setUrlSource(e.target.value)}
                      />
                      <div className="grid gap-2">
   <Label htmlFor="url-name">Source name (optional)</Label>
   <Input
     id="url-name"
     placeholder="e.g., example.com article"
     value={urlName}
     onChange={(e) => setUrlName(e.target.value)}
   />
 </div>
                      <Button onClick={indexUrl} disabled={indexing}>
                        {indexing ? "Fetching…" : "Fetch & Index"}
                      </Button>
                    </TabsContent>

                    <TabsContent value="file" className="space-y-3">
                      <Label htmlFor="file">Document (PDF/CSV/TXT)</Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".pdf,.csv,.txt"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                      <div className="grid gap-2">
   <Label htmlFor="file-name">Source name (optional)</Label>
   <Input
     id="file-name"
     placeholder="defaults to the file name"
     value={fileName}
     onChange={(e) => setFileName(e.target.value)}
   />
 </div>
                      <Button onClick={indexFile} disabled={indexing}>
                        {indexing ? "Uploading…" : "Upload & Index"}
                      </Button>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <Separator />
            <CardContent className="flex-1 overflow-auto text-sm themed-scroll">
              {sourcesLoading ? (
                <div className="text-gray-500">Loading sources…</div>
              ) : sources.length === 0 ? (
                <div className="text-gray-500">No sources yet.</div>
              ) : (
                <ul className="space-y-2">
                  {sources.map((s) => (
                    <li
                      key={s.source}
                      className="flex items-center justify-between"
                    >
                      <span className="truncate">{s.source}</span>
                      <span className="text-xs text-gray-500">×{s.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* MIDDLE: Summary placeholder (next step) */}
          <Card className="md:col-span-5 h-[70vh] flex flex-col">
            <CardHeader>
              <CardTitle>AI Summary</CardTitle>
              <p className="text-sm text-gray-500">
                Generate a quick overview of your collection.
              </p>
            </CardHeader>
            <Separator />
            <CardContent className="flex-1 overflow-auto">
              {summary ? (
                <div className="prose prose-sm max-w-none text-sm whitespace-pre-wrap">
                  {summary}
                </div>
              ) : (
                <div className="text-sm text-gray-600">No summary yet.</div>
              )}
            </CardContent>
            <div className="border-t p-3 flex justify-end">
              <Button
                onClick={generateSummary}
                disabled={summaryLoading}
                variant="secondary"
              >
                {summaryLoading ? "Generating…" : "Generate Summary"}
              </Button>
            </div>
          </Card>

          {/* RIGHT: Chat placeholder (wired in later step) */}
          <Card className="md:col-span-4 h-[70vh] flex flex-col">
            <CardHeader>
              <CardTitle>Chat with AI</CardTitle>
              <p className="text-sm text-gray-500">
                Ask about your sources (non-streaming; uses loader).
              </p>
            </CardHeader>
            <Separator />
            <CardContent className="flex-1 overflow-auto space-y-3">
              {messages.length === 0 ? (
                <div className="text-sm text-gray-500">No messages yet.</div>
              ) : (
                <ul className="space-y-3 text-sm">
                  {messages.map((m, idx) => (
                    <li
                      key={idx}
                      className={
                        "flex " +
                        (m.role === "user" ? "justify-end" : "justify-start")
                      }
                    >
                      <div
                        className={
                          (m.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground") +
                          " max-w-[80%] rounded-lg px-3 py-2 shadow"
                        }
                      >
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {m.content}
                        </div>
                        {m.sources && m.sources.length > 0 && (
                          <div className="mt-1 text-[11px] opacity-80">
                            Sources: {m.sources.join(", ")}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
            <div className="border-t p-3 flex gap-2">
              <Textarea
                className="flex-1 min-h-[56px] max-h-40 resize-none"
                placeholder="Ask a question…"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (question.trim() && !chatLoading) sendMessage();
                  }
                }}
              />
              <Button
                onClick={sendMessage}
                disabled={chatLoading || !question.trim()}
              >
                {chatLoading ? "Sending…" : "Send"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
