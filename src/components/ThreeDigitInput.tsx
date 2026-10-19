import React, { useRef, useEffect } from 'react';

export type ThreeDigits = [string, string, string]; // [백, 십, 일]

export function getDigitsNumericValue(digits: ThreeDigits): number | null {
  const [h, t, o] = digits;
  if (!h && !t && !o) return null;
  const hVal = h ? parseInt(h, 10) : 0;
  const tVal = t ? parseInt(t, 10) : 0;
  const oVal = o ? parseInt(o, 10) : 0;
  return hVal * 100 + tVal * 10 + oVal;
}

export function digitsToString(digits: ThreeDigits): string {
  const [h, t, o] = digits;
  if (!h && !t && !o) return '';
  if (h) return `${h}${t || '0'}${o || '0'}`;
  return `${t || ''}${o !== '' ? o : ''}`;
}

interface ThreeDigitInputProps {
  digits: ThreeDigits;
  onDigitsChange: (digits: ThreeDigits) => void;
  activeBox: number;
  onActiveBoxChange: (box: number) => void;
  onSubmit: () => void;
  disabled?: boolean;
  isCorrect?: boolean | null;
  problemId?: string;
  size?: 'normal' | 'compact';
}

export const ThreeDigitInput: React.FC<ThreeDigitInputProps> = ({
  digits,
  onDigitsChange,
  activeBox,
  onActiveBoxChange,
  onSubmit,
  disabled = false,
  isCorrect = null,
  problemId,
  size = 'normal',
}) => {
  const ref0 = useRef<HTMLInputElement | null>(null);
  const ref1 = useRef<HTMLInputElement | null>(null);
  const ref2 = useRef<HTMLInputElement | null>(null);
  const refs = [ref0, ref1, ref2];

  // Focus current active box when activeBox changes or on problem change
  useEffect(() => {
    if (disabled) return;
    const target = refs[activeBox]?.current;
    if (target && document.activeElement !== target) {
      target.focus();
    }
  }, [activeBox, problemId, disabled]);

  const handleBoxChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const char = raw ? raw.slice(-1) : ''; // Always take the single latest digit typed in THIS box

    const next: ThreeDigits = [...digits];
    next[idx] = char;
    onDigitsChange(next);

    // Subtle natural keyboard advance:
    // If typing in 백 (0) -> move to 십 (1)
    // If typing in 십 (1) -> move to 일 (2)
    // If typing in 일 (2) -> stays in 일 (2), NEVER jumps to 십!
    if (char) {
      if (idx === 0) {
        onActiveBoxChange(1);
        refs[1].current?.focus();
      } else if (idx === 1 && !digits[2]) {
        onActiveBoxChange(2);
        refs[2].current?.focus();
      }
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
      return;
    }

    if (e.key === 'Backspace') {
      if (!digits[idx] && idx > 0) {
        // If current box is already empty, navigate to previous box
        e.preventDefault();
        onActiveBoxChange(idx - 1);
        refs[idx - 1].current?.focus();
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      e.preventDefault();
      onActiveBoxChange(idx - 1);
      refs[idx - 1].current?.focus();
    } else if (e.key === 'ArrowRight' && idx < 2) {
      e.preventDefault();
      onActiveBoxChange(idx + 1);
      refs[idx + 1].current?.focus();
    }
  };

  const placeholders = ['백', '십', '일'];
  const labels = ['백', '십', '일'];
  const boxHeight = size === 'compact' ? 'h-12 text-2xl' : 'h-16 sm:h-18 text-3xl sm:text-4xl';

  return (
    <div className="w-full select-none">
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {[0, 1, 2].map((idx) => {
          const val = digits[idx];
          const isActive = activeBox === idx;

          return (
            <div key={idx} className="relative flex flex-col items-center">
              <input
                ref={refs[idx]}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                disabled={disabled}
                value={val}
                onFocus={() => onActiveBoxChange(idx)}
                onClick={() => onActiveBoxChange(idx)}
                onChange={(e) => handleBoxChange(idx, e)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                placeholder={placeholders[idx]}
                aria-label={`${labels[idx]}의 자리 정답 입력`}
                className={`w-full ${boxHeight} rounded-xl text-center font-mono font-extrabold tracking-wider transition-all outline-none cursor-text ${
                  isCorrect === true
                    ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-400'
                    : isCorrect === false
                    ? 'bg-rose-50 text-rose-600 border-2 border-rose-400 animate-shake'
                    : isActive
                    ? 'bg-white text-indigo-950 border-2 border-indigo-600 shadow-xs ring-3 ring-indigo-200'
                    : val
                    ? 'bg-indigo-50/70 text-indigo-950 border-2 border-indigo-400 shadow-2xs'
                    : 'bg-slate-50 text-slate-800 placeholder:text-slate-300 placeholder:font-sans placeholder:text-xs sm:placeholder:text-sm placeholder:font-normal border-2 border-dashed border-slate-300 hover:border-slate-400'
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
