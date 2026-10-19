import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DifficultyLevel, MathProblem } from '../types/math';
import { generateMathProblem } from '../utils/mathGenerator';
import { ProblemCard } from './ProblemCard';
import { Numpad } from './Numpad';
import { ThreeDigits, getDigitsNumericValue } from './ThreeDigitInput';
import { sound } from '../utils/sound';
import {
  addGameRecord,
  recordProblemAnswer,
  addWrongNote,
  getStoredStats,
  saveStoredStats,
  unlockBadge,
} from '../utils/storage';
import { Swords, Check, X, RotateCcw, Play, Clock } from 'lucide-react';

interface Sprint10ModeProps {
  difficulty: DifficultyLevel;
  onOpenWrongNotes: () => void;
  onDifficultyChange: () => void;
}

interface QuestionAnswerResult {
  problem: MathProblem;
  userAnswer: number;
  isCorrect: boolean;
  timeSpentMs: number;
}

export const Sprint10Mode: React.FC<Sprint10ModeProps> = ({
  difficulty,
  onOpenWrongNotes,
  onDifficultyChange,
}) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [questions, setQuestions] = useState<MathProblem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [results, setResults] = useState<QuestionAnswerResult[]>([]);
  const [digits, setDigits] = useState<ThreeDigits>(['', '', '']);
  const [activeBox, setActiveBox] = useState<number>(2); // Default to ones (일의 자리)
  const [isCorrectFeedback, setIsCorrectFeedback] = useState<boolean | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number>(0);

  const startTimeRef = useRef<number>(0);
  const questionStartTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const bestSprint = getStoredStats().bestSprintTimeMs || 0;

  const startSprint = () => {
    sound.playClick();
    // Pre-generate 10 problems
    const generated: MathProblem[] = [];
    for (let i = 0; i < 10; i++) {
      generated.push(generateMathProblem(difficulty));
    }
    setQuestions(generated);
    setCurrentIndex(0);
    setResults([]);
    setDigits(['', '', '']);
    setActiveBox(2);
    setIsCorrectFeedback(null);
    setElapsedMs(0);

    const now = Date.now();
    startTimeRef.current = now;
    questionStartTimeRef.current = now;
    setGameState('playing');
  };

  // Stopwatch timer loop
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTimeRef.current);
      }, 50);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const endSprint = useCallback((finalResults: QuestionAnswerResult[], totalTimeMs: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('ended');
    sound.playFanfare();

    const correctCount = finalResults.filter((r) => r.isCorrect).length;
    const stats = getStoredStats();

    // Check best sprint time if all 10 correct
    if (correctCount === 10) {
      unlockBadge('sprint_perfect');
      if (totalTimeMs <= 30000) {
        unlockBadge('sprint_fast');
      }
      if (stats.bestSprintTimeMs === 0 || totalTimeMs < stats.bestSprintTimeMs) {
        stats.bestSprintTimeMs = totalTimeMs;
        saveStoredStats(stats);
      }
    }

    // Save game record
    addGameRecord({
      mode: 'sprint_10',
      totalQuestions: 10,
      correctCount,
      durationSeconds: Math.round(totalTimeMs / 1000),
      difficulty,
      score: correctCount * 10,
    });
  }, [difficulty]);

  const handleSubmit = useCallback(() => {
    if (gameState !== 'playing') return;
    const currentProblem = questions[currentIndex];
    const numVal = getDigitsNumericValue(digits);
    if (numVal === null) return;

    const correct = numVal === currentProblem.sum;
    const now = Date.now();
    const timeSpent = now - questionStartTimeRef.current;

    if (correct) {
      sound.playCorrect();
      setIsCorrectFeedback(true);
      recordProblemAnswer(difficulty, true, timeSpent, 1);
    } else {
      sound.playWrong();
      setIsCorrectFeedback(false);
      recordProblemAnswer(difficulty, false, timeSpent, 0);
      addWrongNote(currentProblem, numVal);
    }

    const updatedResult: QuestionAnswerResult = {
      problem: currentProblem,
      userAnswer: numVal,
      isCorrect: correct,
      timeSpentMs: timeSpent,
    };
    const nextResults = [...results, updatedResult];
    setResults(nextResults);

    // Next question or end game
    setTimeout(() => {
      if (currentIndex + 1 < 10) {
        setCurrentIndex((prev) => prev + 1);
        setDigits(['', '', '']);
        setActiveBox(2);
        setIsCorrectFeedback(null);
        questionStartTimeRef.current = Date.now();
      } else {
        const totalDuration = Date.now() - startTimeRef.current;
        endSprint(nextResults, totalDuration);
      }
    }, 200);
  }, [gameState, digits, questions, currentIndex, results, difficulty, endSprint]);

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key >= '0' && e.key <= '9') {
        sound.playClick();
        setDigits((prev) => {
          const next: ThreeDigits = [...prev];
          next[activeBox] = e.key;
          return next;
        });
      } else if (e.key === 'Backspace') {
        sound.playClick();
        setDigits((prev) => {
          const next: ThreeDigits = [...prev];
          next[activeBox] = '';
          return next;
        });
      } else if (e.key === 'Enter') {
        handleSubmit();
      } else if (e.key === 'Escape') {
        setDigits(['', '', '']);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, activeBox, handleSubmit]);

  const handleNumpadNumber = (digit: string) => {
    setDigits((prev) => {
      const next: ThreeDigits = [...prev];
      next[activeBox] = digit;
      return next;
    });
  };
  const handleNumpadDelete = () => {
    setDigits((prev) => {
      const next: ThreeDigits = [...prev];
      next[activeBox] = '';
      return next;
    });
  };
  const handleNumpadClear = () => {
    setDigits(['', '', '']);
  };

  const getRank = (correctCount: number, timeMs: number) => {
    if (correctCount === 10 && timeMs <= 35000) return { grade: 'S', color: 'text-amber-500', desc: '초고속 연산 마스터!' };
    if (correctCount >= 9) return { grade: 'A', color: 'text-indigo-600', desc: '대단한 실력입니다!' };
    if (correctCount >= 7) return { grade: 'B', color: 'text-emerald-600', desc: '기본기가 탄탄합니다!' };
    if (correctCount >= 5) return { grade: 'C', color: 'text-orange-500', desc: '조금 더 연습해볼까요?' };
    return { grade: 'D', color: 'text-rose-500', desc: '오답노트 복습을 추천해요!' };
  };

  const totalCorrect = results.filter((r) => r.isCorrect).length;
  const currentProb = questions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4">
      {/* Ready / Start Screen */}
      {gameState === 'idle' && (
        <div className="max-w-xl mx-auto text-center bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 sm:p-12">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 border border-indigo-200">
            <Swords className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            10문제 쾌속 승부
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
            딱 10문제를 집중하여 가장 빠른 시간 내에 정확하게 풀어보세요! 스톱워치로 풀이 시간을 측정하고 등급을 판정합니다.
          </p>

          {/* Best record */}
          {bestSprint > 0 && (
            <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 inline-flex items-center gap-3">
              <Clock className="w-5 h-5 text-indigo-500" />
              <div className="text-left text-xs">
                <span className="text-slate-500 block">내 100점 만점 최단 기록</span>
                <span className="text-lg font-extrabold text-slate-900 tabular-nums">
                  {(bestSprint / 1000).toFixed(2)}초
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={startSprint}
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-base rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>10문제 승부 시작!</span>
            </button>
            <button
              type="button"
              onClick={onDifficultyChange}
              className="w-full sm:w-auto px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
            >
              난이도 설정
            </button>
          </div>
        </div>
      )}

      {/* Playing Screen */}
      {gameState === 'playing' && currentProb && (
        <div>
          {/* Progress Header & Stopwatch */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">진행도:</span>
                <span className="font-mono text-base font-bold text-indigo-600">
                  {currentIndex + 1} / 10번
                </span>
              </div>

              {/* Stopwatch */}
              <div className="flex items-center gap-1.5 font-mono text-xl font-extrabold text-slate-800 tabular-nums">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{(elapsedMs / 1000).toFixed(2)}s</span>
              </div>
            </div>

            {/* 10 Problem Progress Dots */}
            <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
              {Array.from({ length: 10 }).map((_, idx) => {
                const res = results[idx];
                const isCurrent = idx === currentIndex;
                return (
                  <div
                    key={idx}
                    className={`h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                      res
                        ? res.isCorrect
                          ? 'bg-emerald-500 text-white'
                          : 'bg-rose-500 text-white'
                        : isCurrent
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-300 ring-offset-1 animate-pulse'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {res ? (
                      res.isCorrect ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <X className="w-3.5 h-3.5 stroke-[3]" />
                      )
                    ) : (
                      idx + 1
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Problem & Numpad Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 flex flex-col items-center">
              <ProblemCard
                problem={currentProb}
                digits={digits}
                onDigitsChange={setDigits}
                activeBox={activeBox}
                onActiveBoxChange={setActiveBox}
                isCorrect={isCorrectFeedback}
                layout="vertical"
                showCarryGuide={false}
                onSubmit={handleSubmit}
              />
            </div>

            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-xs bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
                <Numpad
                  onNumber={handleNumpadNumber}
                  onDelete={handleNumpadDelete}
                  onClear={handleNumpadClear}
                  onSubmit={handleSubmit}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Finished Screen */}
      {gameState === 'ended' && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 text-center animate-fadeIn">
          {(() => {
            const rank = getRank(totalCorrect, elapsedMs);
            return (
              <>
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-3">
                  <span className={`text-4xl font-black ${rank.color}`}>{rank.grade}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  10문제 승부 완료!
                </h2>
                <p className="text-xs font-semibold text-slate-500 mt-1">{rank.desc}</p>

                {/* KPI Metrics */}
                <div className="grid grid-cols-3 gap-3 my-6 text-left">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-400 block">총 걸린 시간</span>
                    <span className="text-lg font-black text-slate-900 tabular-nums">
                      {(elapsedMs / 1000).toFixed(2)}초
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-400 block">맞힌 문제 수</span>
                    <span className="text-lg font-black text-indigo-600 tabular-nums">
                      {totalCorrect} / 10개
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-400 block">문제당 평균 속도</span>
                    <span className="text-lg font-black text-slate-900 tabular-nums">
                      {(elapsedMs / 10000).toFixed(1)}초
                    </span>
                  </div>
                </div>

                {/* Problem by Problem Review */}
                <div className="mb-6 text-left">
                  <h3 className="text-xs font-bold text-slate-700 mb-2">10문제 결과 세부 내역</h3>
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {results.map((res, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                          res.isCorrect
                            ? 'bg-emerald-50/40 border-emerald-200/60 text-slate-800'
                            : 'bg-rose-50/50 border-rose-200/80 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                              res.isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="font-mono font-semibold">
                            {res.problem.num1} + {res.problem.num2} = {res.problem.sum}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 tabular-nums">
                            {(res.timeSpentMs / 1000).toFixed(1)}초
                          </span>
                          {!res.isCorrect ? (
                            <span className="text-rose-600 font-bold">
                              내 답: {res.userAnswer}
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-bold">정답!</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={startSprint}
                    className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>다시 승부하기</span>
                  </button>

                  {results.some((r) => !r.isCorrect) && (
                    <button
                      type="button"
                      onClick={onOpenWrongNotes}
                      className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 rounded-xl transition-colors"
                    >
                      오답노트로 가기 →
                    </button>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};
