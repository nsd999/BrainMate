'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('[BrainMate UI error boundary]', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500" aria-hidden="true">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight">Something went wrong.</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            BrainMate hit an unexpected error. Your saved learning history is kept separately.
          </p>
        </div>
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </main>
  );
}
