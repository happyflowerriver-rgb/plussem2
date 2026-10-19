import { DifficultyLevel, WrongAnswerRecord, GameRecord, AchievementBadge, UserStats } from '../types/math';

const STATS_KEY = 'math_user_stats_v1';
const WRONG_NOTES_KEY = 'math_wrong_notes_v1';
const GAME_RECORDS_KEY = 'math_game_records_v1';
const BADGES_KEY = 'math_badges_v1';
const DIFFICULTY_KEY = 'math_selected_difficulty_v1';

export const INITIAL_BADGES: AchievementBadge[] = [
  {
    id: 'first_step',
    title: '첫 걸음',
    description: '첫 번째 덧셈 문제를 성공적으로 풀었습니다.',
    iconName: 'Footprints',
    unlocked: false,
  },
  {
    id: 'streak_5',
    title: '집중력 최고',
    description: '5연속 정답을 달성했습니다.',
    iconName: 'Zap',
    unlocked: false,
  },
  {
    id: 'streak_10',
    title: '연산 마법사',
    description: '10연속 정답을 달성했습니다.',
    iconName: 'Sparkles',
    unlocked: false,
  },
  {
    id: 'time_attack_20',
    title: '60초 스피드러너',
    description: '60초 도전에서 20점 이상을 획득했습니다.',
    iconName: 'Timer',
    unlocked: false,
  },
  {
    id: 'sprint_perfect',
    title: '10문제 완벽 승부',
    description: '10문제 승부에서 100점 만점을 기록했습니다.',
    iconName: 'Award',
    unlocked: false,
  },
  {
    id: 'sprint_fast',
    title: '번개 암산왕',
    description: '10문제를 30초 이내에 모두 정답으로 풀었습니다.',
    iconName: 'Flame',
    unlocked: false,
  },
  {
    id: 'wrong_note_hero',
    title: '오답 격파왕',
    description: '오답노트의 틀린 문제를 다시 풀어 극복했습니다.',
    iconName: 'CheckCheck',
    unlocked: false,
  },
  {
    id: 'century_club',
    title: '100문제 돌파',
    description: '누적 100문제 이상 풀이를 완료했습니다.',
    iconName: 'Trophy',
    unlocked: false,
  },
  {
    id: 'hard_master',
    title: '100 초과 덧셈 정복',
    description: '어려움 난이도에서 10문제 이상 정답을 맞혔습니다.',
    iconName: 'ShieldCheck',
    unlocked: false,
  },
  {
    id: 'decade_genius',
    title: '암산 비법 마스터',
    description: '10단위 암산 비법 문제를 5문제 이상 정답 맞혔습니다.',
    iconName: 'Brain',
    unlocked: false,
  },
];

const INITIAL_STATS: UserStats = {
  totalSolved: 0,
  totalCorrect: 0,
  totalTimeSeconds: 0,
  bestTimedScore: 0,
  bestSprintTimeMs: 0,
  currentStreakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  difficultyBreakdown: {
    easy: { solved: 0, correct: 0 },
    medium: { solved: 0, correct: 0 },
    hard: { solved: 0, correct: 0 },
    master: { solved: 0, correct: 0 },
    decade: { solved: 0, correct: 0 },
  },
};

export function getStoredDifficulty(): DifficultyLevel {
  try {
    const val = localStorage.getItem(DIFFICULTY_KEY);
    if (val && ['easy', 'medium', 'hard', 'master', 'decade'].includes(val)) {
      return val as DifficultyLevel;
    }
  } catch {
    // fallback
  }
  return 'medium';
}

export function saveStoredDifficulty(diff: DifficultyLevel) {
  try {
    localStorage.setItem(DIFFICULTY_KEY, diff);
  } catch {
    // fallback
  }
}

export function getStoredStats(): UserStats {
  try {
    const val = localStorage.getItem(STATS_KEY);
    if (val) {
      return { ...INITIAL_STATS, ...JSON.parse(val) };
    }
  } catch {
    // fallback
  }
  return INITIAL_STATS;
}

export function saveStoredStats(stats: UserStats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // fallback
  }
}

export function getStoredWrongNotes(): WrongAnswerRecord[] {
  try {
    const val = localStorage.getItem(WRONG_NOTES_KEY);
    if (val) {
      return JSON.parse(val);
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveStoredWrongNotes(notes: WrongAnswerRecord[]) {
  try {
    localStorage.setItem(WRONG_NOTES_KEY, JSON.stringify(notes));
  } catch {
    // fallback
  }
}

export function addWrongNote(problem: WrongAnswerRecord['problem'], userAnswer: number) {
  const notes = getStoredWrongNotes();
  // Check if identical problem is already in unresolved notes
  const existing = notes.find(
    (n) => !n.resolved && n.problem.num1 === problem.num1 && n.problem.num2 === problem.num2
  );
  if (existing) {
    existing.userAnswer = userAnswer;
    existing.timestamp = Date.now();
    existing.retryCount += 1;
  } else {
    notes.unshift({
      id: `wrong_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      problem,
      userAnswer,
      timestamp: Date.now(),
      resolved: false,
      retryCount: 0,
    });
  }
  saveStoredWrongNotes(notes);
}

export function markWrongNoteResolved(noteId: string) {
  const notes = getStoredWrongNotes();
  const target = notes.find((n) => n.id === noteId);
  if (target) {
    target.resolved = true;
    saveStoredWrongNotes(notes);
    unlockBadge('wrong_note_hero');
  }
}

export function removeWrongNote(noteId: string) {
  const notes = getStoredWrongNotes().filter((n) => n.id !== noteId);
  saveStoredWrongNotes(notes);
}

export function clearAllWrongNotes() {
  saveStoredWrongNotes([]);
}

export function getStoredGameRecords(): GameRecord[] {
  try {
    const val = localStorage.getItem(GAME_RECORDS_KEY);
    if (val) {
      return JSON.parse(val);
    }
  } catch {
    // fallback
  }
  return [];
}

export function addGameRecord(record: Omit<GameRecord, 'id' | 'timestamp'>) {
  const records = getStoredGameRecords();
  const newRecord: GameRecord = {
    ...record,
    id: `rec_${Date.now()}`,
    timestamp: Date.now(),
  };
  records.unshift(newRecord);
  // Keep last 100 records
  if (records.length > 100) {
    records.pop();
  }
  try {
    localStorage.setItem(GAME_RECORDS_KEY, JSON.stringify(records));
  } catch {
    // fallback
  }
}

export function getStoredBadges(): AchievementBadge[] {
  try {
    const val = localStorage.getItem(BADGES_KEY);
    if (val) {
      const parsed: AchievementBadge[] = JSON.parse(val);
      // Merge with initial badges to handle newly added badges
      return INITIAL_BADGES.map((init) => {
        const found = parsed.find((p) => p.id === init.id);
        return found ? { ...init, ...found } : init;
      });
    }
  } catch {
    // fallback
  }
  return INITIAL_BADGES;
}

export function unlockBadge(badgeId: string): boolean {
  const badges = getStoredBadges();
  const target = badges.find((b) => b.id === badgeId);
  if (target && !target.unlocked) {
    target.unlocked = true;
    target.unlockedAt = Date.now();
    try {
      localStorage.setItem(BADGES_KEY, JSON.stringify(badges));
    } catch {
      // fallback
    }
    return true;
  }
  return false;
}

export function recordProblemAnswer(
  difficulty: DifficultyLevel,
  isCorrect: boolean,
  timeSpentMs: number,
  comboCount: number
) {
  const stats = getStoredStats();
  stats.totalSolved += 1;
  if (isCorrect) {
    stats.totalCorrect += 1;
  }
  stats.totalTimeSeconds += Math.round(timeSpentMs / 1000);

  if (!stats.difficultyBreakdown[difficulty]) {
    stats.difficultyBreakdown[difficulty] = { solved: 0, correct: 0 };
  }
  stats.difficultyBreakdown[difficulty].solved += 1;
  if (isCorrect) {
    stats.difficultyBreakdown[difficulty].correct += 1;
  }

  // Update active date
  const today = new Date().toISOString().split('T')[0];
  if (stats.lastActiveDate !== today) {
    stats.currentStreakDays += 1;
    stats.lastActiveDate = today;
  }

  saveStoredStats(stats);

  // Badge triggers
  if (isCorrect) {
    unlockBadge('first_step');
    if (comboCount >= 5) unlockBadge('streak_5');
    if (comboCount >= 10) unlockBadge('streak_10');
    if (difficulty === 'hard' && stats.difficultyBreakdown.hard.correct >= 10) {
      unlockBadge('hard_master');
    }
    if (difficulty === 'decade' && stats.difficultyBreakdown.decade.correct >= 5) {
      unlockBadge('decade_genius');
    }
  }
  if (stats.totalSolved >= 100) {
    unlockBadge('century_club');
  }
}

export function resetAllStorage() {
  try {
    localStorage.removeItem(STATS_KEY);
    localStorage.removeItem(WRONG_NOTES_KEY);
    localStorage.removeItem(GAME_RECORDS_KEY);
    localStorage.removeItem(BADGES_KEY);
  } catch {
    // fallback
  }
}
