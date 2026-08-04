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
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [qIndex]: 'A' }
  const [showResults, setShowResults] = useState(false);

  if (!isOpen) return null;

  const questions = Array.isArray(quizData) ? quizData : [];
  const currentQ = questions[currentIdx];

  const handleSelectOption = (letter) => {
    if (selectedAnswers[currentIdx]) return; // already answered this question
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <HelpCircle className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-foreground">Pop Quiz</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">{topic}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <p className="text-sm font-semibold text-foreground">Generating Quiz Questions...</p>
            <p className="text-xs text-muted-foreground">Tailoring questions to your explanation</p>
          </div>
        ) : showResults ? (
          /* Results Screen */
          <div className="flex flex-col items-center text-center py-6 gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20">
              <Trophy className="h-8 w-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-foreground">Quiz Complete!</h4>
              <p className="text-sm text-muted-foreground mt-1">
                You scored <span className="font-bold text-purple-600">{calculateScore()}</span> out of{' '}
                <span className="font-bold">{questions.length}</span>
              </p>
            </div>

            <div className="w-full flex flex-col gap-2 my-2 text-left text-xs">
              {questions.map((q, idx) => {
                const userAns = selectedAnswers[idx];
                const isCorrect = userAns === q.answer;

                return (
                  <div
                    key={idx}
                    className={cn(
                      'rounded-xl border p-3 flex flex-col gap-1',
                      isCorrect ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'
                    )}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span>Q{idx + 1}: {q.question}</span>
                      {isCorrect ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-bold">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Correct
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-600 font-bold">
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
              <Button onClick={onClose} className="flex-1 rounded-xl bg-purple-600 text-white">
                Done
              </Button>
            </div>
          </div>
        ) : currentQ ? (
          /* Question Screen */
          <div className="flex flex-col gap-4">
            {/* Progress Bar */}
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Question {currentIdx + 1} of {questions.length}</span>
              <span>{Math.round(((currentIdx + 1) / questions.length) * 100)}% Completed</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question Title */}
            <h4 className="text-base font-semibold text-foreground pt-2">
              {currentQ.question}
            </h4>

            {/* Options List */}
            <div className="flex flex-col gap-2.5 my-2">
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
                      'flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition-all',
                      !hasAnswered && 'hover:border-purple-500/50 hover:bg-muted/50',
                      hasAnswered && isCorrectOpt && 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold',
                      hasAnswered && isSelected && !isCorrectOpt && 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300',
                      !hasAnswered && isSelected && 'border-purple-600 bg-purple-500/10'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-xs font-bold',
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
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 text-xs text-foreground/90 animate-in fade-in">
                <span className="font-semibold text-purple-600">Explanation: </span>
                {currentQ.explain}
              </div>
            )}

            {/* Next Button */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleNext}
                disabled={!selectedAnswers[currentIdx]}
                className="gap-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
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
