'use client';

import { Brain, Sparkles, Sun, Moon, Languages, History, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header({
  theme,
  setTheme,
  language,
  setLanguage,
  languages,
  historyOpen,
  setHistoryOpen,
  historyCount,
  stats
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background shadow-sm">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                BrainMate
              </h1>
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground border border-border">
                AI Tutor
              </span>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Understand better. Learn smarter.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Stats Badge */}
          {stats?.total_explanations > 0 && (
            <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-border/80 bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5 text-foreground/70" />
              <span>{stats.total_explanations} Explained</span>
            </div>
          )}

          {/* Language Selector */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="h-8 appearance-none rounded-lg border border-border bg-card px-2.5 pr-7 text-xs font-medium text-foreground hover:bg-muted/50 focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
              aria-label="Select language"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.label}
                </option>
              ))}
            </select>
            <Languages className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
          </div>

          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-8 w-8 rounded-lg border-border hover:bg-muted"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-foreground/80" />
            ) : (
              <Moon className="h-4 w-4 text-foreground/80" />
            )}
          </Button>

          {/* History Sidebar Toggle */}
          <Button
            variant={historyOpen ? 'default' : 'outline'}
            size="sm"
            onClick={() => setHistoryOpen(!historyOpen)}
            className="h-8 gap-1.5 rounded-lg text-xs font-medium"
          >
            <History className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-muted-foreground/20 px-1 text-[10px] font-bold">
                {historyCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
