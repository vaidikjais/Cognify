// app/page.js
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Globe,
  Upload,
  ArrowRight,
  Sparkles,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";

function Showcase() {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-6 shadow">
      {/* subtle browser top bar */}
      <div className="mb-4 flex items-center gap-1">
        <span className="h-2.5 w-2.5 rounded-full bg-muted" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted" />
      </div>

      <div className="space-y-4">
        {/* Sources */}
        <Card className="bg-background/40">
          <CardContent className="flex items-center gap-3 p-4 text-sm">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <div className="font-medium">Add sources</div>
              <div className="text-muted-foreground">PDFs, CSVs, TXT, and links</div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="bg-background/40">
          <CardContent className="flex items-center gap-3 p-4 text-sm">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <div className="font-medium">AI summary</div>
              <div className="text-muted-foreground">Concise overview of key points</div>
            </div>
          </CardContent>
        </Card>

        {/* Chat */}
        <Card className="bg-background/40">
          <CardContent className="flex items-center gap-3 p-4 text-sm">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <MessageSquare className="h-5 w-5" />
            </span>
            <div>
              <div className="font-medium">Chat with citations</div>
              <div className="text-muted-foreground">Grounded answers, never guesses</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        Add sources, get summaries, and chat — all in one place.
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-56px)]">
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-20 md:grid-cols-12 md:px-6">
          <div className="md:col-span-7 space-y-6">
            <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
              Retrieval-Augmented Generation
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              Make your knowledge understandable with <span className="text-primary">Cognify</span>
            </h1>
            <p className="text-muted-foreground md:text-lg">
              Create collections, add PDFs/CSVs/links, and ask grounded questions.
              Summaries and citations originate from your sources — never guesses.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="/collections"
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 text-primary-foreground shadow hover:bg-primary/90"
              >
                Get started
              </a>
              <a
                href="/studio"
                className="inline-flex items-center justify-center rounded-md border border-border px-5 py-3 hover:bg-accent"
              >
                Open Studio
              </a>
            </div>
          </div>

          {/* Visual */}
          <div className="md:col-span-5">
            <Showcase />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Create Collections</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Organize projects into dedicated spaces for clean retrieval. Keep work, study,
                and research separate — and focused.
              </CardContent>
            </Card>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Add Sources Easily</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Upload PDFs, paste text, or fetch from websites. Indexed quickly with OpenAI embeddings
                and stored in Qdrant.
              </CardContent>
            </Card>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Ask &amp; Cite</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Every answer cites its sources. No hallucinations — responses are grounded in your data.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Cognify (bullets only) */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">Why Cognify</h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-[2px] h-4 w-4 text-primary" />
              <span><strong>Grounded by design.</strong> Retrieval from Qdrant; answers based only on your context.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-[2px] h-4 w-4 text-primary" />
              <span><strong>Private by default.</strong> Qdrant runs locally in Docker; your data stays with you.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-[2px] h-4 w-4 text-primary" />
              <span><strong>Production-lean.</strong> Next.js + shadcn UI. No streaming required; simple loader UX.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-accent/40 p-6 md:flex-row md:items-center">
            <div>
              <h3 className="text-xl font-semibold">Ready to make your knowledge understandable?</h3>
              <p className="text-sm text-muted-foreground">
                Create a collection and start indexing your sources in minutes.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild>
                <a href="/collections">Get started</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/studio">Open Studio</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}