'use client';

import { Sparkles, GraduationCap, Briefcase, Baby } from 'lucide-react';
import { cn } from '@/lib/utils';

const MODE_ICONS = {
  kid: Baby,
  student: GraduationCap,
  pro: Briefcase
};

export default function ModeSelector({ modes, selectedMode, onSelectMode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Select Audience Mode
      </label>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {modes.map((mode) => {
          const Icon = MODE_ICONS[mode.id] || Sparkles;
          const isSelected = selectedMode === mode.id;

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onSelectMode(mode.id)}
              className={cn(
                'group relative flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30',
                isSelected
                  ? 'border-purple-500/60 bg-purple-500/10 shadow-sm shadow-purple-500/10 ring-1 ring-purple-500/30'
                  : 'border-border/60 bg-background/60 hover:border-border hover:bg-muted/40'
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
                    isSelected
                      ? 'bg-purple-600 text-white'
                      : 'bg-muted text-muted-foreground group-hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {isSelected && (
                  <span className="h-2 w-2 rounded-full bg-purple-600 animate-pulse" />
                )}
              </div>
              <div>
                <div
                  className={cn(
                    'text-xs sm:text-sm font-semibold transition-colors',
                    isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-foreground'
                  )}
                >
                  {mode.label}
                </div>
                <div className="text-[11px] text-muted-foreground line-clamp-1">
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
