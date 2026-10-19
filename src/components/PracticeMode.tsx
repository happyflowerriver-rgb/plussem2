import React, { useState, useEffect, useCallback } from 'react';
import { DifficultyLevel, MathProblem } from '../types/math';
import { generateMathProblem } from '../utils/mathGenerator';
import { ProblemCard } from './ProblemCard';
import { Numpad } from './Numpad';
import { Scratchpad } from './Scratchpad';
import { ThreeDigits, getDigitsNumericValue } from './ThreeDigitInput';
import { sound } from '../utils/sound';
import { recordProblemAnswer, addWrongNote } from '../utils/storage';
import { PenTool, CheckCircle2, AlertCircle, RotateCcw, Zap, LayoutList, Columns } from 'lucide-react';

interface PracticeModeProps {
  difficulty: DifficultyLevel;
  onOpenWrongNotes: () => void;
  onDifficultyChange: () => void;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({
  difficulty,
  onOpenWrongNotes,
  onDifficultyChange,
}) => {
  const [problem, setProblem] = useState<MathProblem>(() => generateMathProblem(difficulty));
  const [digits, setDigits] = useState<ThreeDigits>(['', '', '']);
  const [activeBox, setActiveBox] = useState<number>(2); // Default to ones (일의 자리)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [layout, setLayout] = useState<'vertical' | 'horizontal'>('vertical');
  const [showCarryGuide, setShowCarryGuide] = useState<boolean>(true);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState<boolean>(false);
  const [combo, setCombo] = useState<number>(0);
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [sessionCorrect, setSessionCorrect] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Generate new question when difficulty changes
  useEffect(() => {
    setProblem(generateMathProblem(difficulty));
    setDigits(['', '', '']);
    setActiveBox(2);
    setIsCorrect(null);
    setShowExplanation(false);
    setStartTime(Date.now());
  }, [difficulty]);

  const loadNextProblem = useCallback(() => {
    setProblem(generateMathProblem(difficulty));
    setDigits(['', '', '']);
    setActiveBox(2);
    setIsCorrect(null);
    setShowExplanation(false);
    setStartTime(Date.now());
  }, [difficulty]);

  const handleSubmit = useCallback(() => {
    const numVal = getDigitsNumericValue(digits);
    if (numVal === null) return;

    const correct = numVal === problem.sum;
    const timeSpent = Date.now() - startTime;

    setSessionCount((prev) => prev + 1);

    if (correct) {
      sound.playCorrect(combo);
      setIsCorrect(true);
      const newCombo = combo + 1;
      setCombo(newCombo);
      setSessionCorrect((prev) => prev + 1);
      recordProblemAnswer(difficulty, true, timeSpent, newCombo);

      // Auto advance after short celebration
      setTimeout(() => {
        loadNextProblem();
      }, 1100);
    } else {
      sound.playWrong();
      setIsCorrect(false);
      setCombo(0);
      setShowExplanation(true);
      recordProblemAnswer(difficulty, false, timeSpent, 0);
      addWrongNote(problem, numVal);
    }
  }, [digits, problem, startTime, combo, difficulty, loadNextProblem]);

  // Physical keyboard support for global keypresses
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is directly typing in an input element
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
  }, [activeBox, handleSubmit]);

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
    setIsCorrect(null);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4">
      {/* Session Progress Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>자유 연습하기</span>
            {combo >= 3 && (
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 animate-bounce">
                <Zap className="w-3.5 h-3.5 fill-amber-500" />
                {combo} 콤보 연속 정답!
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            내 속도에 맞춰 편안하게 두 자리 수 덧셈을 연습하고 원리를 마스터하세요.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
          <div className="text-right">
            <span className="block text-slate-400 text-[10px]">오늘 푼 문제</span>
            <span className="text-sm font-bold text-slate-800 tabular-nums">
              {sessionCount}문제 (정답률 {sessionCount > 0 ? Math.round((sessionCorrect / sessionCount) * 100) : 0}%)
            </span>
          </div>

          <button
            type="button"
            onClick={onDifficultyChange}
            className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
          >
            난이도 변경
          </button>
        </div>
      </div>

      {/* Toolbar: Layout switcher, Carry guide toggle, Scratchpad button */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
        {/* Layout selection */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setLayout('vertical')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors ${
              layout === 'vertical'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>세로셈</span>
          </button>
          <button
            type="button"
            onClick={() => setLayout('horizontal')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors ${
              layout === 'horizontal'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>가로셈</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Carry guide toggle */}
          <button
            type="button"
            onClick={() => setShowCarryGuide(!showCarryGuide)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
              showCarryGuide
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                showCarryGuide ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            />
            <span>받아올림 도우미: {showCarryGuide ? 'ON' : 'OFF'}</span>
          </button>

          {/* Scratchpad Toggle */}
          <button
            type="button"
            onClick={() => setIsScratchpadOpen(!isScratchpadOpen)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
              isScratchpadOpen
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>손글씨 메모장</span>
          </button>
        </div>
      </div>

      {/* Main Practice Area: 2-column or centered layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Problem Display */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <ProblemCard
            problem={problem}
            digits={digits}
            onDigitsChange={setDigits}
            activeBox={activeBox}
            onActiveBoxChange={setActiveBox}
            isCorrect={isCorrect}
            layout={layout}
            showCarryGuide={showCarryGuide}
            showStepByStep={showExplanation}
            onSubmit={handleSubmit}
          />

          {/* Answer status feedback message */}
          <div className="h-10 mt-3 flex items-center justify-center">
            {isCorrect === true && (
              <div className="flex items-center gap-2 text-emerald-700 text-sm font-bold animate-fadeIn">
                <CheckCircle2 className="w-5 h-5" />
                <span>정답입니다! 훌륭해요! 다음 문제로 넘어갑니다...</span>
              </div>
            )}
            {isCorrect === false && (
              <div className="flex items-center gap-2 text-rose-600 text-sm font-bold animate-shake">
                <AlertCircle className="w-5 h-5" />
                <span>아쉬워요! 틀린 문제가 오답노트에 자동으로 기록되었습니다.</span>
              </div>
            )}
          </div>

          {/* Action buttons on mistake */}
          {isCorrect === false && (
            <div className="flex items-center gap-3 mt-1">
              <button
                type="button"
                onClick={() => {
                  setDigits(['', '', '']);
                  setActiveBox(2);
                  setIsCorrect(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>다시 풀어보기</span>
              </button>
              <button
                type="button"
                onClick={loadNextProblem}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                다음 문제 도전
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Tactical Numpad */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-xs bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-3 px-1">
              <span>숫자 키패드 입력</span>
              <span className="text-[11px] text-slate-400">선택된 칸에 입력됨</span>
            </div>

            <Numpad
              onNumber={handleNumpadNumber}
              onDelete={handleNumpadDelete}
              onClear={handleNumpadClear}
              onSubmit={handleSubmit}
              disabled={isCorrect === true}
            />

            <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
              <button
                type="button"
                onClick={loadNextProblem}
                className="hover:text-indigo-600 transition-colors"
              >
                문제 건너뛰기 ↷
              </button>
              <button
                type="button"
                onClick={onOpenWrongNotes}
                className="text-indigo-600 font-semibold hover:underline"
              >
                오답노트 가기 →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Scratchpad */}
      <Scratchpad
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
      />
    </div>
  );
};
