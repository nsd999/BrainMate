'use client';

import { Sparkles, Loader2, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const SUGGESTIONS = [
  { label: 'Compound Interest', color: 'hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40' },
  { label: 'Quantum Computing', color: 'hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40' },
  { label: 'How Blockchains Work', color: 'hover:border-pink-400 hover:text-pink-600 dark:hover:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-950/40' },
  { label: 'Photosynthesis', color: 'hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40' },
  { label: 'Machine Learning vs AI', color: 'hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/40' },
  { label: 'Inflation', color: 'hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40' }
];

export default function TopicInput({
  topic,
  setTopic,
  loading,
  streaming,
  onGenerate,
  onStop
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (topic.trim() && !loading) {
        onGenerate();
      }
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Textarea Input Container */}
      <div className="relative rounded-2xl border border-purple-200/60 dark:border-purple-900/50 bg-card shadow-sm transition-all focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:shadow-md">
        <Textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything... e.g. How does compound interest work? or Explain Docker containers"
          disabled={loading && !streaming}
          className="min-h-[110px] w-full resize-none border-0 bg-transparent p-4 text-sm sm:text-base focus-visible:ring-0 placeholder:text-muted-foreground/60 leading-relaxed"
        />

        {/* Bottom Toolbar inside input */}
        <div className="flex items-center justify-between border-t border-border/50 px-3.5 py-2.5 bg-purple-500/5 rounded-b-2xl">
          <div className="text-[11px] text-muted-foreground font-medium">
            Press <kbd className="rounded border border-purple-200 dark:border-purple-800 px-1.5 py-0.5 text-[10px] font-bold bg-background text-purple-600 dark:text-purple-400">Enter ↵</kbd> to ask
          </div>

          <div className="flex items-center gap-2">
            {topic && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTopic('')}
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-purple-500/10 rounded-xl"
              >
                <X className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            )}

            {streaming ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={onStop}
                className="h-9 gap-1.5 rounded-xl px-4 text-xs font-bold shadow-md shadow-rose-500/20 animate-pulse"
              >
                <span className="h-2 w-2 rounded-full bg-white" />
                Stop
              </Button>
            ) : (
              <Button
                onClick={onGenerate}
                disabled={!topic.trim() || loading}
                className="h-9 gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white px-5 text-xs font-bold shadow-md shadow-purple-500/25 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    Explaining...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    Explain Concept
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Suggested Topics Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
          <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> Try:
        </span>
        {SUGGESTIONS.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              setTopic(item.label);
            }}
            className={`rounded-xl border border-border/70 bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-all shadow-2xs hover:scale-105 active:scale-95 ${item.color}`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
