'use client';

import { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Trophy, ArrowRight, X, Loader2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
              <HelpCircle className="h-4.5 w-4.5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-foreground">Pop Quiz</h3>
              <p className="text-xs text-muted-foreground font-medium line-clamp-1">{topic}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <Loader2 className="h-7 w-7 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="text-sm font-bold text-foreground">Preparing Quiz Questions...</p>
            <p className="text-xs text-muted-foreground">Creating 4 quick questions for {topic}</p>
          </div>
        ) : showResults ? (
          /* Results Screen */
          <div className="flex flex-col items-center text-center py-2 gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <Trophy className="h-7 w-7" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-foreground">Quiz Complete!</h4>
              <p className="text-xs text-muted-foreground mt-1">
                You scored <span className="font-bold text-foreground text-sm">{calculateScore()}</span> out of{' '}
                <span className="font-bold text-sm">{questions.length}</span>
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
                      'rounded-xl border p-3.5 flex flex-col gap-1.5',
                      isCorrect ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'
                    )}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span>Q{idx + 1}: {q.question}</span>
                      {isCorrect ? (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Correct
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                          <XCircle className="h-3.5 w-3.5" /> Answer: {q.answer}
                        </span>
                      )}
                    </div>
                    {q.explain && <p className="text-muted-foreground leading-relaxed">{q.explain}</p>}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 w-full pt-2">
              <Button variant="outline" onClick={handleReset} className="flex-1 rounded-xl font-semibold text-xs border-border">
                Retake Quiz
              </Button>
              <Button onClick={onClose} className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs">
                Done
              </Button>
            </div>
          </div>
        ) : currentQ ? (
          /* Question Screen */
          <div className="flex flex-col gap-4">
            {/* Progress Bar */}
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Question {currentIdx + 1} of {questions.length}</span>
              <span>{Math.round(((currentIdx + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-200"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question Title */}
            <h4 className="text-sm sm:text-base font-bold text-foreground pt-1">
              {currentQ.question}
            </h4>

            {/* Multiple Choice Options */}
            <div className="flex flex-col gap-2">
              {['A', 'B', 'C', 'D'].map((letter) => {
                const optObj = currentQ.options?.find((o) => o.letter === letter) || currentQ.options?.[letter];
                const optText = typeof optObj === 'string' ? optObj : optObj?.text;
                if (!optText) return null;
                const isSelected = selectedAnswers[currentIdx] === letter;

                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => handleSelectOption(letter)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border p-3 text-left text-xs sm:text-sm font-medium transition-all shadow-2xs',
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 text-foreground font-semibold ring-1 ring-indigo-500/20'
                        : 'border-border bg-card hover:bg-muted/50'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-bold text-xs',
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-muted text-muted-foreground'
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
              <div className="rounded-xl border border-border bg-muted/20 p-3 text-xs text-muted-foreground animate-in fade-in duration-150">
                <span className="font-semibold text-foreground">Explanation: </span>
                {currentQ.explain}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                {selectedAnswers[currentIdx] ? 'Answer selected' : 'Choose an answer'}
              </span>

              <Button
                onClick={handleNext}
                disabled={!selectedAnswers[currentIdx]}
                className="h-8.5 gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-40"
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
