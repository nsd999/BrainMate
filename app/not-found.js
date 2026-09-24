import Link from 'next/link';
import { ArrowLeft, Brain } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500" aria-hidden="true">
          <Brain className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">404</p>
          <h1 className="text-2xl font-black tracking-tight">That page doesn’t exist.</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The link may be outdated, or the page may have moved. BrainMate is still here.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to BrainMate
        </Link>
      </div>
    </main>
  );
}
