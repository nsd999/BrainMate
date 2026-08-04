'use client';

import { Brain, Sparkles, Sun, Moon, Languages, History, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-md shadow-purple-500/20 transition-transform hover:scale-105">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
                BrainMate
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <Sparkles className="h-3 w-3" /> AI Buddy
              </span>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Learn anything like talking to a friend
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Stats Badge */}
          {stats?.total_explanations > 0 && (
            <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span>{stats.total_explanations} Explained</span>
            </div>
          )}

          {/* Language Selector */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="h-9 appearance-none rounded-lg border border-border/60 bg-background px-3 pr-8 text-xs font-medium text-foreground transition-colors hover:border-border focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
              aria-label="Select language"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.label}
                </option>
              ))}
            </select>
            <Languages className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>

          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9 rounded-lg border-border/60 hover:bg-muted"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700 transition-transform hover:-rotate-12" />
            )}
          </Button>

          {/* History Sidebar Toggle */}
          <Button
            variant={historyOpen ? 'default' : 'outline'}
            size="sm"
            onClick={() => setHistoryOpen(!historyOpen)}
            className={cn(
              'h-9 gap-2 rounded-lg text-xs font-medium transition-all',
              historyOpen && 'bg-purple-600 text-white hover:bg-purple-700'
            )}
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-purple-500/20 px-1 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                {historyCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
