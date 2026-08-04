'use client';

import { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Trophy, ArrowRight, X, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { notifyQuizComplete } from '@/lib/notifications';
import { playClick, playSuccess, playWrong, playPop } from '@/lib/sound';
import { triggerConfetti } from '@/lib/confetti';

export default function QuizModal({
  isOpen,
  onClose,
  quizData,
  loading,
  topic,
  onAddXp
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  if (!isOpen) return null;

  const questions = Array.isArray(quizData) ? quizData : [];
  const currentQ = questions[currentIdx];

  const handleSelectOption = (letter) => {
    if (selectedAnswers[currentIdx]) return;
    const isCorrect = letter === currentQ.answer;
    if (isCorrect) {
      playSuccess();
    } else {
      playWrong();
    }
    setSelectedAnswers((prev) => ({ ...prev, [currentIdx]: letter }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) score += 1;
    });
    return score;
  };

  const handleNext = () => {
    playClick();
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setShowResults(true);
      const finalScore = calculateScore();
      playSuccess();
      triggerConfetti(3000);
      notifyQuizComplete(finalScore, questions.length);
      if (onAddXp) onAddXp(50);
    }
  };

  const handleReset = () => {
    playPop();
    setCurrentIdx(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-3xl border border-indigo-500/30 bg-card p-6 shadow-2xl space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold">
              <HelpCircle className="h-4.5 w-4.5" />
            </span>
            <div>
              <h3 className="text-base font-black text-foreground">Pop Memory Quiz</h3>
              <p className="text-xs text-muted-foreground font-semibold line-clamp-1">{topic}</p>
            </div>
          </div>
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="text-sm font-black text-foreground">Preparing Quiz Questions...</p>
            <p className="text-xs text-muted-foreground font-semibold">Creating 4 quick questions for {topic}</p>
          </div>
        ) : showResults ? (
          /* Results Screen */
          <div className="flex flex-col items-center text-center py-2 gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/40 shadow-lg shadow-amber-500/20">
              <Trophy className="h-8 w-8 animate-bounce-subtle" />
            </div>
            <div>
              <h4 className="text-xl font-black text-foreground">Quiz Completed! +50 XP ⚡</h4>
              <p className="text-xs text-muted-foreground mt-1 font-semibold">
                You scored <span className="font-black text-indigo-600 dark:text-indigo-400 text-base">{calculateScore()}</span> out of{' '}
                <span className="font-black text-base">{questions.length}</span>
              </p>
            </div>

            <div className="w-full flex flex-col gap-2.5 my-1 text-left text-xs max-h-[230px] overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const userAns = selectedAnswers[idx];
                const isCorrect = userAns === q.answer;

                return (
                  <div
                    key={idx}
                    className={cn(
                      'rounded-2xl border p-3.5 flex flex-col gap-1.5 font-medium',
                      isCorrect ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-rose-500/30 bg-rose-500/10'
                    )}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>Q{idx + 1}: {q.question}</span>
                      {isCorrect ? (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold">
                          <CheckCircle2 className="h-4 w-4" /> Correct
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-extrabold">
                          <XCircle className="h-4 w-4" /> Answer: {q.answer}
                        </span>
                      )}
                    </div>
                    {q.explain && <p className="text-muted-foreground text-[11px] leading-relaxed">{q.explain}</p>}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 w-full pt-2">
              <Button variant="outline" onClick={handleReset} className="flex-1 rounded-xl font-extrabold text-xs border-border/80">
                Retake Quiz
              </Button>
              <Button onClick={onClose} className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/25">
                Done
              </Button>
            </div>
          </div>
        ) : currentQ ? (
          /* Question Screen */
          <div className="flex flex-col gap-4">
            {/* Progress Bar */}
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span>Question {currentIdx + 1} of {questions.length}</span>
              <span>{Math.round(((currentIdx + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 rounded-full"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question Title */}
            <h4 className="text-sm sm:text-base font-black text-foreground pt-1 leading-relaxed">
              {currentQ.question}
            </h4>

            {/* Multiple Choice Options */}
            <div className="flex flex-col gap-2.5">
              {['A', 'B', 'C', 'D'].map((letter) => {
                const optObj = currentQ.options?.find((o) => o.letter === letter) || currentQ.options?.[letter];
                const optText = typeof optObj === 'string' ? optObj : optObj?.text;
                if (!optText) return null;
                const isSelected = selectedAnswers[currentIdx] === letter;
                const isCorrect = letter === currentQ.answer;
                const hasAnswered = !!selectedAnswers[currentIdx];

                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => handleSelectOption(letter)}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border p-3.5 text-left text-xs sm:text-sm font-semibold transition-all shadow-xs active:scale-98 cursor-pointer min-h-[44px]',
                      isSelected
                        ? isCorrect
                          ? 'border-emerald-500 bg-emerald-500/15 text-foreground ring-2 ring-emerald-500/30'
                          : 'border-rose-500 bg-rose-500/15 text-foreground ring-2 ring-rose-500/30'
                        : 'border-border/80 bg-card hover:bg-muted/50'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-xl font-extrabold text-xs transition-all',
                        isSelected
                          ? isCorrect
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-600 text-white'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {letter}
                    </span>
                    <span className="flex-1 leading-snug">{optText}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation box after selection */}
            {selectedAnswers[currentIdx] && (
              <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-3.5 text-xs text-foreground font-medium animate-in fade-in duration-150">
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400">Explanation: </span>
                {currentQ.explain}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground font-semibold">
                {selectedAnswers[currentIdx] ? 'Answer recorded' : 'Select an answer above'}
              </span>

              <Button
                onClick={handleNext}
                disabled={!selectedAnswers[currentIdx]}
                className="h-9 gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md shadow-indigo-500/25 disabled:opacity-40"
              >
                <span>{currentIdx < questions.length - 1 ? 'Next Question' : 'View Results'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

