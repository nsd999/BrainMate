'use client';

import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Footer({ onOpenWhyBrainMate }) {
  return (
    <footer className="w-full border-t border-purple-200/60 dark:border-purple-900/40 bg-card/90 backdrop-blur-md text-card-foreground transition-colors py-3 px-4 sm:px-8 mt-12">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Why BrainMate Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenWhyBrainMate}
            className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200/80 dark:border-purple-800/80 bg-purple-50 dark:bg-purple-950/50 px-3 py-1 text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-all hover:scale-105"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            <span>Why BrainMate?</span>
          </button>
        </div>

        {/* Made with Love by Sai Dheeraj */}
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <span>Made with</span>
          <Heart className="h-4 w-4 fill-rose-500 text-rose-500 animate-pulse" />
          <span>by</span>
          <Link
            href="/about"
            className="font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            Sai Dheeraj
          </Link>
        </div>

        {/* Separate Page Link */}
        <div className="flex items-center gap-2">
          <Link
            href="/about"
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            <span>NSD Creations & More Info</span>
            <ArrowRight className="h-3.5 w-3.5 text-purple-500" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
