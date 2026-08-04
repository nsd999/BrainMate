'use client';

import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Footer({ onOpenWhyBrainMate }) {
  return (
    <footer className="w-full border-t border-border/80 bg-card text-card-foreground transition-colors py-3.5 px-4 sm:px-8 mt-12">
      <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Why BrainMate Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenWhyBrainMate}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            <span>Why BrainMate?</span>
          </button>
        </div>

        {/* Made with Love by Sai Dheeraj */}
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <span>Crafted with</span>
          <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
          <span>by</span>
          <Link
            href="/about"
            className="font-bold text-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Sai Dheeraj
          </Link>
        </div>

        {/* Separate Page Link */}
        <div className="flex items-center gap-2">
          <Link
            href="/about"
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>About & Credits</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
