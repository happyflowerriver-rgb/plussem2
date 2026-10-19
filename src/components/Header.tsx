import React from 'react';
import { Volume2, VolumeX, Menu, X, BookOpen, Timer, Swords, FileSpreadsheet, BarChart2, Sliders } from 'lucide-react';
import { DifficultyLevel } from '../types/math';
import { DIFFICULTY_CONFIGS } from '../utils/mathGenerator';
import { sound } from '../utils/sound';

export type ActiveTab = 'practice' | 'timed_60' | 'sprint_10' | 'wrong_notes' | 'difficulty' | 'report';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currentDifficulty: DifficultyLevel;
  onOpenDifficulty: () => void;
  unresolvedWrongCount: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  currentDifficulty,
  onOpenDifficulty,
  unresolvedWrongCount,
  isMuted,
  onToggleMute,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'practice', label: '연습하기', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'timed_60', label: '60초 도전', icon: <Timer className="w-4 h-4" /> },
    { id: 'sprint_10', label: '10문제 승부', icon: <Swords className="w-4 h-4" /> },
    { id: 'wrong_notes', label: '오답노트', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'difficulty', label: '난이도 선택', icon: <Sliders className="w-4 h-4" /> },
    { id: 'report', label: '기록/보고서', icon: <BarChart2 className="w-4 h-4" /> },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    sound.playClick();
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  const currentDiffConfig = DIFFICULTY_CONFIGS[currentDifficulty];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Zone 1: Brand wordmark (single text element) */}
          <button
            type="button"
            onClick={() => handleNavClick('practice')}
            className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-85 transition-opacity"
          >
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-extrabold text-base shadow-xs">
              +
            </span>
            <span>두자리 덧셈 마스터</span>
          </button>

          {/* Zone 2: Navigation Links (single-line, concise) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`relative py-1.5 whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'text-indigo-600 font-semibold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {item.label}
                  {item.id === 'wrong_notes' && unresolvedWrongCount > 0 && (
                    <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-full border border-rose-200">
                      {unresolvedWrongCount}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action & Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Quick Difficulty Switcher */}
            <button
              type="button"
              onClick={onOpenDifficulty}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-lg transition-colors whitespace-nowrap shrink-0"
              title="문제 난이도 변경"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>난이도: {currentDiffConfig.shortName}</span>
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={onToggleMute}
              className={`p-2 rounded-lg border transition-colors ${
                isMuted
                  ? 'text-slate-400 border-slate-200 bg-slate-50 hover:text-slate-700'
                  : 'text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100'
              }`}
              title={isMuted ? '소리 켜기' : '소리 끄기'}
              aria-label="소리 토글"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="메뉴 열기"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <div className="py-2 px-3 mb-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <span className="text-xs text-slate-600">현재 난이도</span>
            <button
              type="button"
              onClick={() => {
                onOpenDifficulty();
                setMobileMenuOpen(false);
              }}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              {currentDiffConfig.name} 변경 ▾
            </button>
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.id === 'wrong_notes' && unresolvedWrongCount > 0 && (
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    {unresolvedWrongCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
