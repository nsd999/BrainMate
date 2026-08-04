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
  ExternalLink,
  Flame,
  Zap,
  Volume2,
  VolumeX,
  Trophy,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { requestNotificationPermission } from '@/lib/notifications';
import { playClick, playPop } from '@/lib/sound';

export default function Header({
  theme,
  setTheme,
  language,
  setLanguage,
  languages,
  historyOpen,
  setHistoryOpen,
  historyCount,
  stats,
  streak = 1,
  xp = 50,
  soundMuted,
  setSoundMuted
}) {
  const [brandMenuOpen, setBrandMenuOpen] = useState(false);
  const [levelModalOpen, setLevelModalOpen] = useState(false);

  // Calculate Level (Every 100 XP is 1 Level)
  const level = Math.floor(xp / 100) + 1;
  const xpInCurrentLevel = xp % 100;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-xl shadow-xs transition-all">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-3 sm:px-6 py-2.5">
        {/* Top-Left Brand Logo (Clickable -> Opens Side Menu) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              playClick();
              setBrandMenuOpen(!brandMenuOpen);
            }}
            className="flex items-center gap-2.5 group text-left focus:outline-none rounded-2xl p-1 -ml-1 transition-all hover:bg-muted/60 active:scale-95"
            title="Menu & Brand links"
          >
            <div className="relative h-9 w-9 rounded-xl overflow-hidden shadow-md group-hover:scale-105 transition-transform border border-indigo-500/30 rainbow-border">
              <img
                src="/logo.png"
                alt="BrainMate Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                  BrainMate
                </h1>
                <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  v2.5
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground hidden sm:block font-semibold">
                Menu & Links ▾
              </p>
            </div>
          </button>
        </div>

        {/* Gamification Stats Badges & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Daily Streak Badge */}
          <button
            type="button"
            onClick={() => {
              playPop();
              setLevelModalOpen(true);
            }}
            className="flex items-center gap-1 rounded-xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/15 px-2.5 py-1 text-xs font-extrabold text-amber-600 dark:text-amber-400 hover:scale-105 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Daily Learning Streak"
          >
            <Flame className="h-4 w-4 fill-amber-500 text-amber-500 animate-bounce-subtle" />
            <span>{streak}d</span>
          </button>

          {/* XP & Level Badge */}
          <button
            type="button"
            onClick={() => {
              playPop();
              setLevelModalOpen(true);
            }}
            className="hidden xs:flex items-center gap-1 rounded-xl border border-purple-500/30 bg-purple-500/10 dark:bg-purple-500/15 px-2.5 py-1 text-xs font-extrabold text-purple-600 dark:text-purple-300 hover:scale-105 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Experience Level"
          >
            <Zap className="h-3.5 w-3.5 fill-purple-500 text-purple-500" />
            <span>Lvl {level}</span>
          </button>

          {/* Audio Sound Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const next = !soundMuted;
              setSoundMuted(next);
              if (!next) playPop();
            }}
            className="h-8.5 w-8.5 rounded-xl border-border/80 hover:bg-muted/80"
            title={soundMuted ? 'Unmute UI sounds' : 'Mute UI sounds'}
          >
            {soundMuted ? (
              <VolumeX className="h-4 w-4 text-rose-500" />
            ) : (
              <Volume2 className="h-4 w-4 text-indigo-500" />
            )}
          </Button>

          {/* Language Selector */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => {
                playClick();
                setLanguage(e.target.value);
              }}
              className="h-8.5 appearance-none rounded-xl border border-border/80 bg-card/90 px-2 pr-6 text-xs font-semibold text-foreground hover:bg-muted/60 focus:outline-none cursor-pointer shadow-2xs"
              aria-label="Select language"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.label}
                </option>
              ))}
            </select>
            <Languages className="pointer-events-none absolute right-1.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          </div>

          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              playPop();
              setTheme(theme === 'dark' ? 'light' : 'dark');
            }}
            className="h-8.5 w-8.5 rounded-xl border-border/80 hover:bg-muted"
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
            onClick={() => {
              playClick();
              setHistoryOpen(!historyOpen);
            }}
            className="h-8.5 gap-1.5 rounded-xl text-xs font-bold"
          >
            <History className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 text-white px-1 text-[10px] font-extrabold">
                {historyCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Gamification / Level Progress Modal */}
      {levelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-3xl border border-indigo-500/30 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500 fill-amber-500" />
                <h3 className="text-base font-extrabold text-foreground">Learning Rewards</h3>
              </div>
              <button
                onClick={() => setLevelModalOpen(false)}
                className="rounded-xl p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Streak info */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2.5">
                  <Flame className="h-6 w-6 text-amber-500 fill-amber-500" />
                  <div>
                    <div className="font-extrabold text-foreground text-sm">{streak} Day Streak</div>
                    <div className="text-muted-foreground text-[11px]">Learn every day to keep your streak hot!</div>
                  </div>
                </div>
              </div>

              {/* XP Level progress bar */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <div className="flex justify-between font-bold text-foreground text-xs">
                  <span>Level {level} Scholar</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{xp} total XP</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 rounded-full"
                    style={{ width: `${xpInCurrentLevel}%` }}
                  />
                </div>
                <div className="text-[11px] text-muted-foreground font-medium flex items-center justify-between">
                  <span>{xpInCurrentLevel}/100 XP to Level {level + 1}</span>
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] text-muted-foreground font-medium pt-1">
                <p className="flex items-center gap-1.5">⚡ <strong>+20 XP</strong> per concept explained</p>
                <p className="flex items-center gap-1.5">🎯 <strong>+50 XP</strong> per quiz completed</p>
                <p className="flex items-center gap-1.5">💡 <strong>+10 XP</strong> per reaction shared</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Brand Side Menu / Drawer */}
      {brandMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setBrandMenuOpen(false)}
          />

          <div className="relative z-10 w-80 max-w-[85vw] bg-card border-r border-border shadow-2xl p-5 flex flex-col justify-between h-full animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl overflow-hidden border border-border shadow-xs">
                    <img src="/logo.png" alt="Logo" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-foreground">BrainMate</h3>
                    <p className="text-xs text-muted-foreground font-semibold">
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

              <div className="space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground px-1">
                  Links & Options
                </span>

                <a
                  href="https://tinyurl.com/nsd-creations"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setBrandMenuOpen(false)}
                  className="flex items-center justify-between rounded-2xl border border-border/80 bg-background/60 p-3 text-xs font-bold text-foreground hover:bg-muted transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-foreground text-background flex items-center justify-center font-black text-[10px]">
                      NSD
                    </div>
                    <div className="flex flex-col">
                      <span>NSD Creations</span>
                      <span className="text-[10px] font-normal text-muted-foreground">Creative Tech Partner</span>
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </a>

                <a
                  href="https://instagram.com/nsd.creations.official"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setBrandMenuOpen(false)}
                  className="flex items-center justify-between rounded-2xl border border-border/80 bg-background/60 p-3 text-xs font-bold text-foreground hover:bg-muted transition-all group"
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

                <Link
                  href="/about"
                  onClick={() => setBrandMenuOpen(false)}
                  className="flex items-center justify-between rounded-2xl border border-border/80 bg-background/60 p-3 text-xs font-bold text-foreground hover:bg-muted transition-all group"
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
              </div>
            </div>

            <div className="pt-4 border-t border-border text-xs space-y-1">
              <p className="text-muted-foreground font-semibold">
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

