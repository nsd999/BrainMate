'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
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
    <header className="sticky top-0 z-40 w-full border-b border-purple-200/50 dark:border-purple-900/40 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Top-Left Brand Logo (Clickable -> Opens Side Menu) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setBrandMenuOpen(!brandMenuOpen)}
            className="flex items-center gap-3 group text-left focus:outline-none rounded-2xl p-1.5 -ml-1.5 transition-all hover:bg-purple-500/10 active:scale-95"
            title="Click to open NSD Creations brand menu & options"
          >
            <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 p-0.5 shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <img
                src="/logo.png"
                alt="BrainMate Logo"
                className="h-full w-full object-cover rounded-[14px]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex items-center gap-1">
                  BrainMate
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500/15 to-pink-500/15 px-2 py-0.5 text-[10px] font-extrabold text-purple-700 dark:text-purple-300 border border-purple-300/40 dark:border-purple-700/40">
                  <Sparkles className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
                  AI Tutor
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block font-medium">
                Click for NSD Creations & Options ▾
              </p>
            </div>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Stats Badge */}
          {stats?.total_explanations > 0 && (
            <div className="hidden md:flex items-center gap-1.5 rounded-xl border border-purple-200/60 dark:border-purple-900/50 bg-purple-500/5 px-3 py-1 text-xs text-muted-foreground font-semibold">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span>{stats.total_explanations} Explained</span>
            </div>
          )}

          {/* Language Selector */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="h-8.5 appearance-none rounded-xl border border-purple-200 dark:border-purple-900/60 bg-card px-3 pr-8 text-xs font-semibold text-foreground hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer shadow-2xs"
              aria-label="Select language"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.label}
                </option>
              ))}
            </select>
            <Languages className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-purple-500" />
          </div>

          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-8.5 w-8.5 rounded-xl border-purple-200 dark:border-purple-900/60 hover:bg-purple-500/10"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-purple-600" />
            )}
          </Button>

          {/* History Sidebar Toggle */}
          <Button
            variant={historyOpen ? 'default' : 'outline'}
            size="sm"
            onClick={() => setHistoryOpen(!historyOpen)}
            className={
              historyOpen
                ? 'h-8.5 gap-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-md shadow-purple-500/20'
                : 'h-8.5 gap-1.5 rounded-xl border-purple-200 dark:border-purple-900/60 text-xs font-bold hover:bg-purple-500/10'
            }
          >
            <History className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-white">
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
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setBrandMenuOpen(false)}
          />

          {/* Side Drawer panel */}
          <div className="relative z-10 w-80 max-w-[85vw] bg-card border-r border-purple-200 dark:border-purple-900/50 shadow-2xl p-5 flex flex-col justify-between h-full animate-in slide-in-from-left duration-250">
            <div className="space-y-6">
              {/* Header inside side menu */}
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 p-0.5 shadow-md">
                    <img src="/logo.png" alt="Logo" className="h-full w-full object-cover rounded-[14px]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-foreground">BrainMate</h3>
                    <p className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
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
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
                  Brand Navigation
                </span>

                {/* 1. NSD Creations */}
                <a
                  href="https://tinyurl.com/nsd-creations"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setBrandMenuOpen(false)}
                  className="flex items-center justify-between rounded-2xl border border-purple-100 dark:border-purple-900/40 bg-purple-500/5 p-3 text-xs font-bold text-foreground hover:bg-purple-500/10 hover:border-purple-400 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-xl bg-foreground text-background flex items-center justify-center font-black text-[10px]">
                      NSD
                    </div>
                    <div className="flex flex-col">
                      <span>NSD Creations</span>
                      <span className="text-[10px] font-medium text-muted-foreground">Creative Tech Partner</span>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-purple-500 group-hover:translate-x-0.5 transition-transform" />
                </a>

                {/* 2. Instagram */}
                <a
                  href="https://instagram.com/nsd.creations.official"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setBrandMenuOpen(false)}
                  className="flex items-center justify-between rounded-2xl border border-pink-100 dark:border-pink-900/40 bg-pink-500/5 p-3 text-xs font-bold text-foreground hover:bg-pink-500/10 hover:border-pink-400 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-xl bg-pink-500 text-white flex items-center justify-center">
                      <Instagram className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span>Instagram Page</span>
                      <span className="text-[10px] font-medium text-muted-foreground">@nsd.creations.official</span>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-pink-500 group-hover:translate-x-0.5 transition-transform" />
                </a>

                {/* 3. Website */}
                <a
                  href="https://tinyurl.com/nsd-creations"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setBrandMenuOpen(false)}
                  className="flex items-center justify-between rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-500/5 p-3 text-xs font-bold text-foreground hover:bg-indigo-500/10 hover:border-indigo-400 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-xl bg-indigo-500 text-white flex items-center justify-center">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span>Official Website</span>
                      <span className="text-[10px] font-medium text-muted-foreground">Visit Portfolio & Services</span>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
                </a>

                {/* 4. Why BrainMate / About */}
                <Link
                  href="/about"
                  onClick={() => setBrandMenuOpen(false)}
                  className="flex items-center justify-between rounded-2xl border border-amber-100 dark:border-amber-900/40 bg-amber-500/5 p-3 text-xs font-bold text-foreground hover:bg-amber-500/10 hover:border-amber-400 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                      <Info className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span>Why BrainMate & About</span>
                      <span className="text-[10px] font-medium text-muted-foreground">Detailed story & modes</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                {/* 5. Notification Permissions */}
                <button
                  type="button"
                  onClick={() => {
                    requestNotificationPermission();
                    setBrandMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-500/5 p-3 text-xs font-bold text-foreground hover:bg-emerald-500/10 hover:border-emerald-400 transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span>Enable Notifications</span>
                      <span className="text-[10px] font-medium text-muted-foreground">Get updates on quiz & study</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-500 text-white font-black px-2 py-0.5 rounded-full">
                    Enable
                  </span>
                </button>
              </div>
            </div>

            {/* Founder Footer inside side menu */}
            <div className="pt-4 border-t border-border/60 text-xs space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Founder: <strong className="text-foreground">Sai Dheeraj Nalkari</strong></span>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono">Hyderabad, Telangana, India</p>
              <div className="pt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                <span>Made with</span>
                <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />
                <span>for curious minds</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
