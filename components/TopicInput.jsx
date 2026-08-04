'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Zap, X, Dices, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { playClick, playPop } from '@/lib/sound';

const SUGGESTIONS = [
  { text: 'Quantum Computing', icon: '⚛️' },
  { text: 'Compound Interest', icon: '📈' },
  { text: 'How Inflation Works', icon: '💸' },
  { text: 'Photosynthesis', icon: '🌿' },
  { text: 'Machine Learning vs AI', icon: '🧠' },
  { text: 'CRISPR Gene Editing', icon: '🧬' },
  { text: 'How Blockchains Work', icon: '⛓️' }
];

export default function TopicInput({
  topic,
  setTopic,
  loading,
  streaming,
  onGenerate,
  onStop
}) {
  const [spinning, setSpinning] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (topic.trim() && !loading) {
        playClick();
        onGenerate();
      }
    }
  };

  const handleSurpriseMe = () => {
    playPop();
    setSpinning(true);
    const randomIndex = Math.floor(Math.random() * SUGGESTIONS.length);
    const randomTopic = SUGGESTIONS[randomIndex].text;
    setTopic(randomTopic);

    setTimeout(() => {
      setSpinning(false);
    }, 400);
  };

  return (
    <div className="flex flex-col gap-3.5">
      {/* Textarea Input Container with Dynamic Neon Focus Border */}
      <div className="relative rounded-3xl border border-indigo-500/20 bg-card/90 backdrop-blur-xl shadow-lg transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/15 overflow-hidden">
        <Textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What do you want to understand today? e.g. How does compound interest work? or Explain Quantum Entanglement..."
          disabled={loading && !streaming}
          className="min-h-[110px] w-full resize-none border-0 bg-transparent p-4 sm:p-5 text-sm sm:text-base focus-visible:ring-0 placeholder:text-muted-foreground/60 leading-relaxed font-medium"
        />

        {/* Bottom Toolbar inside input */}
        <div className="flex flex-wrap items-center justify-between border-t border-border/60 px-3.5 py-3 bg-muted/30 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground font-semibold hidden xs:inline">
              Press <kbd className="rounded-md border border-border px-1.5 py-0.5 text-[10px] font-extrabold bg-background shadow-2xs">Enter ↵</kbd>
            </span>

            {/* Surprise Me Button */}
            <button
              type="button"
              onClick={handleSurpriseMe}
              className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs font-extrabold text-purple-600 dark:text-purple-300 hover:bg-purple-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Dices className={`h-3.5 w-3.5 text-purple-500 ${spinning ? 'animate-spin' : ''}`} />
              <span>Surprise Me 🎲</span>
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {topic && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  playPop();
                  setTopic('');
                }}
                className="h-8.5 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl font-bold"
              >
                <X className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            )}

            {streaming ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  playPop();
                  onStop();
                }}
                className="h-9 gap-2 rounded-xl px-4 text-xs font-extrabold shadow-md active:scale-95"
              >
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                Stop
              </Button>
            ) : (
              <Button
                onClick={() => {
                  playClick();
                  onGenerate();
                }}
                disabled={!topic.trim() || loading}
                className="h-9 gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white px-5 text-xs font-extrabold shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50 active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    Writing explanation...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-amber-300 fill-amber-300" />
                    <span>Explain Concept</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Suggested Topics Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="flex items-center gap-1 text-[11px] font-extrabold text-muted-foreground">
          <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> Trending Topics:
        </span>
        {SUGGESTIONS.map((item) => (
          <button
            key={item.text}
            type="button"
            onClick={() => {
              playPop();
              setTopic(item.text);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-card/80 px-3 py-1 text-xs font-bold text-muted-foreground transition-all hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10 hover:shadow-xs active:scale-95 cursor-pointer"
          >
            <span>{item.icon}</span>
            <span>{item.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

