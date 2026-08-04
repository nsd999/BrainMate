'use client';

import { Sparkles, Loader2, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const SUGGESTIONS = [
  'Compound Interest',
  'Quantum Computing',
  'How Blockchains Work',
  'Photosynthesis',
  'Machine Learning vs AI',
  'Inflation'
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
      <div className="relative rounded-2xl border border-border/80 bg-background shadow-sm transition-all focus-within:border-foreground/50 focus-within:ring-1 focus-within:ring-foreground/20">
        <Textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything... e.g. How does compound interest work? or Explain Docker containers"
          disabled={loading && !streaming}
          className="min-h-[100px] w-full resize-none border-0 bg-transparent p-4 text-sm focus-visible:ring-0 placeholder:text-muted-foreground/60"
        />

        {/* Bottom Toolbar inside input */}
        <div className="flex items-center justify-between border-t border-border/40 px-3.5 py-2.5 bg-muted/20 rounded-b-2xl">
          <div className="text-[11px] text-muted-foreground">
            Press <kbd className="rounded border border-border px-1 py-0.5 text-[10px] font-semibold bg-muted">Enter ↵</kbd> to ask
          </div>

          <div className="flex items-center gap-2">
            {topic && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTopic('')}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
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
                className="h-8 gap-1.5 rounded-lg px-3 text-xs font-semibold"
              >
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                Stop
              </Button>
            ) : (
              <Button
                onClick={onGenerate}
                disabled={!topic.trim() || loading}
                className="h-8.5 gap-2 rounded-xl bg-foreground text-background px-4 text-xs font-semibold shadow-sm hover:opacity-90 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Explaining...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Explain Concept
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Suggested Topics Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
          <Zap className="h-3 w-3 text-amber-500" /> Try:
        </span>
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => {
              setTopic(suggestion);
            }}
            className="rounded-lg border border-border/60 bg-card px-2.5 py-1 text-xs text-muted-foreground transition-all hover:border-foreground/40 hover:text-foreground"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
