import React from 'react';
import { DifficultyLevel } from '../types/math';
import { DIFFICULTY_CONFIGS } from '../utils/mathGenerator';
import { sound } from '../utils/sound';
import { Check, Sparkles, ArrowRight, ShieldCheck, Zap, BookOpen } from 'lucide-react';

interface DifficultyViewProps {
  currentDifficulty: DifficultyLevel;
  onSelectDifficulty: (level: DifficultyLevel) => void;
  onStartPractice: () => void;
}

export const DifficultyView: React.FC<DifficultyViewProps> = ({
  currentDifficulty,
  onSelectDifficulty,
  onStartPractice,
}) => {
  const levels: DifficultyLevel[] = ['easy', 'medium', 'hard', 'master', 'decade'];

  const handleSelect = (lvl: DifficultyLevel) => {
    sound.playClick();
    onSelectDifficulty(lvl);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>문제 난이도 선택</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            학습 단계에 맞는 난이도를 선택하면 연습하기, 60초 도전, 10문제 승부에 적용됩니다.
          </p>
        </div>

        <button
          type="button"
          onClick={onStartPractice}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-2xs"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>선택한 난이도로 연습 시작</span>
        </button>
      </div>

      {/* Difficulty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {levels.map((lvl) => {
          const config = DIFFICULTY_CONFIGS[lvl];
          const isSelected = currentDifficulty === lvl;

          return (
            <div
              key={lvl}
              onClick={() => handleSelect(lvl)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative text-left flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-50/50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
              }`}
            >
              <div>
                {/* Top Badge & Check */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                      {config.levelBadge}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{config.carryNote}</span>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Level Title */}
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                  {config.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {config.description}
                </p>

                {/* Sample problem preview */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 mb-3">
                  <span className="text-[10px] text-slate-400 block font-semibold mb-0.5">
                    예시 문제
                  </span>
                  <div className="font-mono text-sm font-bold text-slate-800">
                    {config.sample}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {config.explanation}
                  </p>
                </div>
              </div>

              {/* Bottom selection button */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  {isSelected ? '현재 적용 중' : '클릭하여 선택'}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(lvl);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isSelected ? '적용 완료' : '선택하기'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
