export default function Loading() {
  return (
    <main
      className="min-h-screen bg-background text-foreground flex items-center justify-center px-4"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="w-full max-w-sm space-y-4 text-center">
        <div className="mx-auto h-10 w-10 rounded-2xl bg-indigo-500/10 animate-pulse" aria-hidden="true" />
        <div className="space-y-2">
          <div className="mx-auto h-4 w-32 rounded-full bg-muted animate-pulse" />
          <div className="mx-auto h-3 w-56 rounded-full bg-muted/70 animate-pulse" />
        </div>
        <p className="text-xs font-semibold text-muted-foreground">Loading BrainMate…</p>
      </div>
    </main>
  );
}
