'use client';

import { useState } from 'react';
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
  Check,
  Layers,
  RotateCw,
  Flame,
  ThumbsUp,
  Brain,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { playClick, playPop, playFlip } from '@/lib/sound';

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
  onExportPdf,
  onAddXp
}) {
  const [flashcardMode, setFlashcardMode] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [reactions, setReactions] = useState({ mindBlown: 0, superClear: 0, needDetail: 0 });
  const [userReacted, setUserReacted] = useState({});

  if (!result) return null;

  const copySection = (title, content) => {
    playPop();
    navigator.clipboard.writeText(`${title}:\n${content}`);
    toast.success(`Copied ${title} to clipboard!`);
  };

  const handleReaction = (type) => {
    if (userReacted[type]) return;
    playPop();
    setUserReacted((prev) => ({ ...prev, [type]: true }));
    setReactions((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    toast.success('Thanks for your feedback! +10 XP ⚡');
    if (onAddXp) onAddXp(10);
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
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Header bar for explanation result */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 px-3 py-1 text-xs font-black text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 tracking-wide uppercase shadow-xs">
              {getModeLabel(result.mode)}
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              {result.topic}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-semibold">
            Explained in <span className="font-extrabold text-foreground">{result.language || 'English'}</span>
          </p>
        </div>

        {/* Action bar (Flashcard toggle, Share, Export, Quiz) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Flashcard Flip Mode Toggle */}
          <Button
            variant={flashcardMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              playFlip();
              setFlashcardMode(!flashcardMode);
              setFlipped(false);
            }}
            className={cn(
              'h-9 gap-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer',
              flashcardMode
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/25'
                : 'border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10'
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{flashcardMode ? 'Normal View' : '🎴 Flashcard Mode'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              playPop();
              onShare();
            }}
            className="h-9 gap-1.5 rounded-xl border-border/80 text-xs font-bold hover:bg-muted"
          >
            <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
            Share
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              playPop();
              onExportPdf();
            }}
            className="h-9 gap-1.5 rounded-xl border-border/80 text-xs font-bold hover:bg-muted"
          >
            <FileDown className="h-3.5 w-3.5 text-muted-foreground" />
            Export PDF
          </Button>

          <Button
            size="sm"
            onClick={() => {
              playClick();
              onStartQuiz();
            }}
            className="h-9 gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-extrabold shadow-md shadow-indigo-500/20 active:scale-95"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Test Memory (+50 XP)
          </Button>
        </div>
      </div>

      {/* FLASHCARD INTERACTIVE FLIP MODE */}
      {flashcardMode ? (
        <div className="perspective-1000 my-4">
          <div
            onClick={() => {
              playFlip();
              setFlipped(!flipped);
            }}
            className={cn(
              'relative min-h-[260px] w-full rounded-3xl border-2 border-indigo-500/40 bg-gradient-to-br from-indigo-500/15 via-card to-purple-500/15 p-8 text-center flex flex-col items-center justify-center cursor-pointer shadow-2xl transition-all duration-500 transform-style-3d hover:scale-[1.01]',
              flipped ? 'rotate-y-180 bg-gradient-to-br from-purple-500/20 via-card to-pink-500/20' : ''
            )}
          >
            {!flipped ? (
              <div className="space-y-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-extrabold text-purple-600 dark:text-purple-300">
                  <Brain className="h-4 w-4" /> Flashcard Front
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-foreground max-w-md mx-auto">
                  What is {result.topic}?
                </h3>
                <p className="text-xs text-muted-foreground font-semibold flex items-center justify-center gap-1.5 pt-4">
                  <RotateCw className="h-4 w-4 text-indigo-500 animate-spin-slow" /> Tap card to flip & reveal simple explanation
                </p>
              </div>
            ) : (
              <div className="space-y-4 [transform:rotateY(180deg)]">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-extrabold text-emerald-600 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" /> Explanation Answer
                </span>
                <p className="text-sm sm:text-base font-semibold leading-relaxed text-foreground max-w-lg mx-auto">
                  {result.simple_explanation}
                </p>
                <p className="text-xs text-muted-foreground font-medium pt-2">
                  Tap again to flip back
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* STANDARD VIBRANT CARDS VIEW */
        <div className="space-y-6">
          {/* 1. Simple Explanation Card */}
          {result.simple_explanation && (
            <div
              className={cn(
                'group relative rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 via-card to-card p-6 transition-all duration-200 shadow-md magnetic-card',
                activeSection === 'simple_explanation' && 'ring-2 ring-indigo-500 border-indigo-500'
              )}
            >
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold shadow-md shadow-indigo-500/25">
                    <BookOpen className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-foreground">
                    The Core Idea
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      playClick();
                      speakingWhat === 'simple_explanation'
                        ? onStopSpeak()
                        : onSpeak(result.simple_explanation, 'simple_explanation');
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline transition-colors cursor-pointer"
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
                    className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </button>
                </div>
              </div>
              <p className="text-sm sm:text-base leading-relaxed text-foreground/90 font-medium">
                {result.simple_explanation}
              </p>
            </div>
          )}

          {/* 2. Real-Life Analogy Card */}
          {result.real_life_analogy && (
            <div
              className={cn(
                'group relative rounded-3xl border border-pink-500/30 bg-gradient-to-br from-pink-500/5 via-card to-card p-6 transition-all duration-200 shadow-md magnetic-card',
                activeSection === 'real_life_analogy' && 'ring-2 ring-pink-500 border-pink-500'
              )}
            >
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white font-extrabold shadow-md shadow-pink-500/25">
                    <Sparkles className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-foreground">
                    Real-World Analogy
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      playClick();
                      speakingWhat === 'real_life_analogy'
                        ? onStopSpeak()
                        : onSpeak(result.real_life_analogy, 'real_life_analogy');
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-pink-600 dark:text-pink-400 hover:underline transition-colors cursor-pointer"
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
                    className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </button>
                </div>
              </div>
              <p className="text-sm sm:text-base leading-relaxed text-foreground/90 italic bg-pink-500/5 rounded-2xl p-4 border border-pink-500/20 font-medium">
                "{result.real_life_analogy}"
              </p>
            </div>
          )}

          {/* 3. Step-by-Step Breakdown Card */}
          {Array.isArray(result.step_by_step) && result.step_by_step.length > 0 && (
            <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-card to-card p-6 shadow-md magnetic-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-extrabold shadow-md shadow-emerald-500/25">
                    <CheckCircle2 className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-foreground">
                    How It Works (Step-by-Step)
                  </h3>
                </div>
                <button
                  onClick={() => copySection('Step-by-Step Breakdown', result.step_by_step.join('\n'))}
                  className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
              </div>
              <ul className="flex flex-col gap-3">
                {result.step_by_step.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 rounded-2xl bg-muted/40 p-4 border border-border/50 text-xs sm:text-sm font-medium">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[11px] font-black shadow-xs">
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
              <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Quick Summary
                  </h4>
                  <button
                    onClick={() => copySection('Summary', result.summary)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-foreground/90 font-semibold leading-relaxed">
                  {result.summary}
                </p>
              </div>
            )}

            {Array.isArray(result.action_plan) && result.action_plan.length > 0 && (
              <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3">
                  3-Step Action Plan
                </h4>
                <div className="flex flex-col gap-2.5">
                  {result.action_plan.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs leading-relaxed">
                      {item.time && (
                        <span className="inline-flex items-center gap-1 shrink-0 rounded-lg bg-indigo-500/10 px-2 py-0.5 font-extrabold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[11px]">
                          <Clock className="h-3 w-3" /> {item.time}
                        </span>
                      )}
                      <span className="text-foreground/90 font-semibold flex-1 leading-normal">{item.step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Reaction & Feedback Buttons */}
      <div className="rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            Was this clear? Share feedback (+10 XP ⚡)
          </h4>
          <p className="text-xs text-muted-foreground font-semibold">
            Tap a reaction to boost your learning rewards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleReaction('mindBlown')}
            className={cn(
              'flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-xs font-extrabold transition-all active:scale-95 cursor-pointer',
              userReacted.mindBlown
                ? 'bg-purple-500/20 border-purple-500 text-purple-600 dark:text-purple-300'
                : 'border-border bg-muted/30 hover:bg-muted text-muted-foreground'
            )}
          >
            <span>🤯 Mind Blown</span>
            <span className="text-[10px] opacity-75">{reactions.mindBlown}</span>
          </button>

          <button
            onClick={() => handleReaction('superClear')}
            className={cn(
              'flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-xs font-extrabold transition-all active:scale-95 cursor-pointer',
              userReacted.superClear
                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-600 dark:text-indigo-300'
                : 'border-border bg-muted/30 hover:bg-muted text-muted-foreground'
            )}
          >
            <span>💡 Super Clear</span>
            <span className="text-[10px] opacity-75">{reactions.superClear}</span>
          </button>
        </div>
      </div>

      {/* Follow-up Prompts Section */}
      <div className="rounded-3xl border border-border/80 bg-card p-5">
        <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-1.5">
          Have Follow-Up Questions?
        </h4>
        <p className="text-xs text-muted-foreground mb-3 font-semibold">
          Ask BrainMate anything or tap a prompt below:
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            `Why is ${result.topic} important in real life?`,
            `What is a common mistake people make about ${result.topic}?`,
            `Give me another practical example of ${result.topic}`
          ].map((promptText, i) => (
            <button
              key={i}
              onClick={() => {
                playClick();
                onAskFollowup(promptText);
              }}
              className="flex items-center gap-2 rounded-2xl border border-border/80 bg-muted/30 px-3.5 py-2 text-xs font-bold text-foreground/90 transition-all hover:bg-muted hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 active:scale-95 cursor-pointer"
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

