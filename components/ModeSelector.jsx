'use client';

import { GraduationCap, Briefcase, Baby, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { playPop } from '@/lib/sound';

const MODE_CONFIG = {
  kid: {
    icon: Baby,
    title: "Explain like I'm 8",
    hint: 'Simple, fun & relatable',
    gradientBg: 'from-amber-500/20 via-orange-500/10 to-transparent',
    borderActive: 'border-amber-500 shadow-amber-500/20 ring-amber-500/30',
    iconActive: 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30',
    badgeText: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
    badgeClass: 'text-amber-500 dark:text-amber-400'
  },
  student: {
    icon: GraduationCap,
    title: 'Standard & Clear',
    hint: 'Step-by-step for study',
    gradientBg: 'from-indigo-500/20 via-purple-500/10 to-transparent',
    borderActive: 'border-indigo-500 shadow-indigo-500/20 ring-indigo-500/30',
    iconActive: 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30',
    badgeText: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white',
    badgeClass: 'text-indigo-500 dark:text-indigo-400'
  },
  pro: {
    icon: Briefcase,
    title: 'Technical & Deep',
    hint: 'Concise & practical depth',
    gradientBg: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    borderActive: 'border-emerald-500 shadow-emerald-500/20 ring-emerald-500/30',
    iconActive: 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30',
    badgeText: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white',
    badgeClass: 'text-emerald-500 dark:text-emerald-400'
  }
};

export default function ModeSelector({ modes, selectedMode, onSelectMode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          Explanation Depth
        </label>
        <span className="text-[11px] text-muted-foreground font-semibold">
          Select explanation style
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {modes.map((mode) => {
          const config = MODE_CONFIG[mode.id] || MODE_CONFIG.student;
          const Icon = config.icon;
          const isSelected = selectedMode === mode.id;

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => {
                playPop();
                onSelectMode(mode.id);
              }}
              className={cn(
                'group relative flex items-center sm:flex-col sm:items-start gap-3 sm:gap-2.5 rounded-2xl border p-3.5 text-left transition-all duration-200 focus:outline-none magnetic-card cursor-pointer',
                isSelected
                  ? cn('border-2 bg-gradient-to-br ring-2 shadow-lg', config.gradientBg, config.borderActive)
                  : 'border-border/80 bg-card/80 text-foreground hover:border-border hover:bg-muted/40 hover:shadow-md'
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200',
                    isSelected
                      ? config.iconActive
                      : 'bg-muted text-muted-foreground group-hover:text-foreground group-hover:scale-105'
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                </span>
                {isSelected && (
                  <span className={cn('hidden sm:block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs', config.badgeText)}>
                    Active
                  </span>
                )}
              </div>

              <div>
                <div className="text-xs sm:text-sm font-extrabold tracking-tight">
                  {config.title}
                </div>
                <div className="text-[11px] text-muted-foreground font-medium line-clamp-1">
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

