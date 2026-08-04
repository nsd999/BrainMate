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
        Audience Mode
      </label>
      <div className="grid grid-cols-3 gap-2.5">
        {modes.map((mode) => {
          const Icon = MODE_ICONS[mode.id] || Sparkles;
          const isSelected = selectedMode === mode.id;

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onSelectMode(mode.id)}
              className={cn(
                'group relative flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all duration-150 focus:outline-none',
                isSelected
                  ? 'border-foreground/80 bg-foreground text-background font-medium shadow-sm'
                  : 'border-border bg-card text-foreground hover:bg-muted/50'
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-lg transition-colors',
                    isSelected
                      ? 'bg-background/20 text-background'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-1">
                <div className="text-xs sm:text-sm font-semibold">
                  {mode.label}
                </div>
                <div
                  className={cn(
                    'text-[11px] line-clamp-1',
                    isSelected ? 'text-background/80' : 'text-muted-foreground'
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
