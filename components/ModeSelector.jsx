'use client';

import { GraduationCap, Briefcase, Baby } from 'lucide-react';
import { cn } from '@/lib/utils';

const MODE_CONFIG = {
  kid: {
    icon: Baby,
    title: "Explain like I'm 8",
    hint: 'Simple, fun & relatable',
    badgeClass: 'border-amber-300 dark:border-amber-800 bg-amber-500/10 text-amber-900 dark:text-amber-200'
  },
  student: {
    icon: GraduationCap,
    title: 'Standard & Clear',
    hint: 'Step-by-step for study',
    badgeClass: 'border-indigo-300 dark:border-indigo-800 bg-indigo-500/10 text-indigo-900 dark:text-indigo-200'
  },
  pro: {
    icon: Briefcase,
    title: 'Technical & Deep',
    hint: 'Concise & practical depth',
    badgeClass: 'border-emerald-300 dark:border-emerald-800 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200'
  }
};

export default function ModeSelector({ modes, selectedMode, onSelectMode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Explanation Depth
        </label>
        <span className="text-[11px] text-muted-foreground font-medium">
          Select how you'd like it explained
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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
                'group relative flex items-center sm:flex-col sm:items-start gap-3 sm:gap-2 rounded-2xl border p-3 sm:p-3.5 text-left transition-all duration-150 focus:outline-none shadow-2xs hover:scale-[1.01]',
                isSelected
                  ? 'border-indigo-500 bg-indigo-500/10 dark:bg-indigo-950/40 text-foreground font-semibold ring-1 ring-indigo-500/30'
                  : 'border-border bg-card text-foreground hover:bg-muted/50 hover:border-border/80'
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-xl transition-colors',
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-muted text-muted-foreground group-hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {isSelected && (
                  <span className="hidden sm:block text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                    Active
                  </span>
                )}
              </div>

              <div>
                <div className="text-xs sm:text-sm font-bold tracking-tight">
                  {config.title}
                </div>
                <div className="text-[11px] text-muted-foreground line-clamp-1">
                  {config.hint}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
