import { DetailSectionId, NutritionFood, RoutineState, SectionSummaryItem } from "../routineData";
import { detailSectionOrder } from "./dashboard-config";

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
