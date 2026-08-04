'use client';

import { Sparkles, GraduationCap, Briefcase, Baby } from 'lucide-react';
import { cn } from '@/lib/utils';

const MODE_CONFIG = {
  kid: {
    icon: Baby,
    activeBg: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-amber-500/25 border-amber-400',
    iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300',
    activeIconBg: 'bg-white/20 text-white',
    badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
  },
  student: {
    icon: GraduationCap,
    activeBg: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white shadow-purple-500/25 border-purple-400',
    iconBg: 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300',
    activeIconBg: 'bg-white/20 text-white',
    badge: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30'
  },
  pro: {
    icon: Briefcase,
    activeBg: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-emerald-500/25 border-emerald-400',
    iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300',
    activeIconBg: 'bg-white/20 text-white',
    badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
  }
};

export default function ModeSelector({ modes, selectedMode, onSelectMode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-purple-500" />
          <span>Audience Mode</span>
        </label>
        <span className="text-[11px] font-medium text-purple-600 dark:text-purple-400">
          Tailors language & depth
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {modes.map((mode) => {
          const config = MODE_CONFIG[mode.id] || MODE_CONFIG.student;
          const Icon = config.icon;
          const isSelected = selectedMode === mode.id;

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onSelectMode(mode.id)}
              className={cn(
                'group relative flex flex-col items-start gap-1.5 rounded-2xl border p-3.5 text-left transition-all duration-200 focus:outline-none shadow-sm hover:scale-[1.02] active:scale-[0.98]',
                isSelected
                  ? cn('border-transparent shadow-lg font-medium', config.activeBg)
                  : 'border-border/80 bg-card text-foreground hover:border-purple-300 dark:hover:border-purple-800 hover:shadow-md'
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-xl transition-colors shadow-xs',
                    isSelected ? config.activeIconBg : config.iconBg
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {isSelected && (
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                )}
              </div>

              <div className="mt-1">
                <div className="text-xs sm:text-sm font-bold tracking-tight">
                  {mode.label}
                </div>
                <div
                  className={cn(
                    'text-[11px] line-clamp-1',
                    isSelected ? 'text-white/90 font-medium' : 'text-muted-foreground'
                  )}
                >
                  {mode.hint}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
