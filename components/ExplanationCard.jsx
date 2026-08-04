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
  BookOpen
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

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Header bar for explanation result */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
              {result.mode?.toUpperCase()} MODE
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {result.topic}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Explained in {result.language || 'English'}
          </p>
        </div>

        {/* Action bar (Share, Export, Quiz) */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            className="h-8 gap-1.5 rounded-lg text-xs"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onExportPdf}
            className="h-8 gap-1.5 rounded-lg text-xs"
          >
            <FileDown className="h-3.5 w-3.5" />
            Export PDF
          </Button>

          <Button
            size="sm"
            onClick={onStartQuiz}
            className="h-8 gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-xs font-semibold text-white shadow-sm hover:opacity-95"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Take Pop Quiz
          </Button>
        </div>
      </div>

      {/* 1. Simple Explanation Card */}
      {result.simple_explanation && (
        <div
          className={cn(
            'group relative rounded-2xl border p-5 sm:p-6 transition-all duration-200',
            activeSection === 'simple_explanation'
              ? 'border-purple-500/60 bg-purple-500/5 ring-1 ring-purple-500/30'
              : 'border-border/60 bg-card shadow-sm hover:border-border'
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <BookOpen className="h-4 w-4" />
              </span>
              <h3 className="text-sm font-bold tracking-tight text-foreground">
                Simple Explanation
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  speakingWhat === 'simple_explanation'
                    ? onStopSpeak()
                    : onSpeak(result.simple_explanation, 'simple_explanation')
                }
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {speakingWhat === 'simple_explanation' ? (
                  <>
                    <VolumeX className="h-3.5 w-3.5 text-purple-600" /> Stop
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5" /> Listen
                  </>
                )}
              </button>
              <button
                onClick={() => copySection('Simple Explanation', result.simple_explanation)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
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
            'group relative rounded-2xl border p-5 sm:p-6 transition-all duration-200',
            activeSection === 'real_life_analogy'
              ? 'border-purple-500/60 bg-purple-500/5 ring-1 ring-purple-500/30'
              : 'border-border/60 bg-card shadow-sm hover:border-border'
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Sparkles className="h-4 w-4" />
              </span>
              <h3 className="text-sm font-bold tracking-tight text-foreground">
                Real-Life Analogy
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  speakingWhat === 'real_life_analogy'
                    ? onStopSpeak()
                    : onSpeak(result.real_life_analogy, 'real_life_analogy')
                }
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {speakingWhat === 'real_life_analogy' ? (
                  <>
                    <VolumeX className="h-3.5 w-3.5 text-purple-600" /> Stop
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5" /> Listen
                  </>
                )}
              </button>
              <button
                onClick={() => copySection('Real-Life Analogy', result.real_life_analogy)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </button>
            </div>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-foreground/90 italic bg-amber-500/5 rounded-xl p-4 border border-amber-500/10">
            "{result.real_life_analogy}"
          </p>
        </div>
      )}

      {/* 3. Step-by-Step Breakdown Card */}
      {Array.isArray(result.step_by_step) && result.step_by_step.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <h3 className="text-sm font-bold tracking-tight text-foreground">
                Step-by-Step Breakdown
              </h3>
            </div>
            <button
              onClick={() => copySection('Step-by-Step', result.step_by_step.join('\n'))}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          </div>
          <ul className="flex flex-col gap-3">
            {result.step_by_step.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3 rounded-xl bg-muted/30 p-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {idx + 1}
                </span>
                <span className="text-foreground/90 pt-0.5 leading-relaxed">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. Summary & Action Plan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {result.summary && (
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                TL;DR Summary
              </h4>
              <button
                onClick={() => copySection('Summary', result.summary)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-sm text-foreground/90 font-medium leading-relaxed">
              {result.summary}
            </p>
          </div>
        )}

        {Array.isArray(result.action_plan) && result.action_plan.length > 0 && (
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-3">
              Actionable Plan
            </h4>
            <div className="flex flex-col gap-2">
              {result.action_plan.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  {item.time && (
                    <span className="inline-flex items-center gap-1 shrink-0 rounded-md bg-purple-500/10 px-2 py-0.5 font-semibold text-purple-600 dark:text-purple-400">
                      <Clock className="h-3 w-3" /> {item.time}
                    </span>
                  )}
                  <span className="text-foreground/90 truncate">{item.step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Follow-up Prompts Section */}
      <div className="rounded-2xl border border-border/50 bg-purple-500/5 p-4 sm:p-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-3">
          Have Follow-Up Questions?
        </h4>
        <p className="text-xs text-muted-foreground mb-3">
          Ask BrainMate anything else or pick a quick question to continue learning:
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            `Why is ${result.topic} important in real life?`,
            `What is a common mistake people make about ${result.topic}?`,
            `Give me another example of ${result.topic}`
          ].map((promptText, i) => (
            <button
              key={i}
              onClick={() => onAskFollowup(promptText)}
              className="flex items-center gap-1.5 rounded-xl border border-purple-500/20 bg-background px-3 py-1.5 text-xs text-foreground/90 transition-all hover:border-purple-500/50 hover:bg-purple-500/10"
            >
              <span>{promptText}</span>
              <ArrowRight className="h-3 w-3 text-purple-500" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
