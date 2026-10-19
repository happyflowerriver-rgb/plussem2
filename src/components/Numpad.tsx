import React from 'react';
import { Delete, Check } from 'lucide-react';
import { sound } from '../utils/sound';

interface NumpadProps {
  onNumber: (digit: string) => void;
  onDelete: () => void;
  onClear: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export const Numpad: React.FC<NumpadProps> = ({
  onNumber,
  onDelete,
  onClear,
  onSubmit,
  disabled = false,
}) => {
  const handleKey = (digit: string) => {
    if (disabled) return;
    sound.playClick();
    onNumber(digit);
  };

  const handleDelete = () => {
    if (disabled) return;
    sound.playClick();
    onDelete();
  };

  const handleClear = () => {
    if (disabled) return;
    sound.playClick();
    onClear();
  };

  const handleSubmit = () => {
    if (disabled) return;
    onSubmit();
  };

  return (
    <div className="w-full max-w-xs mx-auto select-none">
      <div className="grid grid-cols-3 gap-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleKey(digit)}
            className="h-14 md:h-16 rounded-xl bg-white text-slate-800 text-2xl font-bold border border-slate-200/80 shadow-xs hover:bg-slate-100 hover:border-slate-300 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {digit}
          </button>
        ))}

        {/* Bottom row: Clear, 0, Backspace */}
        <button
          type="button"
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleClear}
          className="h-14 md:h-16 rounded-xl bg-slate-100 text-slate-600 font-semibold text-base border border-slate-200 hover:bg-slate-200 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
          title="지우기"
        >
          C
        </button>

        <button
          type="button"
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleKey('0')}
          className="h-14 md:h-16 rounded-xl bg-white text-slate-800 text-2xl font-bold border border-slate-200/80 shadow-xs hover:bg-slate-100 hover:border-slate-300 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          0
        </button>

        <button
          type="button"
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleDelete}
          className="h-14 md:h-16 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200 hover:bg-slate-200 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
          title="한 글자 지우기"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>

      <button
        type="button"
        disabled={disabled}
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleSubmit}
        className="w-full mt-3 h-13 md:h-14 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-lg shadow-sm flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        <Check className="w-5 h-5 stroke-[2.5]" />
        <span>정답 확인</span>
        <span className="text-xs font-normal opacity-80 ml-1 hidden sm:inline">(Enter)</span>
      </button>
    </div>
  );
};
