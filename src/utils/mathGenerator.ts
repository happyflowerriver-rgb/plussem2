import { DifficultyLevel, DifficultyConfig, MathProblem, StepExplanation } from '../types/math';

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    id: 'easy',
    name: '쉬움 (받아올림 없음)',
    shortName: '쉬움',
    levelBadge: 'Level 1',
    description: '일의 자리와 십의 자리 모두 받아올림이 없어 덧셈 원리를 익히기에 좋습니다.',
    sample: '24 + 35 = 59',
    explanation: '일의 자리끼리 더해도 10 미만, 십의 자리끼리 더해도 10 미만입니다.',
    carryNote: '받아올림 없음',
  },
  medium: {
    id: 'medium',
    name: '보통 (일의 자리 받아올림 1회)',
    shortName: '보통',
    levelBadge: 'Level 2',
    description: '일의 자리를 더했을 때 10이 넘어 십의 자리로 1을 올려주는 기본 받아올림입니다.',
    sample: '38 + 27 = 65',
    explanation: '일의 자리 합이 10 이상이며, 결과는 100 미만(두 자리 수)으로 유지됩니다.',
    carryNote: '일의 자리 받아올림 1회',
  },
  hard: {
    id: 'hard',
    name: '어려움 (100 초과 / 십의 자리 받아올림)',
    shortName: '어려움',
    levelBadge: 'Level 3',
    description: '두 수를 더해 100이 넘는 세 자리 수 결과가 나오는 심화 문제입니다.',
    sample: '68 + 57 = 125',
    explanation: '십의 자리를 더했을 때 10 이상이 되어 백의 자리(1)가 생겨납니다.',
    carryNote: '십의 자리 받아올림 (합 100 이상)',
  },
  master: {
    id: 'master',
    name: '마스터 (전체 유형 종합)',
    shortName: '마스터',
    levelBadge: 'Level 4',
    description: '받아올림 없는 문제부터 복합 받아올림까지 모든 두 자리 수 덧셈이 무작위 출제됩니다.',
    sample: '47 + 86 = 133',
    explanation: '실전 시험 및 암산 능력을 극대화할 수 있는 종합 훈련 모드입니다.',
    carryNote: '모든 유형 랜덤',
  },
  decade: {
    id: 'decade',
    name: '암산 비법 (10단위 근접 수)',
    shortName: '암산비법',
    levelBadge: 'Level 5',
    description: '9나 8로 끝나는 수(29, 49, 38 등)를 10 단위로 올려 더한 뒤 1이나 2를 빼는 빠른 암산 훈련입니다.',
    sample: '29 + 45 = (30 + 45) - 1 = 74',
    explanation: '수학 영재들이 활용하는 보수(Complement) 기반 빠른 연산 테크닉을 익힙니다.',
    carryNote: '빠른 보수 암산 훈련',
  },
};

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateMathProblem(difficulty: DifficultyLevel): MathProblem {
  const id = `prob_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  let num1 = 10;
  let num2 = 10;
  let hintTip: string | undefined = undefined;

  switch (difficulty) {
    case 'easy': {
      // No carry in ones: ones1 + ones2 <= 9
      // No carry in tens: tens1 + tens2 <= 9
      const ones1 = getRandomInt(1, 8);
      const ones2 = getRandomInt(1, 9 - ones1);
      const tens1 = getRandomInt(1, 8);
      const tens2 = getRandomInt(1, 9 - tens1);
      num1 = tens1 * 10 + ones1;
      num2 = tens2 * 10 + ones2;
      break;
    }

    case 'medium': {
      // Carry in ones: ones1 + ones2 >= 10
      // No carry in tens after adding 1: tens1 + tens2 + 1 <= 9 (sum < 100)
      const ones1 = getRandomInt(2, 9);
      const ones2 = getRandomInt(10 - ones1, 9);
      const tens1 = getRandomInt(1, 7);
      const maxTens2 = 8 - tens1;
      const tens2 = getRandomInt(1, Math.max(1, maxTens2));
      num1 = tens1 * 10 + ones1;
      num2 = tens2 * 10 + ones2;
      break;
    }

    case 'hard': {
      // Result >= 100
      // Pick tens that sum to >= 10 (or with carry >= 10)
      const carryInOnes = Math.random() > 0.3;
      let ones1: number;
      let ones2: number;
      if (carryInOnes) {
        ones1 = getRandomInt(3, 9);
        ones2 = getRandomInt(10 - ones1, 9);
      } else {
        ones1 = getRandomInt(1, 7);
        ones2 = getRandomInt(1, 9 - ones1);
      }

      const onesCarry = carryInOnes ? 1 : 0;
      // tens1 + tens2 + onesCarry >= 10
      const tens1 = getRandomInt(4, 9);
      const minTens2 = Math.max(1, 10 - onesCarry - tens1);
      const tens2 = getRandomInt(minTens2, 9);

      num1 = tens1 * 10 + ones1;
      num2 = tens2 * 10 + ones2;
      break;
    }

    case 'decade': {
      // One number ends with 9 or 8 (e.g. 19, 29, 39, 49, 59, 69, 79, 89, 28, 38, 48, 58)
      const isNine = Math.random() > 0.4;
      const targetUnit = isNine ? 9 : 8;
      const tensA = getRandomInt(1, 7);
      const targetNum = tensA * 10 + targetUnit;
      const otherNum = getRandomInt(12, 75);

      // Randomly assign to num1 or num2
      if (Math.random() > 0.5) {
        num1 = targetNum;
        num2 = otherNum;
      } else {
        num1 = otherNum;
        num2 = targetNum;
      }

      const base = (tensA + 1) * 10;
      const diff = base - targetNum; // 1 or 2
      hintTip = `암산 팁: ${targetNum}을 ${base}로 생각하고 먼저 더한 뒤 ${diff}을 빼보세요! (${base} + ${otherNum} = ${base + otherNum} → ${base + otherNum - diff})`;
      break;
    }

    case 'master':
    default: {
      // Fully random 2-digit numbers
      num1 = getRandomInt(11, 99);
      num2 = getRandomInt(11, 99);
      break;
    }
  }

  const sum = num1 + num2;
  const ones1 = num1 % 10;
  const ones2 = num2 % 10;
  const carriesOnes = ones1 + ones2 >= 10;
  const tens1 = Math.floor(num1 / 10);
  const tens2 = Math.floor(num2 / 10);
  const carriesTens = tens1 + tens2 + (carriesOnes ? 1 : 0) >= 10;

  return {
    id,
    num1,
    num2,
    sum,
    difficulty,
    carriesOnes,
    carriesTens,
    hintTip,
  };
}

export function getCarryingBreakdown(num1: number, num2: number): StepExplanation {
  const ones1 = num1 % 10;
  const ones2 = num2 % 10;
  const onesSum = ones1 + ones2;
  const carriesOnes = onesSum >= 10;
  const onesResult = onesSum % 10;

  const tens1 = Math.floor(num1 / 10);
  const tens2 = Math.floor(num2 / 10);
  const tensCarry = carriesOnes ? 1 : 0;
  const tensSum = tens1 + tens2 + tensCarry;
  const carriesTens = tensSum >= 10;
  const tensResult = tensSum % 10;
  const hundredsResult = Math.floor(tensSum / 10);

  return {
    ones1,
    ones2,
    onesSum,
    onesResult,
    carriesOnes,
    tens1,
    tens2,
    tensCarry,
    tensSum,
    tensResult,
    hundredsResult,
    finalSum: num1 + num2,
  };
}
