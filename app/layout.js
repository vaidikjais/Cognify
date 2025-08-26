// app/layout.js
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "Cognify",
  description: "Make your knowledge understandable.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
            <a href="/" className="flex items-center gap-2 font-semibold">
              <span className="inline-block h-2 w-2 rounded-full bg-primary" />
              Cognify
            </a>
            <nav className="flex items-center gap-3 text-sm">
              <a href="/collections" className="hover:text-primary">Collections</a>
              <a href="/studio" className="hover:text-primary">Studio</a>
              <span className="mx-2 hidden h-4 w-px bg-border md:inline-block" />
              <a
                href="https://www.linkedin.com/in/vaidik-jaiswal/"
                target="_blank"
                rel="noreferrer"
                className="hidden rounded-md px-2 py-1 text-xs hover:bg-accent md:inline-block"
              >
                LinkedIn
              </a>
              <a
                href="https://x.com/vaidikjais"
                target="_blank"
                rel="noreferrer"
                className="hidden rounded-md px-2 py-1 text-xs hover:bg-accent md:inline-block"
              >
                X
              </a>
            </nav>
          </div>
        </header>
        {children}
        <Toaster />
      </body>
    </html>
  );
}