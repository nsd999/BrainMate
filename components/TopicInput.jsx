'use client';

import { Sparkles, Loader2, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const SUGGESTIONS = [
  'Compound Interest',
  'Quantum Computing',
  'How Inflation Works',
  'Photosynthesis',
  'Machine Learning vs AI',
  'How Blockchains Work'
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
      <div className="relative rounded-2xl border border-border bg-card shadow-2xs transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
        <Textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What do you want to understand today? e.g., How does compound interest work? or Explain Docker containers..."
          disabled={loading && !streaming}
          className="min-h-[105px] w-full resize-none border-0 bg-transparent p-4 text-sm sm:text-base focus-visible:ring-0 placeholder:text-muted-foreground/60 leading-relaxed"
        />

        {/* Bottom Toolbar inside input */}
        <div className="flex items-center justify-between border-t border-border/60 px-3.5 py-2.5 bg-muted/20 rounded-b-2xl">
          <div className="text-[11px] text-muted-foreground font-medium">
            Press <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] font-semibold bg-background">Enter ↵</kbd> to generate
          </div>

          <div className="flex items-center gap-2">
            {topic && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTopic('')}
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl"
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
                className="h-8.5 gap-1.5 rounded-xl px-3.5 text-xs font-semibold shadow-xs"
              >
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                Stop
              </Button>
            ) : (
              <Button
                onClick={onGenerate}
                disabled={!topic.trim() || loading}
                className="h-8.5 gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    Writing explanation...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    Explain Concept
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Suggested Topics Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
          <Zap className="h-3 w-3 text-amber-500 fill-amber-500" /> Try asking:
        </span>
        {SUGGESTIONS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTopic(item)}
            className="rounded-xl border border-border/70 bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground transition-all hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/5"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
