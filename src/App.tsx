import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { PracticeMode } from './components/PracticeMode';
import { Timed60Mode } from './components/Timed60Mode';
import { Sprint10Mode } from './components/Sprint10Mode';
import { WrongNotesMode } from './components/WrongNotesMode';
import { DifficultyView } from './components/DifficultyView';
import { ReportMode } from './components/ReportMode';
import { DifficultyLevel } from './types/math';
import { getStoredDifficulty, saveStoredDifficulty, getStoredWrongNotes } from './utils/storage';
import { sound } from './utils/sound';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('practice');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(getStoredDifficulty());
  const [unresolvedCount, setUnresolvedCount] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());

  const refreshUnresolvedCount = () => {
    const notes = getStoredWrongNotes();
    setUnresolvedCount(notes.filter((n) => !n.resolved).length);
  };

  useEffect(() => {
    refreshUnresolvedCount();
    // Poll or check on tab change
    const interval = setInterval(refreshUnresolvedCount, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleDifficultyChange = (newDiff: DifficultyLevel) => {
    setDifficulty(newDiff);
    saveStoredDifficulty(newDiff);
  };

  const handleToggleMute = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          refreshUnresolvedCount();
        }}
        currentDifficulty={difficulty}
        onOpenDifficulty={() => setActiveTab('difficulty')}
        unresolvedWrongCount={unresolvedCount}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'practice' && (
          <PracticeMode
            difficulty={difficulty}
            onOpenWrongNotes={() => {
              setActiveTab('wrong_notes');
              refreshUnresolvedCount();
            }}
            onDifficultyChange={() => setActiveTab('difficulty')}
          />
        )}

        {activeTab === 'timed_60' && (
          <Timed60Mode
            difficulty={difficulty}
            onOpenWrongNotes={() => {
              setActiveTab('wrong_notes');
              refreshUnresolvedCount();
            }}
            onDifficultyChange={() => setActiveTab('difficulty')}
          />
        )}

        {activeTab === 'sprint_10' && (
          <Sprint10Mode
            difficulty={difficulty}
            onOpenWrongNotes={() => {
              setActiveTab('wrong_notes');
              refreshUnresolvedCount();
            }}
            onDifficultyChange={() => setActiveTab('difficulty')}
          />
        )}

        {activeTab === 'wrong_notes' && (
          <WrongNotesMode
            onStartPractice={() => setActiveTab('practice')}
          />
        )}

        {activeTab === 'difficulty' && (
          <DifficultyView
            currentDifficulty={difficulty}
            onSelectDifficulty={handleDifficultyChange}
            onStartPractice={() => setActiveTab('practice')}
          />
        )}

        {activeTab === 'report' && (
          <ReportMode
            onStartPractice={() => setActiveTab('practice')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium text-slate-700">
            두 자리 수 덧셈 마스터 · 받아올림 연산 훈련 웹앱
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>키보드 숫자키 및 터치패드 지원</span>
            <span aria-hidden="true">·</span>
            <span>데이터 로컬 자동 저장</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
