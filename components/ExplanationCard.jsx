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

  const getModeLabel = (mode) => {
    switch (mode) {
      case 'kid':
        return "EXPLAIN LIKE I'M 8";
      case 'pro':
        return 'TECHNICAL & DEEP';
      default:
        return 'STANDARD & CLEAR';
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-200">
      {/* Header bar for explanation result */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="rounded-lg bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground border border-border tracking-wide uppercase">
              {getModeLabel(result.mode)}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {result.topic}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Explained in <span className="font-semibold text-foreground">{result.language || 'English'}</span>
          </p>
        </div>

        {/* Action bar (Share, Export, Quiz) */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            className="h-8.5 gap-1.5 rounded-xl border-border text-xs font-medium hover:bg-muted"
          >
            <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
            Share
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onExportPdf}
            className="h-8.5 gap-1.5 rounded-xl border-border text-xs font-medium hover:bg-muted"
          >
            <FileDown className="h-3.5 w-3.5 text-muted-foreground" />
            Export PDF
          </Button>

          <Button
            size="sm"
            onClick={onStartQuiz}
            className="h-8.5 gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Test Your Memory
          </Button>
        </div>
      </div>

      {/* 1. Simple Explanation Card */}
      {result.simple_explanation && (
        <div
          className={cn(
            'group relative rounded-2xl border border-border bg-card p-5 sm:p-6 transition-all duration-150 shadow-2xs',
            activeSection === 'simple_explanation' && 'border-indigo-500 ring-1 ring-indigo-500/20'
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                <BookOpen className="h-4 w-4" />
              </span>
              <h3 className="text-base font-bold text-foreground">
                The Core Idea
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  speakingWhat === 'simple_explanation'
                    ? onStopSpeak()
                    : onSpeak(result.simple_explanation, 'simple_explanation')
                }
                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline transition-colors"
              >
                {speakingWhat === 'simple_explanation' ? (
                  <>
                    <VolumeX className="h-3.5 w-3.5 text-rose-500" /> Stop
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5" /> Listen
                  </>
                )}
              </button>
              <button
                onClick={() => copySection('The Core Idea', result.simple_explanation)}
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
            'group relative rounded-2xl border border-border bg-card p-5 sm:p-6 transition-all duration-150 shadow-2xs',
            activeSection === 'real_life_analogy' && 'border-indigo-500 ring-1 ring-indigo-500/20'
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 font-bold">
                <Sparkles className="h-4 w-4" />
              </span>
              <h3 className="text-base font-bold text-foreground">
                Real-World Analogy
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  speakingWhat === 'real_life_analogy'
                    ? onStopSpeak()
                    : onSpeak(result.real_life_analogy, 'real_life_analogy')
                }
                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline transition-colors"
              >
                {speakingWhat === 'real_life_analogy' ? (
                  <>
                    <VolumeX className="h-3.5 w-3.5 text-rose-500" /> Stop
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5" /> Listen
                  </>
                )}
              </button>
              <button
                onClick={() => copySection('Real-World Analogy', result.real_life_analogy)}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </button>
            </div>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-foreground/90 italic bg-muted/40 rounded-xl p-4 border border-border/60">
            "{result.real_life_analogy}"
          </p>
        </div>
      )}

      {/* 3. Step-by-Step Breakdown Card */}
      {Array.isArray(result.step_by_step) && result.step_by_step.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <h3 className="text-base font-bold text-foreground">
                How It Works (Step-by-Step)
              </h3>
            </div>
            <button
              onClick={() => copySection('Step-by-Step Breakdown', result.step_by_step.join('\n'))}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          </div>
          <ul className="flex flex-col gap-2.5">
            {result.step_by_step.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3 rounded-xl bg-muted/30 p-3.5 border border-border/40 text-xs sm:text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white text-[11px] font-bold">
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
          <div className="rounded-2xl border border-border bg-card p-4.5 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Quick Summary
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
          <div className="rounded-2xl border border-border bg-card p-4.5 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
              3-Step Action Plan
            </h4>
            <div className="flex flex-col gap-2">
              {result.action_plan.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs">
                  {item.time && (
                    <span className="inline-flex items-center gap-1 shrink-0 rounded-md bg-muted px-2 py-0.5 font-semibold text-muted-foreground border border-border text-[11px]">
                      <Clock className="h-3 w-3" /> {item.time}
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
      <div className="rounded-2xl border border-border bg-card p-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
          Have Follow-Up Questions?
        </h4>
        <p className="text-xs text-muted-foreground mb-3 font-medium">
          Ask BrainMate anything or tap a question below:
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
              className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground/90 transition-all hover:bg-muted hover:border-border/80"
            >
              <span>{promptText}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
