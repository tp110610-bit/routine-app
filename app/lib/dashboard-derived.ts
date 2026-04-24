import {
  DetailSectionId,
  NutritionFood,
  RoutineSection,
  RoutineState,
  SectionSummaryItem,
  calculateDietScore,
  calculateExerciseScore,
  calculateExtraScore,
  calculateFaithScore,
  getCompletedItemCount,
  getDietAssessment,
  getDietProteinIntake,
  getFaithAssessment,
  getHobbyAssessment,
  getTrainingAssessment,
  normalizeRoutineState,
} from "../routineData";
import { ArchiveSummary } from "./dashboard-config";
import { getTrailingDateRange, hasAnyRoutineEntry } from "./dashboard-helpers";

export function getDetailReasonItems(
  sectionId: DetailSectionId,
  routine: RoutineState,
  customFoods: readonly NutritionFood[] = [],
): SectionSummaryItem[] {
  if (sectionId === "nutrition") {
    const assessment = getDietAssessment(routine, customFoods);

    return [
      {
        label: "단백질",
        value:
          assessment.totalProtein >= 60 && assessment.proteinFoodCount >= 2
            ? "충분"
            : assessment.totalProtein >= 35
              ? "보완"
              : "부족",
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
            ? "충분"
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
        value: assessment.mealServings >= 2 ? "충분" : assessment.mealServings === 1 ? "반영됨" : "부족",
        tone:
          assessment.mealServings >= 2
            ? "positive"
            : assessment.mealServings === 1
              ? "neutral"
              : "caution",
      },
      {
        label: "가공식",
        value: assessment.processedServings === 0 ? "낮음" : assessment.processedServings === 1 ? "보통" : "높음",
        tone:
          assessment.processedServings === 0
            ? "positive"
            : assessment.processedServings === 1
              ? "neutral"
              : "caution",
      },
    ];
  }

  if (sectionId === "training") {
    const assessment = getTrainingAssessment(routine);

    return [
      {
        label: "메인 훈련",
        value: assessment.mainScore >= 24 ? "충분" : assessment.mainScore > 0 ? "반영됨" : "부족",
        tone: assessment.mainScore >= 24 ? "positive" : assessment.mainScore > 0 ? "neutral" : "caution",
      },
      {
        label: "추가 세션",
        value: assessment.secondaryBonus > 0 ? "반영됨" : "낮음",
        tone: assessment.secondaryBonus > 0 ? "positive" : "neutral",
      },
      {
        label: "회복",
        value: assessment.recoveryScore >= 4 ? "충분" : assessment.recoveryScore > 0 ? "보완" : "부족",
        tone:
          assessment.recoveryScore >= 4
            ? "positive"
            : assessment.recoveryScore > 0
              ? "neutral"
              : "caution",
      },
      {
        label: "휴식",
        value: assessment.hasPlannedRest ? "반영됨" : "낮음",
        tone: assessment.hasPlannedRest ? "positive" : "neutral",
      },
    ];
  }

  if (sectionId === "faith") {
    const assessment = getFaithAssessment(routine);
    const depthCount = Number(routine.worship) + Number(routine.bsc);
    const awarenessFlow = Number(routine.godAwareness) + Number(routine.listeningToWord);

    return [
      {
        label: "핵심 루틴",
        value: assessment.hasCoreFlow ? "충분" : assessment.coreCount >= 1 ? "보완" : "부족",
        tone: assessment.hasCoreFlow ? "positive" : assessment.coreCount >= 1 ? "neutral" : "caution",
      },
      {
        label: "보조 루틴",
        value: assessment.supportScore >= 4 ? "충분" : assessment.supportScore > 0 ? "반영됨" : "낮음",
        tone: assessment.supportScore >= 4 ? "positive" : assessment.supportScore > 0 ? "neutral" : "caution",
      },
      {
        label: "예배/BSC",
        value: depthCount >= 2 ? "충분" : depthCount === 1 ? "반영됨" : "낮음",
        tone: depthCount >= 2 ? "positive" : depthCount === 1 ? "neutral" : "caution",
      },
      {
        label: "의식 흐름",
        value: awarenessFlow >= 2 ? "충분" : awarenessFlow === 1 ? "반영됨" : "낮음",
        tone: awarenessFlow >= 2 ? "positive" : awarenessFlow === 1 ? "neutral" : "caution",
      },
    ];
  }

  const assessment = getHobbyAssessment(routine);

  return [
    {
      label: "메인 활동",
      value: assessment.mainScore >= 6 ? "충분" : assessment.mainScore > 0 ? "반영됨" : "부족",
      tone: assessment.mainScore >= 6 ? "positive" : assessment.mainScore > 0 ? "neutral" : "caution",
    },
    {
      label: "추가 활동",
      value: assessment.secondaryBonus > 0 ? "반영됨" : "낮음",
      tone: assessment.secondaryBonus > 0 ? "positive" : "neutral",
    },
    {
      label: "몰입도",
      value:
        assessment.mainScore >= 6
          ? "충분"
          : assessment.mainScore >= 4
            ? "보완"
            : assessment.mainScore > 0
              ? "낮음"
              : "부족",
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

export function getSavedDateSummaries(
  records: Record<string, Partial<RoutineState>>,
  customFoods: readonly NutritionFood[],
): ArchiveSummary[] {
  return Object.keys(records)
    .sort()
    .reverse()
    .map((date) => {
      const routine = normalizeRoutineState(records[date], customFoods);
      const nutrition = calculateDietScore(routine, customFoods);
      const training = calculateExerciseScore(routine);
      const faith = calculateFaithScore(routine);
      const extra = calculateExtraScore(routine);

      return {
        date,
        baseScore: nutrition + training + faith,
        totalScore: nutrition + training + faith + extra,
        extraScore: extra,
        completionCount: getCompletedItemCount(routine, customFoods),
        proteinIntake: getDietProteinIntake(routine, customFoods),
        nutritionScore: nutrition,
        trainingScore: training,
        faithScore: faith,
        hasData: hasAnyRoutineEntry(routine),
      };
    });
}

export type RecentSevenDaySummary = {
  startDate: string;
  endDate: string;
  loggedDays: number;
  hasLoggedData: boolean;
  streak: number;
  averageTotalScore: number;
  averageProtein: number;
  averageDietScore: number;
  averageTrainingScore: number;
  averageFaithScore: number;
  topTrainingItem: { label: string; count: number; points: number } | null;
  topFaithItem: { label: string; count: number; points: number } | null;
  weakestArea: { label: string; average: number; maxScore: number } | null;
  highestDay: { date: string; totalScore: number } | null;
  lowestDay: { date: string; totalScore: number } | null;
  aboveAverageDays: number;
  belowAverageDays: number;
  frequentWeakArea: { label: string; count: number } | null;
  missedFocusItems: Array<{ label: string; count: number }>;
};

export function getRecentSevenDaySummary(
  selectedDate: string,
  records: Record<string, Partial<RoutineState>>,
  customFoods: readonly NutritionFood[],
  sections: readonly RoutineSection[],
): RecentSevenDaySummary {
  const dates = getTrailingDateRange(selectedDate, 7);
  const trainingSection = sections.find((section) => section.id === "training");
  const faithSection = sections.find((section) => section.id === "faith");
  const entries = dates.map((date) => {
    const routine = normalizeRoutineState(records[date], customFoods);

    return {
      date,
      routine,
      hasData: hasAnyRoutineEntry(routine),
    };
  });
  const loggedEntries = entries.filter((entry) => entry.hasData);
  const loggedEntrySummaries = loggedEntries.map((entry) => {
    const dietAssessment = getDietAssessment(entry.routine, customFoods);
    const trainingAssessment = getTrainingAssessment(entry.routine);
    const faithAssessment = getFaithAssessment(entry.routine);
    const dietScore = dietAssessment.score;
    const trainingScore = trainingAssessment.score;
    const faithScore = faithAssessment.score;
    const extraScore = calculateExtraScore(entry.routine);
    const totalScore = dietScore + trainingScore + faithScore + extraScore;

    return {
      ...entry,
      dietAssessment,
      trainingAssessment,
      faithAssessment,
      dietScore,
      trainingScore,
      faithScore,
      extraScore,
      totalScore,
      proteinIntake: dietAssessment.totalProtein,
    };
  });
  const divisor = loggedEntrySummaries.length || 1;
  const sum = <T extends number>(selector: (entry: (typeof loggedEntrySummaries)[number]) => T) =>
    loggedEntrySummaries.reduce((total, entry) => total + selector(entry), 0);
  const countMostFrequentItem = (items: RoutineSection["items"]) => {
    const rankedItems = items
      .map((item) => ({
        label: item.label,
        count: loggedEntrySummaries.reduce((total, entry) => total + Number(Boolean(entry.routine[item.key])), 0),
        points: item.points ?? 0,
      }))
      .filter((item) => item.count > 0)
      .sort(
        (left, right) =>
          right.count - left.count ||
          right.points - left.points ||
          left.label.localeCompare(right.label, "ko-KR"),
      );

    return rankedItems[0] ?? null;
  };
  const averageDietScore =
    loggedEntrySummaries.length > 0 ? Number((sum((entry) => entry.dietScore) / divisor).toFixed(1)) : 0;
  const averageTrainingScore =
    loggedEntrySummaries.length > 0 ? Number((sum((entry) => entry.trainingScore) / divisor).toFixed(1)) : 0;
  const averageFaithScore =
    loggedEntrySummaries.length > 0 ? Number((sum((entry) => entry.faithScore) / divisor).toFixed(1)) : 0;
  const weakestArea =
    loggedEntrySummaries.length > 0
      ? [
          { label: "식단", average: averageDietScore, maxScore: 40 },
          { label: "훈련", average: averageTrainingScore, maxScore: 40 },
          { label: "신앙", average: averageFaithScore, maxScore: 20 },
        ].sort((left, right) => left.average - right.average)[0]
      : null;
  const dailyWeakAreaCounts = loggedEntrySummaries.reduce<Record<"식단" | "훈련" | "신앙", number>>(
    (counts, entry) => {
      const rankedAreas = [
        { label: "식단" as const, score: entry.dietScore, order: 0 },
        { label: "훈련" as const, score: entry.trainingScore, order: 1 },
        { label: "신앙" as const, score: entry.faithScore, order: 2 },
      ].sort((left, right) => left.score - right.score || left.order - right.order);

      counts[rankedAreas[0].label] += 1;
      return counts;
    },
    { 식단: 0, 훈련: 0, 신앙: 0 },
  );
  const frequentWeakArea =
    loggedEntrySummaries.length > 0
      ? Object.entries(dailyWeakAreaCounts)
          .map(([label, count]) => ({ label, count }))
          .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label, "ko-KR"))[0] ?? null
      : null;
  const missedFocusItems =
    loggedEntrySummaries.length > 0
      ? [
          { label: "QT", count: loggedEntrySummaries.reduce((total, entry) => total + Number(!entry.routine.qt), 0) },
          { label: "기도", count: loggedEntrySummaries.reduce((total, entry) => total + Number(!entry.routine.prayer), 0) },
          {
            label: "채소·과일",
            count: loggedEntrySummaries.reduce(
              (total, entry) => total + Number(entry.dietAssessment.fruitVegetableServings === 0),
              0,
            ),
          },
          {
            label: "단백질",
            count: loggedEntrySummaries.reduce(
              (total, entry) => total + Number(entry.dietAssessment.totalProtein < 35),
              0,
            ),
          },
          {
            label: "회복",
            count: loggedEntrySummaries.reduce(
              (total, entry) => total + Number(entry.trainingAssessment.recoveryScore === 0),
              0,
            ),
          },
          {
            label: "메인 훈련",
            count: loggedEntrySummaries.reduce(
              (total, entry) =>
                total + Number(entry.trainingAssessment.mainScore === 0 && !entry.trainingAssessment.hasPlannedRest),
              0,
            ),
          },
          {
            label: "하나님 의식",
            count: loggedEntrySummaries.reduce((total, entry) => total + Number(!entry.routine.godAwareness), 0),
          },
          {
            label: "말씀듣기",
            count: loggedEntrySummaries.reduce((total, entry) => total + Number(!entry.routine.listeningToWord), 0),
          },
        ]
          .filter((item) => item.count > 0)
          .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label, "ko-KR"))
          .slice(0, 2)
      : [];
  const averageTotalScore =
    loggedEntrySummaries.length > 0 ? Number((sum((entry) => entry.totalScore) / divisor).toFixed(1)) : 0;
  const highestDay =
    loggedEntrySummaries.length > 0
      ? [...loggedEntrySummaries].sort(
          (left, right) => right.totalScore - left.totalScore || right.date.localeCompare(left.date),
        )[0]
      : null;
  const lowestDay =
    loggedEntrySummaries.length > 0
      ? [...loggedEntrySummaries].sort(
          (left, right) => left.totalScore - right.totalScore || right.date.localeCompare(left.date),
        )[0]
      : null;
  const aboveAverageDays = loggedEntrySummaries.filter((entry) => entry.totalScore > averageTotalScore).length;
  const belowAverageDays = loggedEntrySummaries.filter((entry) => entry.totalScore < averageTotalScore).length;
  let streak = 0;

  for (const entry of [...entries].reverse()) {
    if (!entry.hasData) {
      break;
    }

    streak += 1;
  }

  return {
    startDate: dates[0],
    endDate: dates[dates.length - 1],
    loggedDays: loggedEntries.length,
    hasLoggedData: loggedEntries.length > 0,
    streak,
    averageTotalScore,
    averageProtein: loggedEntrySummaries.length > 0 ? Number((sum((entry) => entry.proteinIntake) / divisor).toFixed(1)) : 0,
    averageDietScore,
    averageTrainingScore,
    averageFaithScore,
    topTrainingItem: trainingSection ? countMostFrequentItem(trainingSection.items) : null,
    topFaithItem: faithSection ? countMostFrequentItem(faithSection.items) : null,
    weakestArea,
    highestDay: highestDay ? { date: highestDay.date, totalScore: highestDay.totalScore } : null,
    lowestDay: lowestDay ? { date: lowestDay.date, totalScore: lowestDay.totalScore } : null,
    aboveAverageDays,
    belowAverageDays,
    frequentWeakArea,
    missedFocusItems,
  };
}

export function getTodayPriority({
  routine,
  dietAssessment,
  trainingAssessment,
  proteinIntake,
  recommendedProtein,
  baseScore,
  extraScore,
}: {
  routine: RoutineState;
  dietAssessment: ReturnType<typeof getDietAssessment>;
  trainingAssessment: ReturnType<typeof getTrainingAssessment>;
  proteinIntake: number;
  recommendedProtein: number;
  baseScore: number;
  extraScore: number;
}) {
  if (dietAssessment.fruitVegetableServings === 0) {
    return {
      title: "채소·과일 1회 추가가 좋다",
      detail: "바나나, 방울토마토, 브로콜리 중 1회",
    };
  }

  if (proteinIntake < Math.max(35, Math.round(recommendedProtein * 0.35))) {
    return {
      title: "단백질 보완이 먼저다",
      detail: "그릭요거트, 더단백드링크, 닭가슴살 1회",
    };
  }

  if (trainingAssessment.mainScore >= 16 && trainingAssessment.recoveryScore === 0) {
    return {
      title: "오늘은 회복 루틴을 챙기자",
      detail: "스트레칭이나 회복 루틴만 더해도 충분해요.",
    };
  }

  if (
    trainingAssessment.mainScore === 0 &&
    trainingAssessment.recoveryScore === 0 &&
    !trainingAssessment.hasPlannedRest
  ) {
    return {
      title: "훈련 또는 회복 하나를 남기자",
      detail: "존2 러닝, 일반 라이딩, 계획 휴식 중 하나",
    };
  }

  if (!routine.qt && !routine.prayer) {
    return {
      title: "QT 또는 기도로 중심을 먼저 세우자",
      detail: "둘 중 하나만 먼저 체크해도 흐름이 잡혀요.",
    };
  }

  if (baseScore >= 70 && extraScore === 0) {
    return {
      title: "취미 기록을 가볍게 남기자",
      detail: "짧게라도 취미 기록을 남겨 보세요.",
    };
  }

  return {
    title: "지금 흐름을 이어가자",
    detail: "지금 페이스면 충분해요.",
  };
}
