'use client';

import {
  Sparkles,
  Copy,
  Share2,
  Volume2,
  VolumeX,
  FileDown,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Clock,
  BookOpen,
  Zap,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ExplanationCard({
  result,
  activeSection,
  onStartQuiz,
  onAskFollowup,
  speaking,
  speakingWhat,
  onSpeak,
  onStopSpeak,
  onShare,
  onExportPdf
}) {
  if (!result) return null;

  const copySection = (title, content) => {
    navigator.clipboard.writeText(`${title}:\n${content}`);
    toast.success(`Copied ${title} to clipboard`);
  };

  const getModeBadge = (mode) => {
    switch (mode) {
      case 'kid':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30';
      case 'pro':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30';
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in-up duration-300">
      {/* Header bar for explanation result */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-200/50 dark:border-purple-900/40 pb-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className={cn('rounded-lg px-2.5 py-0.5 text-xs font-bold border uppercase tracking-wider', getModeBadge(result.mode))}>
              {result.mode || 'Student'} MODE
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              {result.topic}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Explained clearly in <span className="font-semibold text-foreground">{result.language || 'English'}</span>
          </p>
        </div>

        {/* Action bar (Share, Export, Quiz) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            className="h-8.5 gap-1.5 rounded-xl border-purple-200 dark:border-purple-900/60 text-xs font-medium hover:bg-purple-50 dark:hover:bg-purple-950/40"
          >
            <Share2 className="h-3.5 w-3.5 text-purple-500" />
            Share
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onExportPdf}
            className="h-8.5 gap-1.5 rounded-xl border-purple-200 dark:border-purple-900/60 text-xs font-medium hover:bg-purple-50 dark:hover:bg-purple-950/40"
          >
            <FileDown className="h-3.5 w-3.5 text-indigo-500" />
            Export PDF
          </Button>

          <Button
            size="sm"
            onClick={onStartQuiz}
            className="h-8.5 gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 hover:scale-105 transition-all"
          >
            <HelpCircle className="h-3.5 w-3.5 text-white" />
            Take Pop Quiz
          </Button>
        </div>
      </div>

      {/* 1. Simple Explanation Card */}
      {result.simple_explanation && (
        <div
          className={cn(
            'group relative rounded-2xl border p-5 sm:p-6 transition-all duration-200 bg-card shadow-sm border-purple-100 dark:border-purple-950/60',
            activeSection === 'simple_explanation' && 'border-purple-500 ring-2 ring-purple-500/20 shadow-md'
          )}
        >
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-300 font-bold shadow-2xs">
                <BookOpen className="h-4 w-4" />
              </span>
              <h3 className="text-base font-bold tracking-tight text-foreground">
                Simple Explanation
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  speakingWhat === 'simple_explanation'
                    ? onStopSpeak()
                    : onSpeak(result.simple_explanation, 'simple_explanation')
                }
                className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline transition-colors"
              >
                {speakingWhat === 'simple_explanation' ? (
                  <>
                    <VolumeX className="h-4 w-4 text-rose-500 animate-pulse" /> Stop
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4 text-purple-500" /> Listen
                  </>
                )}
              </button>
              <button
                onClick={() => copySection('Simple Explanation', result.simple_explanation)}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </button>
            </div>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-foreground/90 font-normal">
            {result.simple_explanation}
          </p>
        </div>
      )}

      {/* 2. Real-Life Analogy Card */}
      {result.real_life_analogy && (
        <div
          className={cn(
            'group relative rounded-2xl border p-5 sm:p-6 transition-all duration-200 bg-card shadow-sm border-pink-100 dark:border-pink-950/60',
            activeSection === 'real_life_analogy' && 'border-pink-500 ring-2 ring-pink-500/20 shadow-md'
          )}
        >
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-300 font-bold shadow-2xs">
                <Sparkles className="h-4 w-4" />
              </span>
              <h3 className="text-base font-bold tracking-tight text-foreground">
                Real-Life Analogy
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  speakingWhat === 'real_life_analogy'
                    ? onStopSpeak()
                    : onSpeak(result.real_life_analogy, 'real_life_analogy')
                }
                className="inline-flex items-center gap-1.5 text-xs font-medium text-pink-600 dark:text-pink-400 hover:underline transition-colors"
              >
                {speakingWhat === 'real_life_analogy' ? (
                  <>
                    <VolumeX className="h-4 w-4 text-rose-500 animate-pulse" /> Stop
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4 text-pink-500" /> Listen
                  </>
                )}
              </button>
              <button
                onClick={() => copySection('Real-Life Analogy', result.real_life_analogy)}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </button>
            </div>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-foreground/90 italic bg-gradient-to-br from-pink-500/5 to-purple-500/5 dark:from-pink-950/30 dark:to-purple-950/30 rounded-2xl p-4 border border-pink-200/50 dark:border-pink-900/40">
            "{result.real_life_analogy}"
          </p>
        </div>
      )}

      {/* 3. Step-by-Step Breakdown Card */}
      {Array.isArray(result.step_by_step) && result.step_by_step.length > 0 && (
        <div className="rounded-2xl border border-indigo-100 dark:border-indigo-950/60 bg-card p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 font-bold shadow-2xs">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <h3 className="text-base font-bold tracking-tight text-foreground">
                Step-by-Step Breakdown
              </h3>
            </div>
            <button
              onClick={() => copySection('Step-by-Step', result.step_by_step.join('\n'))}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          </div>
          <ul className="flex flex-col gap-3">
            {result.step_by_step.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3 rounded-2xl bg-indigo-500/5 dark:bg-indigo-950/30 p-3.5 border border-indigo-100/60 dark:border-indigo-900/30 text-xs sm:text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black shadow-xs">
                  {idx + 1}
                </span>
                <span className="text-foreground/90 pt-0.5 leading-relaxed font-normal">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. Summary & Action Plan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {result.summary && (
          <div className="rounded-2xl border border-amber-200/70 dark:border-amber-900/50 bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-amber-950/20 dark:to-orange-950/20 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                TL;DR Summary
              </h4>
              <button
                onClick={() => copySection('Summary', result.summary)}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed">
              {result.summary}
            </p>
          </div>
        )}

        {Array.isArray(result.action_plan) && result.action_plan.length > 0 && (
          <div className="rounded-2xl border border-emerald-200/70 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-950/20 dark:to-teal-950/20 p-5 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              Action Roadmap
            </h4>
            <div className="flex flex-col gap-2.5">
              {result.action_plan.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs">
                  {item.time && (
                    <span className="inline-flex items-center gap-1 shrink-0 rounded-lg bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                      <Clock className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> {item.time}
                    </span>
                  )}
                  <span className="text-foreground/90 font-medium truncate">{item.step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Follow-up Prompts Section */}
      <div className="rounded-2xl border border-purple-200/50 dark:border-purple-900/40 bg-card p-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-purple-500" />
          Have Follow-Up Questions?
        </h4>
        <p className="text-xs text-muted-foreground mb-3">
          Click a suggestion to dive deeper with BrainMate:
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            `Why is ${result.topic} important in real life?`,
            `What is a common mistake people make about ${result.topic}?`,
            `Give me another practical example of ${result.topic}`
          ].map((promptText, i) => (
            <button
              key={i}
              onClick={() => onAskFollowup(promptText)}
              className="flex items-center gap-2 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-500/5 px-3.5 py-2 text-xs font-medium text-foreground/90 transition-all hover:bg-purple-500/10 hover:border-purple-400 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{promptText}</span>
              <ArrowRight className="h-3.5 w-3.5 text-purple-500" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
