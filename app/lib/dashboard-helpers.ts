import {
  DetailSectionId,
  DailyRecords,
  FaithKey,
  HobbyKey,
  NutritionCategory,
  NutritionFood,
  RoutineState,
  SectionSummaryItem,
  TrainingKey,
} from "../routineData";
import { detailSectionOrder } from "./dashboard-config";

const nutritionCategoryOrder = new Map<NutritionCategory, number>([
  ["protein", 0],
  ["proteinMeal", 1],
  ["fruit", 2],
  ["vegetable", 3],
  ["processed", 4],
  ["snack", 5],
]);

const DEFAULT_FREQUENT_NUTRITION_LOOKBACK_DAYS = 14;

const trainingCompletionKeys = [
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

const faithCompletionKeys = [
  "qt",
  "prayer",
  "gratitude",
  "worship",
  "bsc",
  "listeningToWord",
  "godAwareness",
] as const satisfies readonly FaithKey[];

const hobbyCompletionKeys = [
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

export type TodayCompletionStatusItem = {
  id: "nutrition" | "training" | "faith" | "hobby";
  label: string;
  completed: boolean;
};

export type TodayCompletionStatus = {
  items: TodayCompletionStatusItem[];
  completedCount: number;
  totalCount: number;
  message: string;
};

export type FrequentNutritionFoodOptions = {
  limit?: number;
  lookbackDays?: number;
};

export function isDetailSectionId(value: string): value is DetailSectionId {
  return detailSectionOrder.includes(value as DetailSectionId);
}

export function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateString(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatLongDate(dateString: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(parseDateString(dateString));
}

export function formatArchiveDate(dateString: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    weekday: "short",
  }).format(parseDateString(dateString));
}

export function getPreviousDateString(dateString: string) {
  const date = parseDateString(dateString);
  date.setDate(date.getDate() - 1);
  return formatDateKey(date);
}

export function getTrailingDateRange(endDateString: string, duration: number) {
  return Array.from({ length: duration }, (_, offset) => {
    const date = parseDateString(endDateString);
    date.setDate(date.getDate() - offset);
    return formatDateKey(date);
  }).reverse();
}

export function hasNutritionEntry(routine: RoutineState, foods: readonly NutritionFood[]) {
  return foods.some((food) => Number(routine[food.id] ?? 0) > 0);
}

export function hasAnyRoutineEntry(routine: RoutineState) {
  return Object.values(routine).some((value) => (typeof value === "number" ? value > 0 : Boolean(value)));
}

export function getTodayCompletionStatus(
  routine: RoutineState,
  nutritionFoods: readonly NutritionFood[],
): TodayCompletionStatus {
  const items: TodayCompletionStatusItem[] = [
    {
      id: "nutrition",
      label: "식단",
      completed: hasNutritionEntry(routine, nutritionFoods),
    },
    {
      id: "training",
      label: "훈련",
      completed: trainingCompletionKeys.some((key) => Boolean(routine[key])),
    },
    {
      id: "faith",
      label: "신앙",
      completed: faithCompletionKeys.some((key) => Boolean(routine[key])),
    },
    {
      id: "hobby",
      label: "취미",
      completed: hobbyCompletionKeys.some((key) => Boolean(routine[key])),
    },
  ];
  const completedCount = items.filter((item) => item.completed).length;

  return {
    items,
    completedCount,
    totalCount: items.length,
    message:
      completedCount === 0
        ? "오늘 기록을 시작해보세요"
        : completedCount === items.length
          ? "오늘 루틴 기록 완료"
          : "조금만 더 채우면 좋아요",
  };
}

export function getFrequentNutritionFoods(
  records: DailyRecords,
  nutritionFoods: readonly NutritionFood[],
  options: FrequentNutritionFoodOptions = {},
) {
  const limit = options.limit ?? nutritionFoods.length;
  const lookbackDays = options.lookbackDays ?? DEFAULT_FREQUENT_NUTRITION_LOOKBACK_DAYS;
  const foodOrder = new Map(nutritionFoods.map((food, index) => [food.id, index]));
  const usageCount = new Map<string, number>();

  for (const date of Object.keys(records).sort().reverse().slice(0, lookbackDays)) {
    const record = records[date];

    for (const food of nutritionFoods) {
      if (Number(record?.[food.id] ?? 0) > 0) {
        usageCount.set(food.id, (usageCount.get(food.id) ?? 0) + 1);
      }
    }
  }

  return [...nutritionFoods]
    .sort((left, right) => {
      const usageDifference = (usageCount.get(right.id) ?? 0) - (usageCount.get(left.id) ?? 0);
      const leftCategoryOrder = nutritionCategoryOrder.get(left.category) ?? nutritionCategoryOrder.size;
      const rightCategoryOrder = nutritionCategoryOrder.get(right.category) ?? nutritionCategoryOrder.size;

      return (
        usageDifference ||
        leftCategoryOrder - rightCategoryOrder ||
        (foodOrder.get(left.id) ?? 0) - (foodOrder.get(right.id) ?? 0)
      );
    })
    .slice(0, limit);
}

export function formatAverageValue(value: number, maximumFractionDigits = 1) {
  return new Intl.NumberFormat("ko-KR", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
    maximumFractionDigits,
  }).format(value);
}

export function getAverageHealthLabel(value: number, maxScore: number) {
  const ratio = maxScore === 0 ? 0 : value / maxScore;

  if (ratio >= 0.72) return "좋음";
  return "보완 필요";
}

export function getOverallStatus(baseScore: number, extraScore: number) {
  if (baseScore >= 80 && extraScore >= 4) return "핵심과 extra의 균형";
  if (baseScore >= 80) return "안정적인 흐름";
  if (baseScore < 50 && extraScore >= 4) return "extra 반영, 핵심 보완 필요";
  if (baseScore >= 50) return "균형을 맞추는 중";
  if (extraScore > 0) return "extra는 진행 중";
  return "루틴 시작 전";
}

export function getSectionStatus(score: number, maxScore: number) {
  const ratio = score / maxScore;

  if (ratio >= 0.8) return "좋음";
  if (ratio >= 0.45) return "진행 중";
  return "시작 전";
}

export function getSummaryToneTextClass(tone: SectionSummaryItem["tone"]) {
  if (tone === "positive") return "text-slate-900";
  if (tone === "caution") return "text-[#8b5e3c]";
  return "text-slate-700";
}

export function generateCustomFoodId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `custom-food-${crypto.randomUUID()}`;
  }

  return `custom-food-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
