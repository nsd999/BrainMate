'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sun,
  Moon,
  Languages,
  History,
  Star,
  Instagram,
  Globe,
  ArrowUpRight,
  X,
  Bell,
  Heart,
  ChevronRight,
  Info,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { requestNotificationPermission } from '@/lib/notifications';

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
  const [brandMenuOpen, setBrandMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Top-Left Brand Logo (Clickable -> Opens Side Menu) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setBrandMenuOpen(!brandMenuOpen)}
            className="flex items-center gap-3 group text-left focus:outline-none rounded-2xl p-1 -ml-1 transition-all hover:bg-muted/60 active:scale-98"
            title="Menu & Brand links"
          >
            <div className="relative h-9 w-9 rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform border border-border">
              <img
                src="/logo.png"
                alt="BrainMate Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  BrainMate
                </h1>
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block font-medium">
                Menu & Links ▾
              </p>
            </div>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Stats Badge */}
          {stats?.total_explanations > 0 && (
            <div className="hidden md:flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground font-medium">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span>{stats.total_explanations} Explained</span>
            </div>
          )}

          {/* Language Selector */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="h-8.5 appearance-none rounded-xl border border-border bg-card px-2.5 pr-7 text-xs font-medium text-foreground hover:bg-muted/50 focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer shadow-2xs"
              aria-label="Select language"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.label}
                </option>
              ))}
            </select>
            <Languages className="pointer-events-none absolute right-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          </div>

          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-8.5 w-8.5 rounded-xl border-border hover:bg-muted"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </Button>

          {/* History Sidebar Toggle */}
          <Button
            variant={historyOpen ? 'default' : 'outline'}
            size="sm"
            onClick={() => setHistoryOpen(!historyOpen)}
            className="h-8.5 gap-1.5 rounded-xl text-xs font-medium"
          >
            <History className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 text-white px-1 text-[10px] font-bold">
                {historyCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Brand Side Menu / Drawer (Triggered by Logo Click) */}
      {brandMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
            onClick={() => setBrandMenuOpen(false)}
          />

          {/* Side Drawer panel */}
          <div className="relative z-10 w-80 max-w-[85vw] bg-card border-r border-border shadow-2xl p-5 flex flex-col justify-between h-full animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              {/* Header inside side menu */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl overflow-hidden border border-border shadow-xs">
                    <img src="/logo.png" alt="Logo" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">BrainMate</h3>
                    <p className="text-xs text-muted-foreground font-medium">
                      by NSD Creations
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setBrandMenuOpen(false)}
                  className="h-8 w-8 rounded-xl hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Brand Links & Options List */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                  Links & Options
                </span>

                {/* 1. NSD Creations */}
                <a
                  href="https://tinyurl.com/nsd-creations"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setBrandMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl border border-border/80 bg-background p-3 text-xs font-semibold text-foreground hover:bg-muted transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-[10px]">
                      NSD
                    </div>
                    <div className="flex flex-col">
                      <span>NSD Creations</span>
                      <span className="text-[10px] font-normal text-muted-foreground">Creative Tech Partner</span>
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </a>

                {/* 2. Instagram */}
                <a
                  href="https://instagram.com/nsd.creations.official"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setBrandMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl border border-border/80 bg-background p-3 text-xs font-semibold text-foreground hover:bg-muted transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                      <Instagram className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span>Instagram</span>
                      <span className="text-[10px] font-normal text-muted-foreground">@nsd.creations.official</span>
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </a>

                {/* 3. Website */}
                <a
                  href="https://tinyurl.com/nsd-creations"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setBrandMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl border border-border/80 bg-background p-3 text-xs font-semibold text-foreground hover:bg-muted transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span>Official Website</span>
                      <span className="text-[10px] font-normal text-muted-foreground">Portfolio & Services</span>
                    </div>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </a>

                {/* 4. Why BrainMate / About */}
                <Link
                  href="/about"
                  onClick={() => setBrandMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl border border-border/80 bg-background p-3 text-xs font-semibold text-foreground hover:bg-muted transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Info className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span>About & Philosophy</span>
                      <span className="text-[10px] font-normal text-muted-foreground">Story & mode breakdown</span>
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>

                {/* 5. Notification Permissions */}
                <button
                  type="button"
                  onClick={() => {
                    requestNotificationPermission();
                    setBrandMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between rounded-xl border border-border/80 bg-background p-3 text-xs font-semibold text-foreground hover:bg-muted transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span>Study Notifications</span>
                      <span className="text-[10px] font-normal text-muted-foreground">Alerts for quiz & explanations</span>
                    </div>
                  </div>
                  <span className="text-[10px] border border-border px-2 py-0.5 rounded-md font-bold text-muted-foreground">
                    Toggle
                  </span>
                </button>
              </div>
            </div>

            {/* Founder Footer inside side menu */}
            <div className="pt-4 border-t border-border text-xs space-y-1">
              <p className="text-muted-foreground font-medium">
                Created by <strong className="text-foreground">Sai Dheeraj Nalkari</strong>
              </p>
              <p className="text-[11px] text-muted-foreground">Hyderabad, Telangana, India</p>
              <div className="pt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                <span>Handcrafted with</span>
                <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />
                <span>for clear learning</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
