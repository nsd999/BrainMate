'use client';

import { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Trophy, ArrowRight, X, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { notifyQuizComplete } from '@/lib/notifications';

export default function QuizModal({
  isOpen,
  onClose,
  quizData,
  loading,
  topic
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  if (!isOpen) return null;

  const questions = Array.isArray(quizData) ? quizData : [];
  const currentQ = questions[currentIdx];

  const handleSelectOption = (letter) => {
    if (selectedAnswers[currentIdx]) return;
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
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setShowResults(true);
      const finalScore = calculateScore();
      notifyQuizComplete(finalScore, questions.length);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-purple-200 dark:border-purple-900/60 bg-card p-6 shadow-2xl space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-purple-200/50 dark:border-purple-900/40 pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white font-bold shadow-md shadow-purple-500/20">
              <HelpCircle className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-foreground">BrainMate Pop Quiz</h3>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold line-clamp-1">{topic}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted-foreground hover:bg-purple-500/10 hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400" />
            <p className="text-sm font-bold text-foreground">Crafting Pop Quiz Questions...</p>
            <p className="text-xs text-muted-foreground">Tailoring questions specifically for {topic}</p>
          </div>
        ) : showResults ? (
          /* Results Screen */
          <div className="flex flex-col items-center text-center py-2 gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-yellow-500 text-white shadow-lg shadow-amber-500/30 animate-bounce">
              <Trophy className="h-9 w-9" />
            </div>
            <div>
              <h4 className="text-xl font-extrabold text-foreground">Quiz Complete!</h4>
              <p className="text-xs text-muted-foreground mt-1">
                You scored <span className="font-extrabold text-purple-600 dark:text-purple-400 text-sm">{calculateScore()}</span> out of{' '}
                <span className="font-extrabold text-sm">{questions.length}</span>
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
                      'rounded-2xl border p-3.5 flex flex-col gap-1.5',
                      isCorrect ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-rose-500/40 bg-rose-500/10'
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
                    {q.explain && <p className="text-muted-foreground leading-relaxed">{q.explain}</p>}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 w-full pt-2">
              <Button variant="outline" onClick={handleReset} className="flex-1 rounded-xl border-purple-200 dark:border-purple-900/60 font-bold text-xs">
                Retake Quiz
              </Button>
              <Button onClick={onClose} className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-purple-500/20">
                Done
              </Button>
            </div>
          </div>
        ) : currentQ ? (
          /* Question Screen */
          <div className="flex flex-col gap-4">
            {/* Progress Bar */}
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>Question {currentIdx + 1} of {questions.length}</span>
              <span className="text-purple-600 dark:text-purple-400">{Math.round(((currentIdx + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-purple-100 dark:bg-purple-950 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question Title */}
            <h4 className="text-sm sm:text-base font-extrabold text-foreground pt-1">
              {currentQ.question}
            </h4>

            {/* Multiple Choice Options */}
            <div className="flex flex-col gap-2.5">
              {['A', 'B', 'C', 'D'].map((letter) => {
                const optText = currentQ.options?.[letter];
                if (!optText) return null;
                const isSelected = selectedAnswers[currentIdx] === letter;

                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => handleSelectOption(letter)}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border p-3.5 text-left text-xs sm:text-sm font-medium transition-all shadow-xs hover:scale-[1.01]',
                      isSelected
                        ? 'border-purple-500 bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold ring-1 ring-purple-500/30'
                        : 'border-border/80 bg-card hover:bg-purple-500/5 hover:border-purple-300'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-xl font-extrabold text-xs',
                        isSelected
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xs'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                      )}
                    >
                      {letter}
                    </span>
                    <span className="flex-1">{optText}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation box after selection */}
            {selectedAnswers[currentIdx] && (
              <div className="rounded-2xl border border-purple-200/60 dark:border-purple-900/40 bg-purple-500/5 p-3.5 text-xs text-muted-foreground animate-in fade-in duration-200">
                <span className="font-bold text-foreground">Explanation: </span>
                {currentQ.explain}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                {selectedAnswers[currentIdx] ? 'Answer recorded!' : 'Select an option to proceed'}
              </span>

              <Button
                onClick={handleNext}
                disabled={!selectedAnswers[currentIdx]}
                className="h-9 gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 disabled:opacity-40"
              >
                <span>{currentIdx < questions.length - 1 ? 'Next Question' : 'View Results'}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
