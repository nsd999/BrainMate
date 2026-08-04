'use client';

import { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Trophy, ArrowRight, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3.5 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-foreground border border-border">
              <HelpCircle className="h-4.5 w-4.5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-foreground">Pop Quiz</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">{topic}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <Loader2 className="h-7 w-7 animate-spin text-foreground" />
            <p className="text-sm font-semibold text-foreground">Generating Quiz Questions...</p>
            <p className="text-xs text-muted-foreground">Tailoring questions to your explanation</p>
          </div>
        ) : showResults ? (
          /* Results Screen */
          <div className="flex flex-col items-center text-center py-4 gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted border border-border text-foreground shadow-sm">
              <Trophy className="h-7 w-7 text-amber-500" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-foreground">Quiz Complete!</h4>
              <p className="text-xs text-muted-foreground mt-1">
                You scored <span className="font-bold text-foreground">{calculateScore()}</span> out of{' '}
                <span className="font-bold">{questions.length}</span>
              </p>
            </div>

            <div className="w-full flex flex-col gap-2 my-2 text-left text-xs max-h-[220px] overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const userAns = selectedAnswers[idx];
                const isCorrect = userAns === q.answer;

                return (
                  <div
                    key={idx}
                    className={cn(
                      'rounded-xl border p-3 flex flex-col gap-1',
                      isCorrect ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-rose-500/40 bg-rose-500/5'
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
                    {q.explain && <p className="text-muted-foreground">{q.explain}</p>}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 w-full pt-2">
              <Button variant="outline" onClick={handleReset} className="flex-1 rounded-xl">
                Retake Quiz
              </Button>
              <Button onClick={onClose} className="flex-1 rounded-xl bg-foreground text-background">
                Done
              </Button>
            </div>
          </div>
        ) : currentQ ? (
          /* Question Screen */
          <div className="flex flex-col gap-4">
            {/* Progress Bar */}
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-0.5">
              <span>Question {currentIdx + 1} of {questions.length}</span>
              <span>{Math.round(((currentIdx + 1) / questions.length) * 100)}% Completed</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-foreground transition-all duration-200"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question Title */}
            <h4 className="text-sm sm:text-base font-semibold text-foreground pt-1">
              {currentQ.question}
            </h4>

            {/* Options List */}
            <div className="flex flex-col gap-2 my-1">
              {currentQ.options?.map((opt) => {
                const isSelected = selectedAnswers[currentIdx] === opt.letter;
                const hasAnswered = !!selectedAnswers[currentIdx];
                const isCorrectOpt = opt.letter === currentQ.answer;

                return (
                  <button
                    key={opt.letter}
                    onClick={() => handleSelectOption(opt.letter)}
                    disabled={hasAnswered}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border p-3 text-left text-xs sm:text-sm transition-all',
                      !hasAnswered && 'hover:border-foreground/50 hover:bg-muted/40',
                      hasAnswered && isCorrectOpt && 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold',
                      hasAnswered && isSelected && !isCorrectOpt && 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400',
                      !hasAnswered && isSelected && 'border-foreground bg-muted'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-md border text-xs font-bold',
                        hasAnswered && isCorrectOpt
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : hasAnswered && isSelected && !isCorrectOpt
                          ? 'border-rose-500 bg-rose-500 text-white'
                          : 'border-border bg-muted'
                      )}
                    >
                      {opt.letter}
                    </span>
                    <span className="flex-1">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation box after answer */}
            {selectedAnswers[currentIdx] && currentQ.explain && (
              <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs text-foreground/90 animate-in fade-in">
                <span className="font-semibold text-foreground">Explanation: </span>
                {currentQ.explain}
              </div>
            )}

            {/* Next Button */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleNext}
                disabled={!selectedAnswers[currentIdx]}
                className="gap-2 rounded-xl bg-foreground text-background hover:opacity-90 disabled:opacity-50"
              >
                {currentIdx < questions.length - 1 ? 'Next Question' : 'View Results'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-muted-foreground">
            No quiz questions available.
          </div>
        )}
      </div>
    </div>
  );
}
