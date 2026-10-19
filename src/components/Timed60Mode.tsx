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
import { Timer, Zap, Trophy, RotateCcw, Play, CheckCircle2, XCircle, Award } from 'lucide-react';

interface Timed60ModeProps {
  difficulty: DifficultyLevel;
  onOpenWrongNotes: () => void;
  onDifficultyChange: () => void;
}

export const Timed60Mode: React.FC<Timed60ModeProps> = ({
  difficulty,
  onOpenWrongNotes,
  onDifficultyChange,
}) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [currentProblem, setCurrentProblem] = useState<MathProblem>(() => generateMathProblem(difficulty));
  const [digits, setDigits] = useState<ThreeDigits>(['', '', '']);
  const [activeBox, setActiveBox] = useState<number>(2); // Default to ones (일의 자리)
  const [isCorrectFeedback, setIsCorrectFeedback] = useState<boolean | null>(null);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);
  const [missedInGame, setMissedInGame] = useState<{ problem: MathProblem; userAnswer: number }[]>([]);

  const questionStartTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const bestScore = getStoredStats().bestTimedScore || 0;

  const startGame = () => {
    sound.playClick();
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setWrongCount(0);
    setTimeLeft(60);
    setIsNewHighScore(false);
    setMissedInGame([]);
    setDigits(['', '', '']);
    setActiveBox(2);
    setIsCorrectFeedback(null);
    setCurrentProblem(generateMathProblem(difficulty));
    questionStartTimeRef.current = Date.now();
    setGameState('playing');
  };

  const endGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('ended');
    sound.playFanfare();

    // Check high score
    const stats = getStoredStats();
    let newHigh = false;
    if (score > stats.bestTimedScore) {
      stats.bestTimedScore = score;
      saveStoredStats(stats);
      newHigh = true;
      setIsNewHighScore(true);
    }

    if (score >= 200) {
      unlockBadge('time_attack_20');
    }

    // Save game record
    addGameRecord({
      mode: 'timed_60',
      totalQuestions: correctCount + wrongCount,
      correctCount,
      durationSeconds: 60,
      difficulty,
      score,
      maxCombo,
    });
  }, [score, correctCount, wrongCount, difficulty, maxCombo]);

  // Timer loop
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          if (prev <= 5) {
            sound.playTick();
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, endGame]);

  const handleSubmit = useCallback(() => {
    if (gameState !== 'playing') return;
    const numVal = getDigitsNumericValue(digits);
    if (numVal === null) return;

    const correct = numVal === currentProblem.sum;
    const timeSpent = Date.now() - questionStartTimeRef.current;

    if (correct) {
      const nextCombo = combo + 1;
      sound.playCorrect(nextCombo);
      setIsCorrectFeedback(true);
      setCombo(nextCombo);
      setMaxCombo((prev) => Math.max(prev, nextCombo));
      setCorrectCount((prev) => prev + 1);
      // Base score 10 + combo bonus
      const points = 10 + nextCombo * 2;
      setScore((prev) => prev + points);
      recordProblemAnswer(difficulty, true, timeSpent, nextCombo);
    } else {
      sound.playWrong();
      setIsCorrectFeedback(false);
      setCombo(0);
      setWrongCount((prev) => prev + 1);
      recordProblemAnswer(difficulty, false, timeSpent, 0);
      addWrongNote(currentProblem, numVal);
      setMissedInGame((prev) => [...prev, { problem: currentProblem, userAnswer: numVal }]);
    }

    // Immediately load next question
    setTimeout(() => {
      setCurrentProblem(generateMathProblem(difficulty));
      setDigits(['', '', '']);
      setActiveBox(2);
      setIsCorrectFeedback(null);
      questionStartTimeRef.current = Date.now();
    }, 150);
  }, [gameState, digits, currentProblem, combo, difficulty]);

  // Keyboard handler
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

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4">
      {/* Ready / Start Screen */}
      {gameState === 'idle' && (
        <div className="max-w-xl mx-auto text-center bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 sm:p-12">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 border border-amber-200">
            <Timer className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            60초 스피드 덧셈 도전
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
            제한 시간 1분 동안 최대한 많은 두 자리 수 덧셈을 해결하세요! 연속 정답 시 콤보 가산점이 부여됩니다.
          </p>

          {/* High score box */}
          <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 inline-flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-500" />
            <div className="text-left text-xs">
              <span className="text-slate-500 block">내 최고 기록 점수</span>
              <span className="text-lg font-extrabold text-slate-900 tabular-nums">
                {bestScore > 0 ? `${bestScore}점` : '기록 없음'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={startGame}
              className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-base rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>도전 시작하기</span>
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
      {gameState === 'playing' && (
        <div>
          {/* HUD Status Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-semibold text-slate-500">남은 시간</span>
                <span
                  className={`font-mono text-2xl font-black tabular-nums ${
                    timeLeft <= 10 ? 'text-rose-600 animate-pulse' : 'text-slate-900'
                  }`}
                >
                  {timeLeft}초
                </span>
              </div>

              {/* Combo Banner */}
              <div className="flex items-center gap-4">
                {combo > 1 && (
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 animate-bounce">
                    <Zap className="w-4 h-4 fill-amber-500" />
                    <span>{combo} COMBO (+{combo * 2}점 보너스!)</span>
                  </div>
                )}

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">현재 점수</span>
                  <span className="font-mono text-2xl font-black text-indigo-600 tabular-nums">
                    {score}
                  </span>
                </div>
              </div>
            </div>

            {/* Time progress bar */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  timeLeft > 20 ? 'bg-amber-500' : timeLeft > 10 ? 'bg-orange-500' : 'bg-rose-500'
                }`}
                style={{ width: `${(timeLeft / 60) * 100}%` }}
              />
            </div>
          </div>

          {/* Question & Numpad Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 flex flex-col items-center">
              <ProblemCard
                problem={currentProblem}
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

      {/* Ended / Results Screen */}
      {gameState === 'ended' && (
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 text-center animate-fadeIn">
          {isNewHighScore ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs mb-3 border border-amber-300">
              <Award className="w-4 h-4" />
              <span>최고 기록 갱신!</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>도전 완료!</span>
            </div>
          )}

          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {score}점 획득!
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            60초 동안 최선을 다해 연산 승부를 펼쳤습니다.
          </p>

          {/* Stats Summary Grid */}
          <div className="grid grid-cols-3 gap-3 my-6 text-left">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] text-slate-400 block">정답 / 오답</span>
              <span className="text-base font-bold text-slate-900 tabular-nums">
                {correctCount}개 <span className="text-rose-500 font-normal text-xs">/ {wrongCount}개</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] text-slate-400 block">정답률</span>
              <span className="text-base font-bold text-slate-900 tabular-nums">
                {correctCount + wrongCount > 0
                  ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
                  : 0}
                %
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] text-slate-400 block">최대 콤보</span>
              <span className="text-base font-bold text-amber-600 tabular-nums">
                {maxCombo}연속
              </span>
            </div>
          </div>

          {/* Missed questions in this game */}
          {missedInGame.length > 0 && (
            <div className="mb-6 text-left p-4 rounded-xl bg-rose-50/60 border border-rose-200/80">
              <h3 className="text-xs font-bold text-rose-900 flex items-center gap-1.5 mb-2">
                <XCircle className="w-4 h-4 text-rose-500" />
                <span>틀린 문제 ({missedInGame.length}개) - 오답노트에 저장됨</span>
              </h3>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs">
                {missedInGame.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-rose-100 text-slate-700"
                  >
                    <span className="font-mono font-semibold">
                      {item.problem.num1} + {item.problem.num2}
                    </span>
                    <span className="text-slate-500">
                      내 답:{' '}
                      <strong className="text-rose-600 line-through mr-2">
                        {item.userAnswer}
                      </strong>
                      정답:{' '}
                      <strong className="text-emerald-600 font-bold">
                        {item.problem.sum}
                      </strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={startGame}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>다시 도전하기</span>
            </button>

            {missedInGame.length > 0 && (
              <button
                type="button"
                onClick={onOpenWrongNotes}
                className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 rounded-xl transition-colors"
              >
                오답노트 복습하기 →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
