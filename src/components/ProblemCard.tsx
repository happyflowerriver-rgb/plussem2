import React, { useState } from 'react';
import { MathProblem, StepExplanation } from '../types/math';
import { getCarryingBreakdown } from '../utils/mathGenerator';
import { ThreeDigitInput, ThreeDigits } from './ThreeDigitInput';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface ProblemCardProps {
  problem: MathProblem;
  digits: ThreeDigits;
  onDigitsChange: (digits: ThreeDigits) => void;
  activeBox: number;
  onActiveBoxChange: (box: number) => void;
  isCorrect?: boolean | null;
  layout?: 'vertical' | 'horizontal';
  showCarryGuide?: boolean;
  onSubmit?: () => void;
  showStepByStep?: boolean;
}

export const ProblemCard: React.FC<ProblemCardProps> = ({
  problem,
  digits,
  onDigitsChange,
  activeBox,
  onActiveBoxChange,
  isCorrect = null,
  layout = 'vertical',
  showCarryGuide = false,
  showStepByStep = false,
  onSubmit,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const breakdown: StepExplanation = getCarryingBreakdown(problem.num1, problem.num2);

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 transition-all">
      {/* Problem Header Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-6">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="text-indigo-600 font-semibold">
            {problem.carriesOnes ? '일의 자리 받아올림' : '받아올림 없음'}
          </span>
          {problem.carriesTens && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-amber-600 font-semibold">합 100 이상</span>
            </>
          )}
        </div>

        {problem.hintTip && (
          <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium text-[11px]">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span>암산 비법 팁</span>
          </div>
        )}
      </div>

      {/* Main Calculation Display */}
      {layout === 'vertical' ? (
        <div className="flex flex-col items-center py-2">
          {/* Column labels (백, 십, 일) aligned with columns */}
          <div className="w-48 grid grid-cols-3 text-center text-xs font-semibold text-slate-400 mb-1 select-none">
            <span className={problem.carriesTens ? 'text-amber-500 font-bold' : 'text-slate-400'}>
              백
            </span>
            <span className="text-slate-500">십</span>
            <span className="text-slate-500">일</span>
          </div>

          {/* Carrying helper row */}
          {showCarryGuide && (
            <div className="w-48 grid grid-cols-3 text-center mb-1 h-6 items-center select-none">
              <div></div>
              <div className="flex justify-center">
                {breakdown.carriesOnes ? (
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200 animate-pulse">
                    1
                  </span>
                ) : (
                  <span className="w-5 h-5 opacity-0">0</span>
                )}
              </div>
              <div></div>
            </div>
          )}

          {/* Vertical numbers container */}
          <div className="w-48 font-mono text-4xl sm:text-5xl font-bold text-slate-800 tracking-wider">
            {/* First row */}
            <div className="grid grid-cols-3 text-right py-1 select-none">
              <span className="text-center font-normal text-slate-300"></span>
              <span className="pr-1">{Math.floor(problem.num1 / 10)}</span>
              <span className="pr-2">{problem.num1 % 10}</span>
            </div>

            {/* Second row with + sign */}
            <div className="grid grid-cols-3 text-right py-1 relative select-none">
              <span className="text-center font-bold text-indigo-600 text-3xl sm:text-4xl flex items-center justify-center">
                +
              </span>
              <span className="pr-1">{Math.floor(problem.num2 / 10)}</span>
              <span className="pr-2">{problem.num2 % 10}</span>
            </div>

            {/* Sum horizontal divider line */}
            <div className="w-full border-b-4 border-slate-800 my-2 rounded-full"></div>

            {/* Direct Input Field - Three Digit Boxes (백, 십, 일) */}
            <div className="py-1">
              <ThreeDigitInput
                digits={digits}
                onDigitsChange={onDigitsChange}
                activeBox={activeBox}
                onActiveBoxChange={onActiveBoxChange}
                onSubmit={() => onSubmit?.()}
                disabled={isCorrect === true}
                isCorrect={isCorrect}
                problemId={problem.id}
              />
            </div>
            <div className="text-center mt-1.5">
              <span className="text-[11px] text-slate-400 font-sans font-normal">
                각 자릿수 칸(백·십·일)을 클릭하여 입력
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Horizontal layout */
        <div className="flex flex-col items-center justify-center py-4">
          <div className="flex items-center justify-center gap-3 sm:gap-4 font-mono text-4xl sm:text-5xl font-bold text-slate-800">
            <span className="select-none">{problem.num1}</span>
            <span className="text-indigo-600 font-extrabold select-none">+</span>
            <span className="select-none">{problem.num2}</span>
            <span className="text-slate-400 select-none">=</span>

            {/* Three Digit Boxes */}
            <div className="w-48">
              <ThreeDigitInput
                digits={digits}
                onDigitsChange={onDigitsChange}
                activeBox={activeBox}
                onActiveBoxChange={onActiveBoxChange}
                onSubmit={() => onSubmit?.()}
                disabled={isCorrect === true}
                isCorrect={isCorrect}
                problemId={problem.id}
              />
            </div>
          </div>
          <div className="text-center mt-2">
            <span className="text-[11px] text-slate-400 font-sans font-normal">
              각 자릿수 칸(백·십·일)을 클릭하여 입력
            </span>
          </div>
        </div>
      )}

      {/* Decade mental trick banner if available */}
      {problem.hintTip && (
        <div className="mt-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-relaxed">
          <p className="font-semibold flex items-center gap-1.5 mb-0.5 text-amber-950">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            빠른 덧셈 비법:
          </p>
          <p>{problem.hintTip}</p>
        </div>
      )}

      {/* Step-by-step collapse trigger if allowed or on wrong answer */}
      {showStepByStep && (
        <div className="mt-5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors py-1"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              단계별 받아올림 원리 보기
            </span>
            {showExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showExplanation && (
            <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-2 text-slate-700 animate-fadeIn">
              {/* Step 1: Ones place */}
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <div>
                  <p className="font-semibold text-slate-900">
                    일의 자리 더하기: {breakdown.ones1} + {breakdown.ones2} = {breakdown.onesSum}
                  </p>
                  {breakdown.carriesOnes ? (
                    <p className="text-slate-600 mt-0.5">
                      합이 10 이상이므로, 일의 자리에 <strong className="text-indigo-600 font-bold">{breakdown.onesResult}</strong>을 적고 십의 자리로 <strong className="text-amber-600 font-bold">1을 받아올림</strong>합니다.
                    </p>
                  ) : (
                    <p className="text-slate-600 mt-0.5">
                      받아올림 없이 일의 자리에 <strong className="text-indigo-600 font-bold">{breakdown.onesResult}</strong>을 적습니다.
                    </p>
                  )}
                </div>
              </div>

              {/* Step 2: Tens place */}
              <div className="flex items-start gap-2 pt-1 border-t border-slate-200/60">
                <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <div>
                  <p className="font-semibold text-slate-900">
                    십의 자리 더하기:{' '}
                    {breakdown.tensCarry > 0 ? (
                      <span>
                        <span className="text-amber-600 font-bold">(올림 1)</span> + {breakdown.tens1} + {breakdown.tens2} = {breakdown.tensSum}
                      </span>
                    ) : (
                      <span>{breakdown.tens1} + {breakdown.tens2} = {breakdown.tensSum}</span>
                    )}
                  </p>
                  {breakdown.hundredsResult > 0 ? (
                    <p className="text-slate-600 mt-0.5">
                      합이 10 이상이므로 백의 자리에 <strong className="text-amber-600 font-bold">{breakdown.hundredsResult}</strong>, 십의 자리에 <strong className="text-indigo-600 font-bold">{breakdown.tensResult}</strong>을 적습니다.
                    </p>
                  ) : (
                    <p className="text-slate-600 mt-0.5">
                      십의 자리에 <strong className="text-indigo-600 font-bold">{breakdown.tensResult}</strong>을 적습니다.
                    </p>
                  )}
                </div>
              </div>

              {/* Final answer */}
              <div className="pt-1.5 flex items-center justify-end gap-1.5 font-bold text-slate-900 text-sm">
                <span>최종 정답:</span>
                <span className="text-indigo-600 font-mono text-base">{breakdown.finalSum}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
