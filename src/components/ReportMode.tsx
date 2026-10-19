import React, { useState, useEffect } from 'react';
import { UserStats, GameRecord, AchievementBadge, DifficultyLevel } from '../types/math';
import {
  getStoredStats,
  getStoredGameRecords,
  getStoredBadges,
  resetAllStorage,
} from '../utils/storage';
import { DIFFICULTY_CONFIGS } from '../utils/mathGenerator';
import { sound } from '../utils/sound';
import {
  BarChart3,
  Award,
  Clock,
  CheckCircle2,
  Zap,
  Flame,
  Brain,
  Timer,
  Trophy,
  History,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Footprints,
  CheckCheck,
  Download,
} from 'lucide-react';

interface ReportModeProps {
  onStartPractice: () => void;
}

export const ReportMode: React.FC<ReportModeProps> = ({ onStartPractice }) => {
  const [stats, setStats] = useState<UserStats>(getStoredStats());
  const [records, setRecords] = useState<GameRecord[]>(getStoredGameRecords());
  const [badges, setBadges] = useState<AchievementBadge[]>(getStoredBadges());

  useEffect(() => {
    setStats(getStoredStats());
    setRecords(getStoredGameRecords());
    setBadges(getStoredBadges());
  }, []);

  const overallAccuracy =
    stats.totalSolved > 0
      ? Math.round((stats.totalCorrect / stats.totalSolved) * 100)
      : 0;

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    if (mins === 0) return `${remaining}초`;
    return `${mins}분 ${remaining}초`;
  };

  const getDiagnosis = () => {
    if (stats.totalSolved < 5) {
      return {
        title: '학습을 시작하는 단계입니다',
        body: '연습하기 모드에서 10문제 이상 풀어보면 나만의 강점과 보완할 연산 유형을 정확히 분석해드립니다.',
        level: 'start',
      };
    }

    const hardSolved = stats.difficultyBreakdown.hard?.solved || 0;
    const hardCorrect = stats.difficultyBreakdown.hard?.correct || 0;
    const hardRate = hardSolved > 0 ? (hardCorrect / hardSolved) * 100 : 100;

    const medSolved = stats.difficultyBreakdown.medium?.solved || 0;
    const medCorrect = stats.difficultyBreakdown.medium?.correct || 0;
    const medRate = medSolved > 0 ? (medCorrect / medSolved) * 100 : 100;

    if (overallAccuracy >= 90) {
      return {
        title: '두 자리 수 덧셈 최상위권 실력자!',
        body: '받아올림 연산이 매우 안정적입니다. 60초 도전에서 콤보 점수를 높이거나 10단위 암산 비법을 훈련하여 연산 속도를 더욱 높여보세요.',
        level: 'excellent',
      };
    }

    if (hardSolved >= 3 && hardRate < 70) {
      return {
        title: '100 초과 덧셈(십의 자리 받아올림) 보완 추천',
        body: '십의 자리를 더해 10 이상이 될 때 백의 자리(1)를 적는 과정에서 실수가 일부 있습니다. 세로셈 모드에서 "받아올림 도우미"를 켜고 연습해보세요.',
        level: 'needs_work',
      };
    }

    if (medSolved >= 3 && medRate < 75) {
      return {
        title: '일의 자리 받아올림 꼼꼼히 확인하기',
        body: '일의 자리를 더해 10이 넘었을 때 십의 자리 수에 1을 더해주는 과정을 놓치지 않도록 주의해보세요.',
        level: 'needs_work',
      };
    }

    return {
      title: '꾸준한 연습으로 실력이 향상되고 있습니다',
      body: '오답노트에 쌓인 틀린 문제를 틈틈이 복습하면 실수 없이 완벽한 연산 실력을 갖출 수 있습니다.',
      level: 'good',
    };
  };

  const diagnosis = getDiagnosis();

  const handleExportData = () => {
    sound.playClick();
    const exportObj = {
      exportDate: new Date().toISOString(),
      stats,
      records,
      badges,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `math_report_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleResetData = () => {
    if (window.confirm('정말로 모든 학습 데이터와 기록을 초기화하시겠습니까? (되돌릴 수 없습니다)')) {
      resetAllStorage();
      setStats(getStoredStats());
      setRecords([]);
      setBadges(getStoredBadges());
    }
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Footprints': return <Footprints className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'Timer': return <Timer className="w-5 h-5" />;
      case 'Award': return <Award className="w-5 h-5" />;
      case 'Flame': return <Flame className="w-5 h-5" />;
      case 'CheckCheck': return <CheckCheck className="w-5 h-5" />;
      case 'Trophy': return <Trophy className="w-5 h-5" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5" />;
      case 'Brain': return <Brain className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>학습 종합 보고서</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            지금까지의 연산 연습량, 정답률 추이, 최고 기록 및 취약점 진단 리포트입니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportData}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            title="학습 데이터 JSON 백업"
          >
            <Download className="w-3.5 h-3.5" />
            <span>기록 내보내기</span>
          </button>
          <button
            type="button"
            onClick={handleResetData}
            className="px-3 py-1.5 text-slate-400 hover:text-rose-600 text-xs font-medium rounded-lg transition-colors"
          >
            기록 초기화
          </button>
        </div>
      </div>

      {/* 4 Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-400 block mb-1">총 풀이 문제 수</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {stats.totalSolved}
            </span>
            <span className="text-xs font-medium text-slate-500">문제</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            정답 {stats.totalCorrect}개
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-400 block mb-1">전체 정답률</span>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-2xl sm:text-3xl font-extrabold tabular-nums ${
                overallAccuracy >= 85
                  ? 'text-emerald-600'
                  : overallAccuracy >= 70
                  ? 'text-indigo-600'
                  : 'text-amber-600'
              }`}
            >
              {overallAccuracy}
            </span>
            <span className="text-xs font-medium text-slate-500">%</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            정확한 연산 정확도
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-400 block mb-1">누적 학습 시간</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {formatSeconds(stats.totalTimeSeconds)}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            실제 연산 집중 시간
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-400 block mb-1">연속 출석</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 tabular-nums">
              {stats.currentStreakDays}
            </span>
            <span className="text-xs font-medium text-slate-500">일째</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            매일 꾸준한 습관 형성
          </span>
        </div>
      </div>

      {/* Diagnosis & Feedback Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 mb-6 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <Brain className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                맞춤 연산 진단 리포트
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              {diagnosis.title}
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {diagnosis.body}
            </p>
          </div>
        </div>
      </div>

      {/* 2 Column: Difficulty Breakdown & Mode Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Difficulty Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>난이도별 연산 성취도</span>
          </h3>

          <div className="space-y-4">
            {(['easy', 'medium', 'hard', 'master', 'decade'] as DifficultyLevel[]).map((lvl) => {
              const cfg = DIFFICULTY_CONFIGS[lvl];
              const data = stats.difficultyBreakdown[lvl] || { solved: 0, correct: 0 };
              const rate = data.solved > 0 ? Math.round((data.correct / data.solved) * 100) : 0;

              return (
                <div key={lvl}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800">{cfg.shortName}</span>
                    <span className="text-slate-500 tabular-nums">
                      {data.solved > 0 ? `${rate}% (${data.correct}/${data.solved}문제)` : '풀이 없음'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        rate >= 80 ? 'bg-indigo-600' : rate >= 60 ? 'bg-amber-500' : 'bg-slate-300'
                      }`}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mode High Scores */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>도전 모드 최고 기록</span>
            </h3>

            <div className="space-y-3">
              {/* 60s Mode Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Timer className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">60초 도전 최고 점수</span>
                    <span className="text-[11px] text-slate-400">1분 스피드 연산</span>
                  </div>
                </div>
                <span className="text-lg font-black text-amber-600 font-mono tabular-nums">
                  {stats.bestTimedScore > 0 ? `${stats.bestTimedScore}점` : '도전 전'}
                </span>
              </div>

              {/* 10 Sprint Mode Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">10문제 완벽 승부 최단 시간</span>
                    <span className="text-[11px] text-slate-400">100점 만점 기준</span>
                  </div>
                </div>
                <span className="text-lg font-black text-indigo-600 font-mono tabular-nums">
                  {stats.bestSprintTimeMs > 0
                    ? `${(stats.bestSprintTimeMs / 1000).toFixed(2)}초`
                    : '도전 전'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onStartPractice}
            className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors text-center"
          >
            새 문제 도전하러 가기
          </button>
        </div>
      </div>

      {/* Achievement Badges Showcase */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 mb-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <span>학습 성취 배지 ({badges.filter((b) => b.unlocked).length}/{badges.length})</span>
          </h3>
          <span className="text-xs text-slate-400">목표를 달성하여 배지를 모아보세요</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-3 rounded-xl border text-center flex flex-col items-center justify-between transition-all ${
                b.unlocked
                  ? 'bg-amber-50/50 border-amber-200/80 shadow-2xs'
                  : 'bg-slate-50/60 border-slate-200/70 opacity-50 grayscale'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  b.unlocked ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-400'
                }`}
              >
                {getBadgeIcon(b.iconName)}
              </div>
              <span className="text-xs font-bold text-slate-900 block mb-0.5 line-clamp-1">
                {b.title}
              </span>
              <span className="text-[10px] text-slate-500 leading-tight line-clamp-2">
                {b.description}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sessions History */}
      {records.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            <span>최근 도전 활동 기록</span>
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            {records.slice(0, 8).map((rec) => {
              const modeLabel =
                rec.mode === 'timed_60'
                  ? '60초 도전'
                  : rec.mode === 'sprint_10'
                  ? '10문제 승부'
                  : '자유 연습';
              const dateStr = new Date(rec.timestamp).toLocaleDateString('ko-KR', {
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={rec.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-800">{modeLabel}</span>
                    <span className="text-slate-400">{dateStr}</span>
                    <span className="text-[11px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                      {DIFFICULTY_CONFIGS[rec.difficulty]?.shortName}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-600">
                    <span>
                      정답률{' '}
                      <strong className="text-slate-900 tabular-nums">
                        {rec.totalQuestions > 0
                          ? Math.round((rec.correctCount / rec.totalQuestions) * 100)
                          : 0}
                        %
                      </strong>{' '}
                      ({rec.correctCount}/{rec.totalQuestions})
                    </span>
                    {rec.score !== undefined && (
                      <span className="font-bold text-amber-600 tabular-nums">
                        {rec.score}점
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
