import type {
  ActivityKey,
  FaithKey,
  HobbyKey,
  NutritionCategory,
  NutritionFood,
  NutritionFoodId,
  NutritionKey,
  RoutineState,
  TrainingKey,
} from "./types/routine";

export type {
  ActivityKey,
  CustomFood,
  DailyRecords,
  DailyRoutineLog,
  DietRoutineRecord,
  FaithKey,
  FaithRoutineRecord,
  HobbyKey,
  HobbyRoutineRecord,
  NutritionCategory,
  NutritionFood,
  NutritionFoodId,
  NutritionKey,
  RoutineScores,
  RoutineState,
  TrainingKey,
  TrainingRoutineRecord,
} from "./types/routine";

export type RoutineSectionId = "nutrition" | "training" | "faith";
export type TrainingRole = "main" | "strength" | "recovery";
export type TrainingGroup = "러닝" | "수영" | "사이클" | "맨몸운동" | "회복";
export type HobbyGroup = "피아노" | "성악" | "코딩";

export type RoutineItem = {
  key: keyof RoutineState;
  label: string;
  note?: string;
  unitLabel?: string;
  description?: string;
  points?: number;
  proteinGrams?: number;
  group?: TrainingGroup;
  role?: TrainingRole;
  category?: NutritionCategory;
};

export type RoutineSection = {
  id: RoutineSectionId;
  eyebrow: string;
  title: string;
  scoreLabel: string;
  summary: string;
  items: readonly RoutineItem[];
};

export type DietAssessment = {
  score: number;
  totalProtein: number;
  proteinFoodCount: number;
  fruitVegetableServings: number;
  mealServings: number;
  processedServings: number;
  proteinScore: number;
  produceScore: number;
  mealScore: number;
  balanceScore: number;
};

export type TrainingAssessment = {
  score: number;
  mainScore: number;
  secondaryBonus: number;
  strengthScore: number;
  recoveryScore: number;
  hasPlannedRest: boolean;
  mainSessionLabel: string | null;
  secondarySessionLabel: string | null;
  strengthLabel: string | null;
  recoveryLabel: string | null;
  mainSessionCount: number;
};

export type HobbyItem = {
  key: HobbyKey;
  label: string;
  note: string;
  points: number;
  group: HobbyGroup;
};

export type HobbyAssessment = {
  score: number;
  mainScore: number;
  secondaryBonus: number;
  mainLabel: string | null;
  secondaryLabel: string | null;
  practicedCount: number;
};

export type FaithAssessment = {
  score: number;
  coreScore: number;
  supportScore: number;
  supportRawScore: number;
  supportCap: number;
  coreCount: number;
  hasCoreFlow: boolean;
  hasDepth: boolean;
  hasWordListening: boolean;
  hasAwareness: boolean;
};

export type DetailSectionId = RoutineSectionId | "hobby";
export type SummaryTone = "positive" | "neutral" | "caution";

export type SectionSummaryItem = {
  label: string;
  value: string;
  tone: SummaryTone;
};

export type NutritionPresetItem = {
  key: NutritionKey;
  quantity: number;
};

export type NutritionQuickPreset = {
  id: string;
  label: string;
  description: string;
  items: readonly NutritionPresetItem[];
};

export type TrainingQuickAction = {
  key: TrainingKey;
  label: string;
};

export type FaithQuickAction = {
  key: FaithKey;
  label: string;
};

export const nutritionKeys = [
  "greekYogurt",
  "banana",
  "mealit",
  "blackBeanSoyMilk",
  "proteinDrink",
  "proteinBar",
  "nuts",
  "chickenBreast",
  "chickenFriedRice",
  "cherryTomatoes",
  "broccoli",
  "cucumberCarrot",
  "egg",
  "ramen",
] as const satisfies readonly NutritionKey[];

const trainingKeys = [
  "runZone2",
  "runInterval",
  "runLsd",
  "runShort",
  "runMedium",
  "runLong",
  "swimLesson",
  "swimFree",
  "swimFinDay",
  "swimOpenWater",
  "cycleRecovery",
  "cycleNormal",
  "cycleHard",
  "cycleLong",
  "bodyweightLight",
  "bodyweightModerate",
  "bodyweightHigh",
  "stretching",
  "recoveryRoutine",
  "supportWorkout",
  "plannedRest",
] as const satisfies readonly TrainingKey[];

const faithKeys = [
  "qt",
  "prayer",
  "gratitude",
  "worship",
  "bsc",
  "listeningToWord",
  "godAwareness",
] as const satisfies readonly FaithKey[];

const hobbyKeys = [
  "pianoShort",
  "pianoPractice",
  "pianoDeep",
  "pianoLesson",
  "vocalWarmup",
  "vocalPractice",
  "vocalLesson",
  "codingShort",
  "codingWork",
  "codingDeep",
] as const satisfies readonly HobbyKey[];

const coreActivityKeys = [...trainingKeys, ...faithKeys] as const satisfies readonly (
  | TrainingKey
  | FaithKey
)[];

const activityKeys = [...coreActivityKeys, ...hobbyKeys] as const satisfies readonly ActivityKey[];

const highValueMainKeys = new Set<TrainingKey>([
  "runInterval",
  "runLsd",
  "runLong",
  "swimOpenWater",
  "cycleHard",
  "cycleLong",
]);

const proteinCategories = new Set<NutritionCategory>(["protein", "proteinMeal"]);
const produceCategories = new Set<NutritionCategory>(["fruit", "vegetable"]);
const focusedHobbyKeys = new Set<HobbyKey>([
  "pianoDeep",
  "pianoLesson",
  "vocalLesson",
  "codingDeep",
]);

export const DEFAULT_HEIGHT_CM = 175;
export const DEFAULT_WEIGHT_KG = 70;
export const MAX_NUTRITION_QUANTITY = 9;

export const defaultState: RoutineState = {
  greekYogurt: 0,
  banana: 0,
  mealit: 0,
  blackBeanSoyMilk: 0,
  proteinDrink: 0,
  proteinBar: 0,
  nuts: 0,
  chickenBreast: 0,
  chickenFriedRice: 0,
  cherryTomatoes: 0,
  broccoli: 0,
  cucumberCarrot: 0,
  egg: 0,
  ramen: 0,
  runZone2: false,
  runInterval: false,
  runLsd: false,
  runShort: false,
  runMedium: false,
  runLong: false,
  swimLesson: false,
  swimFree: false,
  swimFinDay: false,
  swimOpenWater: false,
  cycleRecovery: false,
  cycleNormal: false,
  cycleHard: false,
  cycleLong: false,
  bodyweightLight: false,
  bodyweightModerate: false,
  bodyweightHigh: false,
  stretching: false,
  recoveryRoutine: false,
  supportWorkout: false,
  plannedRest: false,
  qt: false,
  prayer: false,
  gratitude: false,
  worship: false,
  bsc: false,
  godAwareness: false,
  listeningToWord: false,
  pianoShort: false,
  pianoPractice: false,
  pianoDeep: false,
  pianoLesson: false,
  vocalWarmup: false,
  vocalPractice: false,
  vocalLesson: false,
  codingShort: false,
  codingWork: false,
  codingDeep: false,
};

export function normalizeRoutineState(
  record: Partial<RoutineState> | null | undefined,
  customFoods: readonly NutritionFood[] = [],
): RoutineState {
  const normalized: RoutineState = { ...defaultState };
  const foods = getNutritionFoods(customFoods);

  if (!record) {
    for (const food of foods) {
      normalized[food.id] = 0;
    }
    return normalized;
  }

  for (const food of foods) {
    const value = record[food.id];
    if (typeof value === "number" && Number.isFinite(value)) {
      normalized[food.id] = Math.max(0, Math.min(MAX_NUTRITION_QUANTITY, Math.round(value)));
      continue;
    }

    if (typeof value === "boolean") {
      normalized[food.id] = value ? 1 : 0;
      continue;
    }

    normalized[food.id] = 0;
  }

  for (const key of activityKeys) {
    const value = record[key];
    if (typeof value === "boolean") {
      normalized[key] = value;
    }
  }

  return normalized;
}

export const routineSections = [
  {
    id: "nutrition",
    eyebrow: "식단",
    title: "식단",
    scoreLabel: "식단 점수",
    summary: "체크한 음식과 수량을 기준으로 단백질과 식사 균형을 평가합니다.",
    items: [
      {
        key: "greekYogurt",
        label: "그릭요거트",
        note: "단백질 6g / 1개",
        unitLabel: "1개",
        proteinGrams: 6,
        category: "protein",
      },
      {
        key: "banana",
        label: "바나나",
        note: "단백질 1g / 1개",
        unitLabel: "1개",
        proteinGrams: 1,
        category: "fruit",
      },
      {
        key: "mealit",
        label: "밀잇",
        note: "단백질 21g / 1개",
        unitLabel: "1개",
        proteinGrams: 21,
        category: "proteinMeal",
      },
      {
        key: "blackBeanSoyMilk",
        label: "검은콩두유",
        note: "단백질 12g / 1팩",
        unitLabel: "1팩",
        proteinGrams: 12,
        category: "protein",
      },
      {
        key: "proteinDrink",
        label: "더단백드링크",
        note: "단백질 20g / 1병",
        unitLabel: "1병",
        proteinGrams: 20,
        category: "protein",
      },
      {
        key: "proteinBar",
        label: "단백질바",
        note: "단백질 12g / 1개",
        unitLabel: "1개",
        proteinGrams: 12,
        category: "snack",
      },
      {
        key: "nuts",
        label: "너트한줌",
        note: "단백질 3g / 1회",
        unitLabel: "1회",
        proteinGrams: 3,
        category: "snack",
      },
      {
        key: "chickenBreast",
        label: "실온 닭가슴살",
        note: "단백질 22g / 1팩",
        unitLabel: "1팩",
        proteinGrams: 22,
        category: "protein",
      },
      {
        key: "chickenFriedRice",
        label: "닭가슴살 볶음밥",
        note: "단백질 30g / 1개",
        unitLabel: "1개",
        proteinGrams: 30,
        category: "proteinMeal",
      },
      {
        key: "cherryTomatoes",
        label: "방울토마토",
        note: "단백질 1g / 1회",
        unitLabel: "1회",
        proteinGrams: 1,
        category: "vegetable",
      },
      {
        key: "broccoli",
        label: "브로콜리",
        note: "단백질 3g / 1회",
        unitLabel: "1회",
        proteinGrams: 3,
        category: "vegetable",
      },
      {
        key: "cucumberCarrot",
        label: "오이/당근",
        note: "단백질 1g / 1회",
        unitLabel: "1회",
        proteinGrams: 1,
        category: "vegetable",
      },
      {
        key: "egg",
        label: "계란",
        note: "단백질 6g / 1개",
        unitLabel: "1개",
        proteinGrams: 6,
        category: "protein",
      },
      {
        key: "ramen",
        label: "라면",
        note: "단백질 8g / 1봉",
        unitLabel: "1봉",
        proteinGrams: 8,
        category: "processed",
      },
    ],
  },
  {
    id: "training",
    eyebrow: "훈련",
    title: "훈련",
    scoreLabel: "훈련 점수",
    summary: "메인 세션 1개를 중심으로 평가하고, 보조 운동과 회복은 제한된 추가 점수로 반영합니다.",
    items: [
      { key: "runZone2", label: "존2 러닝", note: "18점", points: 18, group: "러닝", role: "main" },
      { key: "runInterval", label: "인터벌 러닝", note: "30점", points: 30, group: "러닝", role: "main" },
      { key: "runLsd", label: "LSD", note: "32점", points: 32, group: "러닝", role: "main" },
      { key: "runShort", label: "짧은 거리 러닝", note: "15점", points: 15, group: "러닝", role: "main" },
      { key: "runMedium", label: "중간 거리 러닝", note: "22점", points: 22, group: "러닝", role: "main" },
      { key: "runLong", label: "긴 거리 러닝", note: "30점", points: 30, group: "러닝", role: "main" },
      { key: "swimLesson", label: "강습", note: "24점", points: 24, group: "수영", role: "main" },
      { key: "swimFree", label: "자유수영", note: "18점", points: 18, group: "수영", role: "main" },
      { key: "swimFinDay", label: "핀데이", note: "22점", points: 22, group: "수영", role: "main" },
      { key: "swimOpenWater", label: "오픈워터", note: "30점", points: 30, group: "수영", role: "main" },
      { key: "cycleRecovery", label: "회복 라이딩", note: "16점", points: 16, group: "사이클", role: "main" },
      { key: "cycleNormal", label: "일반 라이딩", note: "22점", points: 22, group: "사이클", role: "main" },
      { key: "cycleHard", label: "중강도 이상 라이딩", note: "28점", points: 28, group: "사이클", role: "main" },
      { key: "cycleLong", label: "장거리 라이딩", note: "32점", points: 32, group: "사이클", role: "main" },
      {
        key: "bodyweightLight",
        label: "가벼운 맨몸운동",
        note: "2점",
        points: 2,
        group: "맨몸운동",
        role: "strength",
      },
      {
        key: "bodyweightModerate",
        label: "중간 강도 맨몸운동",
        note: "4점",
        points: 4,
        group: "맨몸운동",
        role: "strength",
      },
      {
        key: "bodyweightHigh",
        label: "높은 강도 맨몸운동",
        note: "5점",
        points: 5,
        group: "맨몸운동",
        role: "strength",
      },
      { key: "stretching", label: "스트레칭", note: "2점", points: 2, group: "회복", role: "recovery" },
      { key: "recoveryRoutine", label: "회복 루틴", note: "4점", points: 4, group: "회복", role: "recovery" },
      { key: "supportWorkout", label: "가벼운 보조운동", note: "3점", points: 3, group: "회복", role: "recovery" },
      { key: "plannedRest", label: "계획 휴식", note: "5점", points: 5, group: "회복", role: "recovery" },
    ],
  },
  {
    id: "faith",
    eyebrow: "신앙",
    title: "신앙",
    scoreLabel: "신앙 점수",
    summary: "QT와 기도, 예배와 말씀 공부를 통해 하루의 중심을 차분하게 정돈합니다.",
    items: [
      { key: "qt", label: "QT · 묵상", points: 5 },
      { key: "prayer", label: "기도", points: 4 },
      { key: "gratitude", label: "감사 기록", points: 1 },
      { key: "worship", label: "예배", points: 3 },
      { key: "bsc", label: "BSC(성경공부)", points: 2 },
      { key: "listeningToWord", label: "말씀듣기", points: 3 },
      { key: "godAwareness", label: "하나님 의식", points: 2 },
    ],
  },
] as const satisfies readonly RoutineSection[];

export const defaultNutritionFoods = (routineSections.find((section) => section.id === "nutrition")?.items ?? [])
  .map((item) => ({
    id: item.key as NutritionKey,
    label: item.label,
    proteinGrams: item.proteinGrams ?? 0,
    unitLabel: item.unitLabel ?? "1회",
    category: item.category ?? "snack",
    isCustom: false,
  })) as readonly NutritionFood[];

export function getNutritionNote(food: NutritionFood) {
  return `단백질 ${food.proteinGrams}g / ${food.unitLabel}`;
}

function mapNutritionFoodToRoutineItem(food: NutritionFood): RoutineItem {
  return {
    key: food.id,
    label: food.label,
    note: getNutritionNote(food),
    unitLabel: food.unitLabel,
    proteinGrams: food.proteinGrams,
    category: food.category,
  };
}

export function getNutritionFoods(customFoods: readonly NutritionFood[] = []) {
  return [...defaultNutritionFoods, ...customFoods];
}

export function getActiveCustomFoods(customFoods: readonly NutritionFood[] = []) {
  return customFoods.filter((food) => !food.isArchived);
}

export function getActiveNutritionFoods(customFoods: readonly NutritionFood[] = []) {
  return getNutritionFoods(getActiveCustomFoods(customFoods));
}

export function getRoutineSections(customFoods: readonly NutritionFood[] = []) {
  const nutritionItems = getNutritionFoods(customFoods).map(mapNutritionFoodToRoutineItem);

  return routineSections.map((section) =>
    section.id === "nutrition"
      ? {
          ...section,
          items: nutritionItems,
        }
      : section,
  ) as RoutineSection[];
}

export const hobbySection = {
  id: "hobby",
  eyebrow: "extra",
  title: "취미",
  summary: "피아노, 성악, 코딩은 기본 루틴과 분리된 보너스 기록으로 가볍게 쌓아갑니다.",
  items: [
    { key: "pianoShort", label: "짧은 연습", note: "2점", points: 2, group: "피아노" },
    { key: "pianoPractice", label: "일반 연습", note: "4점", points: 4, group: "피아노" },
    { key: "pianoDeep", label: "집중 연습", note: "6점", points: 6, group: "피아노" },
    { key: "pianoLesson", label: "레슨", note: "6점", points: 6, group: "피아노" },
    { key: "vocalWarmup", label: "발성 연습", note: "2점", points: 2, group: "성악" },
    { key: "vocalPractice", label: "개인 연습", note: "4점", points: 4, group: "성악" },
    { key: "vocalLesson", label: "레슨", note: "6점", points: 6, group: "성악" },
    { key: "codingShort", label: "짧은 작업", note: "2점", points: 2, group: "코딩" },
    { key: "codingWork", label: "일반 작업", note: "4점", points: 4, group: "코딩" },
    { key: "codingDeep", label: "집중 작업 · 프로젝트", note: "6점", points: 6, group: "코딩" },
  ],
} as const satisfies {
  id: "hobby";
  eyebrow: string;
  title: string;
  summary: string;
  items: readonly HobbyItem[];
};

export const nutritionQuickPresets = [
  {
    id: "breakfast-starter",
    label: "아침 기본",
    description: "그릭요거트 + 바나나 + 밀잇",
    items: [
      { key: "greekYogurt", quantity: 1 },
      { key: "banana", quantity: 1 },
      { key: "mealit", quantity: 1 },
    ],
  },
  {
    id: "snack-starter",
    label: "간식 기본",
    description: "더단백드링크 + 너트한줌",
    items: [
      { key: "proteinDrink", quantity: 1 },
      { key: "nuts", quantity: 1 },
    ],
  },
  {
    id: "post-workout-starter",
    label: "운동 후 기본",
    description: "실온 닭가슴살 + 검은콩두유",
    items: [
      { key: "chickenBreast", quantity: 1 },
      { key: "blackBeanSoyMilk", quantity: 1 },
    ],
  },
] as const satisfies readonly NutritionQuickPreset[];

export const trainingQuickActions = [
  { key: "runZone2", label: "러닝" },
  { key: "swimLesson", label: "수영" },
  { key: "cycleNormal", label: "사이클" },
  { key: "bodyweightModerate", label: "근력" },
  { key: "stretching", label: "스트레칭" },
  { key: "plannedRest", label: "휴식" },
] as const satisfies readonly TrainingQuickAction[];

export const faithQuickActions = [
  { key: "qt", label: "QT" },
  { key: "prayer", label: "기도" },
  { key: "listeningToWord", label: "말씀듣기" },
] as const satisfies readonly FaithQuickAction[];

export const TOTAL_ROUTINE_ITEMS = routineSections.reduce(
  (count, section) => count + section.items.length,
  0,
);

export function getTotalRoutineItemCount(customFoods: readonly NutritionFood[] = []) {
  return getRoutineSections(customFoods).reduce((count, section) => count + section.items.length, 0);
}

export const TOTAL_POSSIBLE_SCORE = 100;

export function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getCompletedItemCount(routine: RoutineState, customFoods: readonly NutritionFood[] = []) {
  const nutritionCount = getNutritionFoods(customFoods).filter((food) => Number(routine[food.id] ?? 0) > 0).length;
  const activityCount = coreActivityKeys.filter((key) => routine[key]).length;
  return nutritionCount + activityCount;
}

export function getSectionMaxScore(sectionId: RoutineSectionId) {
  if (sectionId === "nutrition") return 40;
  if (sectionId === "training") return 40;
  return 20;
}

export function getNutritionSection(customFoods: readonly NutritionFood[] = []) {
  return getRoutineSections(customFoods).find((section) => section.id === "nutrition");
}

function getActivitySection() {
  return routineSections.find((section) => section.id === "training");
}

export function getNutritionItem(key: NutritionFoodId, customFoods: readonly NutritionFood[] = []) {
  const nutritionSection = getNutritionSection(customFoods);
  return nutritionSection?.items.find((item) => item.key === key) ?? null;
}

function getActivityItem(key: TrainingKey) {
  const trainingSection = getActivitySection();
  return trainingSection?.items.find((item) => item.key === key) ?? null;
}

function getNutritionQuantity(routine: RoutineState, key: NutritionFoodId) {
  return Math.max(0, Number(routine[key] ?? 0));
}

export function clampNutritionQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) {
    return 0;
  }

  return Math.max(0, Math.min(MAX_NUTRITION_QUANTITY, Math.round(quantity)));
}

export function getDietProteinIntake(routine: RoutineState, customFoods: readonly NutritionFood[] = []) {
  return getNutritionFoods(customFoods).reduce((sum, food) => {
    const item = getNutritionItem(food.id, customFoods);
    if (!item) {
      return sum;
    }

    return sum + getNutritionQuantity(routine, food.id) * (item.proteinGrams ?? 0);
  }, 0);
}

export function getRecommendedProtein(weightKg: number) {
  return Math.round(weightKg * 1.8);
}

export function getDietAssessment(routine: RoutineState, customFoods: readonly NutritionFood[] = []): DietAssessment {
  const items = getNutritionSection(customFoods)?.items ?? [];
  const totalProtein = getDietProteinIntake(routine, customFoods);

  const proteinFoodCount = items.filter((item) => {
    const nutritionKey = item.key as NutritionFoodId;
    return item.category && proteinCategories.has(item.category) && getNutritionQuantity(routine, nutritionKey) > 0;
  }).length;

  const fruitVegetableServings = items.reduce((sum, item) => {
    const nutritionKey = item.key as NutritionFoodId;
    if (!item.category || !produceCategories.has(item.category)) {
      return sum;
    }

    return sum + getNutritionQuantity(routine, nutritionKey);
  }, 0);

  const mealServings = items.reduce((sum, item) => {
    const nutritionKey = item.key as NutritionFoodId;
    if (item.category !== "proteinMeal") {
      return sum;
    }

    return sum + getNutritionQuantity(routine, nutritionKey);
  }, 0);

  const processedServings = items.reduce((sum, item) => {
    const nutritionKey = item.key as NutritionFoodId;
    if (item.category !== "processed") {
      return sum;
    }

    return sum + getNutritionQuantity(routine, nutritionKey);
  }, 0);

  const proteinScore =
    totalProtein >= 60 && proteinFoodCount >= 2
      ? 18
      : totalProtein >= 35
        ? 13
        : totalProtein >= 20
          ? 8
          : totalProtein > 0
            ? 3
            : 0;

  const produceScore = fruitVegetableServings >= 3 ? 10 : fruitVegetableServings >= 1 ? 5 : 0;
  const mealScore = mealServings >= 2 ? 6 : mealServings === 1 ? 3 : 0;

  let balanceScore = 0;
  if (totalProtein >= 45 && fruitVegetableServings >= 2 && mealServings >= 1 && processedServings <= 1) {
    balanceScore = 6;
  } else if (totalProtein >= 25 && fruitVegetableServings >= 1 && mealServings >= 1) {
    balanceScore = 3;
  }

  let score = proteinScore + produceScore + mealScore + balanceScore;
  if (processedServings >= 2 && totalProtein < 25 && fruitVegetableServings === 0) {
    score = Math.min(score, 14);
  }

  return {
    score,
    totalProtein,
    proteinFoodCount,
    fruitVegetableServings,
    mealServings,
    processedServings,
    proteinScore,
    produceScore,
    mealScore,
    balanceScore,
  };
}

export function calculateDietScore(routine: RoutineState, customFoods: readonly NutritionFood[] = []) {
  return getDietAssessment(routine, customFoods).score;
}

export function getTrainingAssessment(routine: RoutineState): TrainingAssessment {
  const trainingSection = getActivitySection();
  if (!trainingSection) {
    return {
      score: 0,
      mainScore: 0,
      secondaryBonus: 0,
      strengthScore: 0,
      recoveryScore: 0,
      hasPlannedRest: false,
      mainSessionLabel: null,
      secondarySessionLabel: null,
      strengthLabel: null,
      recoveryLabel: null,
      mainSessionCount: 0,
    };
  }

  const selectedItems = trainingSection.items.filter((item) => routine[item.key as TrainingKey]);
  const mainItems = selectedItems.filter((item) => item.role === "main");
  const strengthItems = selectedItems.filter((item) => item.role === "strength");
  const recoveryItems = selectedItems.filter((item) => item.role === "recovery");
  const hasPlannedRest = routine.plannedRest;

  const bestMainByGroup = new Map<TrainingGroup, RoutineItem>();
  for (const item of mainItems) {
    if (!item.group) continue;
    const current = bestMainByGroup.get(item.group);
    if (!current || (item.points ?? 0) > (current.points ?? 0)) {
      bestMainByGroup.set(item.group, item);
    }
  }

  const sortedMainSessions = [...bestMainByGroup.values()].sort(
    (left, right) => (right.points ?? 0) - (left.points ?? 0),
  );

  const mainSession = sortedMainSessions[0] ?? null;
  const secondarySession = sortedMainSessions[1] ?? null;
  const strongestBodyweight =
    [...strengthItems].sort((left, right) => (right.points ?? 0) - (left.points ?? 0))[0] ?? null;

  const mainScore = Math.min(28, mainSession?.points ?? 0);
  const secondaryBonus = secondarySession
    ? highValueMainKeys.has(secondarySession.key as TrainingKey)
      ? 4
      : 2
    : 0;
  const strengthScore = Math.min(4, strongestBodyweight?.points ?? 0);
  const recoveryWithoutRest = recoveryItems
    .filter((item) => item.key !== "plannedRest")
    .reduce((sum, item) => sum + (item.points ?? 0), 0);
  const plannedRestScore = hasPlannedRest && mainScore === 0 ? 5 : 0;
  const recoveryScore = Math.min(5, recoveryWithoutRest + plannedRestScore);
  const score =
    mainScore > 0
      ? Math.min(40, mainScore + secondaryBonus + strengthScore + recoveryScore)
      : Math.min(hasPlannedRest ? 8 : 6, strengthScore + recoveryScore);

  return {
    score,
    mainScore,
    secondaryBonus,
    strengthScore,
    recoveryScore,
    hasPlannedRest,
    mainSessionLabel: mainSession?.label ?? null,
    secondarySessionLabel: secondarySession?.label ?? null,
    strengthLabel: strongestBodyweight?.label ?? null,
    recoveryLabel: recoveryItems.length > 0 ? recoveryItems.map((item) => item.label).join(", ") : null,
    mainSessionCount: sortedMainSessions.length,
  };
}

export function calculateExerciseScore(routine: RoutineState) {
  return getTrainingAssessment(routine).score;
}

export function getFaithAssessment(routine: RoutineState): FaithAssessment {
  const coreScore =
    (routine.qt ? 5 : 0) +
    (routine.prayer ? 4 : 0) +
    (routine.worship ? 3 : 0) +
    (routine.bsc ? 2 : 0);
  const supportRawScore =
    (routine.gratitude ? 1 : 0) +
    (routine.godAwareness ? 2 : 0) +
    (routine.listeningToWord ? 3 : 0);
  const coreCount =
    Number(routine.qt) +
    Number(routine.prayer) +
    Number(routine.worship) +
    Number(routine.bsc);
  const supportCap = coreCount >= 3 ? 6 : coreCount >= 1 ? 5 : 3;
  const supportScore = Math.min(supportCap, supportRawScore);

  return {
    score: Math.min(20, coreScore + supportScore),
    coreScore,
    supportScore,
    supportRawScore,
    supportCap,
    coreCount,
    hasCoreFlow: routine.qt && routine.prayer,
    hasDepth: routine.worship || routine.bsc,
    hasWordListening: routine.listeningToWord,
    hasAwareness: routine.godAwareness,
  };
}

export function calculateFaithScore(routine: RoutineState) {
  return getFaithAssessment(routine).score;
}

export function getHobbyAssessment(routine: RoutineState): HobbyAssessment {
  const selectedItems = hobbySection.items.filter((item) => routine[item.key]);
  const bestByGroup = new Map<HobbyGroup, HobbyItem>();

  for (const item of selectedItems) {
    const current = bestByGroup.get(item.group);
    if (!current || item.points > current.points) {
      bestByGroup.set(item.group, item);
    }
  }

  const sortedGroups = [...bestByGroup.values()].sort((left, right) => right.points - left.points);
  const mainItem = sortedGroups[0] ?? null;
  const secondaryItem = sortedGroups[1] ?? null;
  const secondaryBonus = secondaryItem
    ? focusedHobbyKeys.has(secondaryItem.key)
      ? 2
      : 1
    : 0;

  return {
    score: Math.min(8, (mainItem?.points ?? 0) + secondaryBonus),
    mainScore: mainItem?.points ?? 0,
    secondaryBonus,
    mainLabel: mainItem ? `${mainItem.group} · ${mainItem.label}` : null,
    secondaryLabel: secondaryItem ? `${secondaryItem.group} · ${secondaryItem.label}` : null,
    practicedCount: sortedGroups.length,
  };
}

export function calculateExtraScore(routine: RoutineState) {
  return getHobbyAssessment(routine).score;
}

export function getDietFeedback(routine: RoutineState, customFoods: readonly NutritionFood[] = []) {
  const assessment = getDietAssessment(routine, customFoods);

  if (
    assessment.totalProtein >= 55 &&
    assessment.fruitVegetableServings >= 3 &&
    assessment.mealServings >= 1 &&
    assessment.processedServings === 0
  ) {
    return "단백질과 식사 균형이 좋다.";
  }

  if (assessment.totalProtein >= 45 && assessment.fruitVegetableServings >= 2) {
    return "단백질은 안정적이고 채소만 조금 더하면 된다.";
  }

  if (assessment.mealServings >= 1 && assessment.totalProtein < 35) {
    return "기본 식사는 반영됐고 단백질 보완이 필요하다.";
  }

  if (assessment.processedServings >= 2 && assessment.totalProtein < 30) {
    return "가공식 비중이 높고 회복 식사가 약하다.";
  }

  if (assessment.processedServings >= 1 && assessment.fruitVegetableServings >= 1) {
    return "전체 흐름은 괜찮고 가공식만 조금 줄이면 좋다.";
  }

  if (assessment.totalProtein < 20 && assessment.fruitVegetableServings === 0) {
    return "단백질과 채소가 모두 부족하다.";
  }

  if (assessment.totalProtein < 20) {
    return "단백질 식품을 한 번 더 추가하면 된다.";
  }

  if (assessment.fruitVegetableServings === 0) {
    return "단백질은 있고 채소·과일 보완이 필요하다.";
  }

  return "전체 흐름은 괜찮다.";
}

export function getExerciseFeedback(routine: RoutineState) {
  const assessment = getTrainingAssessment(routine);

  if (assessment.mainScore >= 24 && assessment.recoveryScore >= 3) {
    return `${assessment.mainSessionLabel}과 회복 균형이 좋다.`;
  }

  if (assessment.mainScore >= 24 && assessment.recoveryScore === 0) {
    return `${assessment.mainSessionLabel} 강도는 좋고 회복 보완이 필요하다.`;
  }

  if (assessment.mainScore >= 24) {
    return `${assessment.mainSessionLabel} 중심 메인 세션이 잘 반영됐다.`;
  }

  if (assessment.mainScore >= 16 && assessment.recoveryScore >= 3) {
    return `${assessment.mainSessionLabel}에 회복까지 더해졌다.`;
  }

  if (assessment.mainScore >= 16) {
    return `${assessment.mainSessionLabel} 중심 흐름이 잡혔다.`;
  }

  if (assessment.mainScore === 0 && assessment.hasPlannedRest && assessment.score >= 5) {
    return "계획 휴식은 반영됐지만 메인 훈련을 대신하진 않는다.";
  }

  if (assessment.mainScore === 0 && (assessment.strengthScore > 0 || assessment.recoveryScore > 0)) {
    return "회복은 반영됐지만 메인 세션은 비어 있다.";
  }

  return "메인 훈련이나 회복 루틴 하나만 먼저 남기면 된다.";
}

export function getFaithFeedback(routine: RoutineState) {
  const assessment = getFaithAssessment(routine);

  if (assessment.hasCoreFlow && assessment.hasDepth && assessment.hasWordListening) {
    return "QT·기도 중심에 말씀 흐름까지 연결됐다.";
  }

  if (assessment.hasCoreFlow && (assessment.hasDepth || assessment.hasWordListening)) {
    return "QT·기도 중심이 잡히고 말씀 루틴도 이어졌다.";
  }

  if (assessment.hasCoreFlow) {
    return "QT·기도 중심 흐름이 안정적이다.";
  }

  if (assessment.hasDepth && assessment.hasWordListening) {
    return "말씀 루틴은 반영됐다. QT나 기도가 더해지면 중심이 선다.";
  }

  if (assessment.hasWordListening || assessment.hasAwareness) {
    return "보조 루틴은 반영됐다. 핵심 루틴이 더해지면 점수가 커진다.";
  }

  if (assessment.score > 0) {
    return "짧은 신앙 루틴은 시작됐다.";
  }

  return "QT나 기도부터 짧게 다시 시작하면 된다.";
}

export function getHobbyFeedback(routine: RoutineState) {
  const assessment = getHobbyAssessment(routine);

  if (assessment.mainScore >= 6 && assessment.secondaryBonus >= 1) {
    return "핵심 루틴 외에 자기계발까지 탄탄하게 챙긴 날이다.";
  }

  if (assessment.mainScore >= 6) {
    return "오늘은 취미 몰입도도 좋았다.";
  }

  if (assessment.mainScore >= 4 && assessment.mainLabel) {
    return `${assessment.mainLabel}까지 차분하게 챙긴 날이다.`;
  }

  if (assessment.mainScore > 0) {
    return "짧게라도 취미 흐름이 이어졌다.";
  }

  return "기본 루틴 이후에 가볍게 더해도 충분하다.";
}

function getDietSummaryItems(routine: RoutineState, customFoods: readonly NutritionFood[] = []): SectionSummaryItem[] {
  const assessment = getDietAssessment(routine, customFoods);

  return [
    {
      label: "단백질",
      value:
        assessment.totalProtein >= 60 && assessment.proteinFoodCount >= 2
          ? "충족"
          : assessment.totalProtein >= 35
            ? "보완"
            : assessment.totalProtein > 0
              ? "부족"
              : "없음",
      tone:
        assessment.totalProtein >= 60 && assessment.proteinFoodCount >= 2
          ? "positive"
          : assessment.totalProtein >= 35
            ? "neutral"
            : "caution",
    },
    {
      label: "채소·과일",
      value:
        assessment.fruitVegetableServings >= 3
          ? "양호"
          : assessment.fruitVegetableServings >= 1
            ? "보완"
            : "부족",
      tone:
        assessment.fruitVegetableServings >= 3
          ? "positive"
          : assessment.fruitVegetableServings >= 1
            ? "neutral"
            : "caution",
    },
    {
      label: "기본 식사",
      value:
        assessment.mealServings >= 2 ? "안정적" : assessment.mealServings === 1 ? "반영됨" : "없음",
      tone:
        assessment.mealServings >= 2
          ? "positive"
          : assessment.mealServings === 1
            ? "neutral"
            : "caution",
    },
    {
      label: "가공식",
      value:
        assessment.processedServings === 0
          ? "낮음"
          : assessment.processedServings === 1
            ? "보통"
            : "높음",
      tone:
        assessment.processedServings === 0
          ? "positive"
          : assessment.processedServings === 1
            ? "neutral"
            : "caution",
    },
  ];
}

function getTrainingSummaryItems(routine: RoutineState): SectionSummaryItem[] {
  const assessment = getTrainingAssessment(routine);

  return [
    {
      label: "메인 훈련",
      value: assessment.mainScore > 0 ? "수행" : "없음",
      tone: assessment.mainScore > 0 ? "positive" : "caution",
    },
    {
      label: "추가 세션",
      value: assessment.secondaryBonus > 0 ? "있음" : "없음",
      tone: assessment.secondaryBonus > 0 ? "positive" : "neutral",
    },
    {
      label: "회복",
      value:
        assessment.recoveryScore >= 4 ? "챙김" : assessment.recoveryScore > 0 ? "일부" : "부족",
      tone:
        assessment.recoveryScore >= 4
          ? "positive"
          : assessment.recoveryScore > 0
            ? "neutral"
            : "caution",
    },
    {
      label: "계획 휴식",
      value: assessment.hasPlannedRest ? "반영됨" : "없음",
      tone: assessment.hasPlannedRest ? "positive" : "neutral",
    },
  ];
}

function getFaithSummaryItems(routine: RoutineState): SectionSummaryItem[] {
  const assessment = getFaithAssessment(routine);
  const wordFlowCount = Number(routine.worship) + Number(routine.bsc) + Number(routine.listeningToWord);

  return [
    {
      label: "핵심 루틴",
      value: assessment.hasCoreFlow ? "안정적" : assessment.coreCount >= 1 ? "진행 중" : "보완 필요",
      tone: assessment.hasCoreFlow ? "positive" : assessment.coreCount >= 1 ? "neutral" : "caution",
    },
    {
      label: "말씀 흐름",
      value: wordFlowCount >= 2 ? "충실" : wordFlowCount === 1 ? "포함" : "없음",
      tone: wordFlowCount >= 2 ? "positive" : wordFlowCount === 1 ? "neutral" : "caution",
    },
    {
      label: "말씀듣기",
      value: routine.listeningToWord ? "있음" : "없음",
      tone: routine.listeningToWord ? "positive" : "neutral",
    },
    {
      label: "하나님 의식",
      value: routine.godAwareness ? "있음" : "없음",
      tone: routine.godAwareness ? "positive" : "neutral",
    },
  ];
}

function getHobbySummaryItems(routine: RoutineState): SectionSummaryItem[] {
  const assessment = getHobbyAssessment(routine);

  return [
    {
      label: "메인 활동",
      value: assessment.mainLabel ? "있음" : "없음",
      tone: assessment.mainLabel ? "positive" : "caution",
    },
    {
      label: "추가 활동",
      value: assessment.secondaryBonus > 0 ? "있음" : "없음",
      tone: assessment.secondaryBonus > 0 ? "positive" : "neutral",
    },
    {
      label: "몰입도",
      value:
        assessment.mainScore >= 6
          ? "높음"
          : assessment.mainScore >= 4
            ? "보통"
            : assessment.mainScore > 0
              ? "가볍게"
              : "없음",
      tone:
        assessment.mainScore >= 6
          ? "positive"
          : assessment.mainScore >= 4
            ? "neutral"
            : assessment.mainScore > 0
              ? "neutral"
              : "caution",
    },
  ];
}

export function getSectionSummaryItems(
  sectionId: DetailSectionId,
  routine: RoutineState,
  customFoods: readonly NutritionFood[] = [],
): SectionSummaryItem[] {
  if (sectionId === "nutrition") return getDietSummaryItems(routine, customFoods);
  if (sectionId === "training") return getTrainingSummaryItems(routine);
  if (sectionId === "faith") return getFaithSummaryItems(routine);
  return getHobbySummaryItems(routine);
}

export function getSectionFeedback(
  sectionId: RoutineSectionId,
  routine: RoutineState,
  customFoods: readonly NutritionFood[] = [],
) {
  if (sectionId === "nutrition") return getDietFeedback(routine, customFoods);
  if (sectionId === "training") return getExerciseFeedback(routine);
  return getFaithFeedback(routine);
}

export function getOverallFeedback(baseScore: number, extraScore: number) {
  if (baseScore >= 80 && extraScore >= 4) {
    return "핵심과 extra 균형이 좋다.";
  }

  if (baseScore >= 80) {
    return "핵심 루틴 흐름이 안정적이다.";
  }

  if (baseScore < 50 && extraScore >= 4) {
    return "extra는 좋고 핵심 루틴 보완이 필요하다.";
  }

  if (baseScore >= 50 && extraScore >= 2) {
    return "기본 루틴 위에 extra가 더해졌다.";
  }

  if (baseScore >= 50) {
    return "핵심 루틴 몇 가지만 더 채우면 된다.";
  }

  if (extraScore > 0) {
    return "extra보다 핵심 루틴이 우선이다.";
  }

  if (baseScore >= 20) {
    return "좋은 출발이다. 필요한 루틴부터 채우면 된다.";
  }

  return "가장 작은 항목부터 다시 시작하면 된다.";
}

export function getTrainingGroupLabel(key: TrainingKey) {
  return getActivityItem(key)?.group ?? null;
}
