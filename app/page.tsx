"use client";

import { ChangeEvent, startTransition, useEffect, useMemo, useRef, useState } from "react";
import {
  DailyRecords,
  DetailSectionId,
  NutritionFood,
  NutritionFoodId,
  NutritionQuickPreset,
  RoutineSectionId,
  RoutineState,
  TOTAL_POSSIBLE_SCORE,
  calculateDietScore,
  calculateExerciseScore,
  calculateExtraScore,
  calculateFaithScore,
  clampNutritionQuantity,
  defaultState,
  getCompletedItemCount,
  getDietAssessment,
  getDietProteinIntake,
  getFaithAssessment,
  getHobbyAssessment,
  getNutritionFoods,
  getRecommendedProtein,
  getRoutineSections,
  getTotalRoutineItemCount,
  getTrainingAssessment,
  getTodayString,
  normalizeRoutineState,
} from "./routineData";
import {
  FoodFormState,
  HYDRATION_SAFE_DATE,
  InlineNotice,
  ProteinSummary,
  UserProfile,
  defaultFoodForm,
  defaultProfile,
  detailSectionOrder,
  hobbyStyles,
  sectionStyles,
} from "./lib/dashboard-config";
import { getRecentSevenDaySummary, getSavedDateSummaries, getTodayPriority } from "./lib/dashboard-derived";
import {
  formatAverageValue,
  formatArchiveDate,
  formatLongDate,
  getAverageHealthLabel,
  getOverallStatus,
  getPreviousDateString,
  hasAnyRoutineEntry,
  hasNutritionEntry,
  isDetailSectionId,
  generateCustomFoodId,
} from "./lib/dashboard-helpers";
import {
  BACKUP_FILE_APP_ID,
  BACKUP_FILE_VERSION,
  CUSTOM_FOODS_STORAGE_KEY,
  DETAIL_STORAGE_KEY,
  FAVORITE_FOODS_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
  STORAGE_KEY,
  loadStoredCustomFoods,
  loadStoredFavoriteFoodIds,
  loadStoredProfile,
  loadStoredRecords,
  normalizeStoredCustomFoods,
  normalizeStoredFavoriteFoodIds,
  normalizeStoredProfile,
  normalizeStoredRecords,
  parseImportedBackup,
} from "./lib/dashboard-storage";
import { DashboardHero } from "./components/dashboard/DashboardHero";
import { WeeklySummarySection } from "./components/dashboard/WeeklySummarySection";
import { HistorySection } from "./components/dashboard/HistorySection";
import { DataManagementPanel } from "./components/dashboard/DataManagementPanel";
import { HobbyCard } from "./components/dashboard/HobbyCard";
import { SectionCard } from "./components/dashboard/SectionCard";
import {
  EmptyStatePanel,
  SummaryCard,
  WeeklyAverageCardData,
  WeeklyInsightChipData,
} from "./components/dashboard/Primitives";

function copyNutritionQuantities(
  targetRoutine: RoutineState,
  sourceRoutine: Partial<RoutineState> | null | undefined,
  foods: readonly NutritionFood[],
  customFoods: readonly NutritionFood[],
) {
  const normalizedSource = normalizeRoutineState(sourceRoutine, customFoods);
  const nextRoutine: RoutineState = { ...targetRoutine };

  for (const food of foods) {
    nextRoutine[food.id] = clampNutritionQuantity(Number(normalizedSource[food.id] ?? 0));
  }

  return nextRoutine;
}

type BackupPayload = {
  app: typeof BACKUP_FILE_APP_ID;
  version: number;
  exportedAt: string;
  records: DailyRecords;
  customFoods: NutritionFood[];
  profile: UserProfile;
  favoriteFoodIds: string[];
};

export default function Home() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [selectedDate, setSelectedDate] = useState(HYDRATION_SAFE_DATE);
  const [records, setRecords] = useState<DailyRecords>({});
  const [customFoods, setCustomFoods] = useState<NutritionFood[]>([]);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [weightInput, setWeightInput] = useState(() => String(defaultProfile.weightKg));
  const [favoriteFoodIds, setFavoriteFoodIds] = useState<string[]>([]);
  const [activeDetail, setActiveDetail] = useState<DetailSectionId>("training");
  const [isFoodFormOpen, setIsFoodFormOpen] = useState(false);
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [foodForm, setFoodForm] = useState<FoodFormState>(defaultFoodForm);
  const [foodFormError, setFoodFormError] = useState<string | null>(null);
  const [nutritionMessage, setNutritionMessage] = useState<InlineNotice | null>(null);
  const [dataManagementMessage, setDataManagementMessage] = useState<InlineNotice | null>(null);
  const importFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const storedCustomFoods = loadStoredCustomFoods();
    const storedProfile = loadStoredProfile();

    setCustomFoods(storedCustomFoods);
    setRecords(loadStoredRecords(storedCustomFoods));
    setProfile(storedProfile);
    setWeightInput(String(storedProfile.weightKg));
    setFavoriteFoodIds(loadStoredFavoriteFoodIds(storedCustomFoods));
    setSelectedDate(getTodayString());

    if (typeof window !== "undefined") {
      const savedDetail = window.localStorage.getItem(DETAIL_STORAGE_KEY);
      if (savedDetail && isDetailSectionId(savedDetail)) {
        startTransition(() => {
          setActiveDetail(savedDetail);
        });
      }
    }

    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [hasHydrated, records]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    window.localStorage.setItem(CUSTOM_FOODS_STORAGE_KEY, JSON.stringify(customFoods));
  }, [customFoods, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }, [hasHydrated, profile]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    window.localStorage.setItem(FAVORITE_FOODS_STORAGE_KEY, JSON.stringify(favoriteFoodIds));
  }, [favoriteFoodIds, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    window.localStorage.setItem(DETAIL_STORAGE_KEY, activeDetail);
  }, [activeDetail, hasHydrated]);

  const nutritionFoods = useMemo(() => getNutritionFoods(customFoods), [customFoods]);
  const routineSectionsWithNutrition = useMemo(() => getRoutineSections(customFoods), [customFoods]);

  useEffect(() => {
    setRecords((previous) => normalizeStoredRecords(previous, customFoods));
  }, [customFoods]);

  useEffect(() => {
    setFavoriteFoodIds((previous) => normalizeStoredFavoriteFoodIds(previous, nutritionFoods));
  }, [nutritionFoods]);

  const currentRoutine = useMemo(
    () => normalizeRoutineState(records[selectedDate] ?? defaultState, customFoods),
    [customFoods, records, selectedDate],
  );
  const favoriteFoods = useMemo(
    () =>
      favoriteFoodIds.flatMap((foodId) => {
        const matched = nutritionFoods.find((food) => food.id === foodId);
        return matched ? [matched] : [];
      }),
    [favoriteFoodIds, nutritionFoods],
  );
  const recentFoods = useMemo(() => {
    const usageMap = new Map<
      string,
      {
        food: NutritionFood;
        count: number;
        latestDate: string;
      }
    >();

    for (const date of Object.keys(records).sort().reverse()) {
      const routine = normalizeRoutineState(records[date], customFoods);

      for (const food of nutritionFoods) {
        const quantity = Number(routine[food.id] ?? 0);
        if (quantity <= 0) {
          continue;
        }

        const currentUsage = usageMap.get(food.id);
        if (!currentUsage) {
          usageMap.set(food.id, {
            food,
            count: quantity,
            latestDate: date,
          });
          continue;
        }

        currentUsage.count += quantity;
      }
    }

    return [...usageMap.values()]
      .filter((entry) => !favoriteFoodIds.includes(entry.food.id))
      .sort(
        (left, right) =>
          right.latestDate.localeCompare(left.latestDate) ||
          right.count - left.count ||
          left.food.label.localeCompare(right.food.label, "ko-KR"),
      )
      .slice(0, 5)
      .map((entry) => entry.food);
  }, [records, customFoods, nutritionFoods, favoriteFoodIds]);

  const updateActivity = (key: keyof RoutineState, checked: boolean) => {
    setRecords((previous) => ({
      ...previous,
      [selectedDate]: normalizeRoutineState(
        {
          ...(previous[selectedDate] ?? defaultState),
          [key]: checked,
        },
        customFoods,
      ),
    }));
  };

  const setNutritionQuantity = (key: NutritionFoodId, quantity: number) => {
    const safeQuantity = clampNutritionQuantity(quantity);

    setRecords((previous) => ({
      ...previous,
      [selectedDate]: normalizeRoutineState(
        {
          ...(previous[selectedDate] ?? defaultState),
          [key]: safeQuantity,
        },
        customFoods,
      ),
    }));
    setNutritionMessage(null);
  };

  const incrementNutritionFood = (key: NutritionFoodId) => {
    setRecords((previous) => {
      const current = normalizeRoutineState(previous[selectedDate] ?? defaultState, customFoods);

      return {
        ...previous,
        [selectedDate]: normalizeRoutineState(
          {
            ...current,
            [key]: clampNutritionQuantity(Number(current[key] ?? 0) + 1),
          },
          customFoods,
        ),
      };
    });
    setNutritionMessage(null);
  };

  const toggleFavoriteFood = (foodId: string) => {
    setFavoriteFoodIds((previous) => {
      if (previous.includes(foodId)) {
        return previous.filter((id) => id !== foodId);
      }

      return normalizeStoredFavoriteFoodIds([...previous, foodId], nutritionFoods);
    });
  };

  const applyNutritionPreset = (preset: NutritionQuickPreset) => {
    let changedItems = 0;

    setRecords((previous) => {
      const current = normalizeRoutineState(previous[selectedDate] ?? defaultState, customFoods);
      const nextRoutine: RoutineState = { ...current };

      for (const item of preset.items) {
        const currentQuantity = Number(current[item.key] ?? 0);
        const nextQuantity = Math.max(currentQuantity, item.quantity);

        nextRoutine[item.key] = nextQuantity;
        if (nextQuantity > currentQuantity) {
          changedItems += 1;
        }
      }

      return {
        ...previous,
        [selectedDate]: normalizeRoutineState(nextRoutine, customFoods),
      };
    });

    setNutritionMessage(
      changedItems > 0
        ? {
            tone: "success",
            text:
              preset.id === "today-default"
                ? `오늘 기본 식단을 넣었어요. 비어 있던 ${changedItems}개 항목만 채웠습니다.`
                : `${preset.label} 프리셋으로 ${changedItems}개 항목을 채웠어요.`,
          }
        : {
            tone: "neutral",
            text:
              preset.id === "today-default"
                ? "이미 오늘 기본 식단 수량이 들어 있어요."
                : `${preset.label} 프리셋은 이미 반영돼 있어요.`,
          },
    );
  };

  const copyPreviousNutrition = () => {
    const previousDate = getPreviousDateString(selectedDate);
    const previousRecord = records[previousDate];

    if (!previousRecord) {
      setNutritionMessage({
        tone: "error",
        text: `${formatLongDate(previousDate)} 식단 기록이 없어요.`,
      });
      return;
    }

    if (!hasNutritionEntry(normalizeRoutineState(previousRecord, customFoods), nutritionFoods)) {
      setNutritionMessage({
        tone: "error",
        text: `${formatLongDate(previousDate)}에는 복사할 식단 수량이 없어요.`,
      });
      return;
    }

    if (
      hasNutritionEntry(currentRoutine, nutritionFoods) &&
      !window.confirm(
        `${formatLongDate(previousDate)} 식단을 ${formatLongDate(selectedDate)}에 덮어쓸까요? 현재 날짜의 식단 수량만 바뀌고 운동, 신앙, 취미 기록은 유지됩니다.`,
      )
    ) {
      return;
    }

    setRecords((previous) => {
      const targetRoutine = normalizeRoutineState(previous[selectedDate] ?? defaultState, customFoods);

      return {
        ...previous,
        [selectedDate]: copyNutritionQuantities(targetRoutine, previousRecord, nutritionFoods, customFoods),
      };
    });
    setNutritionMessage({
      tone: "success",
      text: `${formatLongDate(previousDate)} 식단을 ${formatLongDate(selectedDate)}로 복사했어요.`,
    });
  };

  const resetCurrentDate = () => {
    setRecords((previous) => ({
      ...previous,
      [selectedDate]: normalizeRoutineState(defaultState, customFoods),
    }));
    setNutritionMessage(null);
  };

  const resetFoodForm = () => {
    setFoodForm(defaultFoodForm);
    setEditingFoodId(null);
    setFoodFormError(null);
  };

  const closeFoodForm = () => {
    resetFoodForm();
    setIsFoodFormOpen(false);
  };

  const openCreateFoodForm = () => {
    resetFoodForm();
    setIsFoodFormOpen(true);
  };

  const handleFoodFormChange = (key: keyof FoodFormState, value: string) => {
    setFoodForm((previous) => ({ ...previous, [key]: value }));
    setFoodFormError(null);
  };

  const handleEditFood = (food: NutritionFood) => {
    setFoodForm({
      label: food.label,
      proteinGrams: String(food.proteinGrams),
      unitLabel: food.unitLabel,
      category: food.category,
    });
    setEditingFoodId(food.id);
    setFoodFormError(null);
    setIsFoodFormOpen(true);
  };

  const handleDeleteFood = (foodId: string) => {
    setCustomFoods((previous) => previous.filter((food) => food.id !== foodId));
    if (editingFoodId === foodId) {
      closeFoodForm();
    }
    setNutritionMessage({
      tone: "neutral",
      text: "커스텀 음식이 삭제되었습니다. 저장된 기록에서도 제외됩니다.",
    });
  };

  const handleSaveFood = () => {
    const label = foodForm.label.trim();
    const unitLabel = foodForm.unitLabel.trim();
    const proteinGrams = Number.parseFloat(foodForm.proteinGrams);

    if (!label) {
      setFoodFormError("음식명을 입력해 주세요.");
      return;
    }

    if (!unitLabel) {
      setFoodFormError("단위명을 입력해 주세요.");
      return;
    }

    if (!Number.isFinite(proteinGrams) || proteinGrams < 0) {
      setFoodFormError("단백질은 0 이상 숫자로 입력해 주세요.");
      return;
    }

    const normalizedFood: NutritionFood = {
      id: editingFoodId ?? generateCustomFoodId(),
      label,
      proteinGrams: Number(proteinGrams.toFixed(1)),
      unitLabel,
      category: foodForm.category,
      isCustom: true,
    };

    setCustomFoods((previous) => {
      if (editingFoodId) {
        return previous.map((food) => (food.id === editingFoodId ? normalizedFood : food));
      }

      return [...previous, normalizedFood];
    });

    closeFoodForm();
  };

  const handleWeightChange = (value: string) => {
    setWeightInput(value);

    const parsed = Number.parseFloat(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return;
    }

    setProfile((previous) => ({
      ...previous,
      weightKg: Number(parsed.toFixed(1)),
    }));
  };

  const handleWeightBlur = () => {
    const parsed = Number.parseFloat(weightInput);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      setWeightInput(String(profile.weightKg));
      return;
    }

    const normalizedWeight = Number(parsed.toFixed(1));
    setProfile((previous) => ({
      ...previous,
      weightKg: normalizedWeight,
    }));
    setWeightInput(String(normalizedWeight));
  };

  const openImportFilePicker = () => {
    setDataManagementMessage(null);

    if (!importFileInputRef.current) {
      return;
    }

    importFileInputRef.current.value = "";
    importFileInputRef.current.click();
  };

  const exportAllData = () => {
    const exportRecordCount = Object.keys(records).length;
    const isMostlyEmpty = exportRecordCount === 0 && customFoods.length === 0 && favoriteFoodIds.length === 0;
    const payload: BackupPayload = {
      app: BACKUP_FILE_APP_ID,
      version: BACKUP_FILE_VERSION,
      exportedAt: new Date().toISOString(),
      records: normalizeStoredRecords(records, customFoods),
      customFoods: normalizeStoredCustomFoods(customFoods),
      profile: normalizeStoredProfile(profile),
      favoriteFoodIds: normalizeStoredFavoriteFoodIds(favoriteFoodIds, nutritionFoods),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = `routine-backup-${selectedDate}.json`;
    link.click();
    URL.revokeObjectURL(downloadUrl);

    setDataManagementMessage({
      tone: isMostlyEmpty ? "neutral" : "success",
      text: isMostlyEmpty
        ? "내보낼 데이터가 많지 않지만 현재 상태를 백업했습니다."
        : `${selectedDate} 기준 백업 파일을 내보냈습니다.`,
    });
  };

  const handleImportFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const isJsonFile =
        file.name.toLowerCase().endsWith(".json") || file.type === "application/json" || file.type === "";

      if (!isJsonFile) {
        setDataManagementMessage({
          tone: "error",
          text: "불러올 수 없는 파일입니다. JSON 파일만 지원합니다.",
        });
        return;
      }

      const rawText = await file.text();
      const parsed = JSON.parse(rawText) as unknown;
      const result = parseImportedBackup(parsed);

      if (!result.ok) {
        setDataManagementMessage({ tone: "error", text: result.error });
        return;
      }

      const importedRecordCount = Object.keys(result.data.records).length;
      const shouldImport = window.confirm(
        `현재 데이터를 이 파일로 교체할까요?\n기록 ${importedRecordCount}일, 커스텀 음식 ${result.data.customFoods.length}개를 불러옵니다.`,
      );

      if (!shouldImport) {
        setDataManagementMessage({
          tone: "neutral",
          text: "데이터 불러오기를 취소했습니다.",
        });
        return;
      }

      setCustomFoods(result.data.customFoods);
      setRecords(result.data.records);
      setProfile(result.data.profile);
      setWeightInput(String(result.data.profile.weightKg));
      setFavoriteFoodIds(result.data.favoriteFoodIds);
      closeFoodForm();
      setNutritionMessage(null);
      setDataManagementMessage({
        tone: result.warnings.length > 0 ? "neutral" : "success",
        text:
          result.warnings.length > 0
            ? `일부 데이터만 복원되었습니다. ${result.warnings.join(" · ")}`
            : importedRecordCount > 0
              ? `${importedRecordCount}일치 데이터를 불러왔습니다.`
              : "데이터를 불러왔습니다. 기록은 아직 없습니다.",
      });
    } catch (error) {
      console.error("백업 파일을 가져오는 중 오류가 발생했습니다.", error);
      setDataManagementMessage({
        tone: "error",
        text: "데이터 형식이 올바르지 않습니다.",
      });
    } finally {
      event.target.value = "";
    }
  };

  const resetAllData = () => {
    const shouldReset = window.confirm("전체 초기화를 진행할까요? 기록, 커스텀 음식, 즐겨찾기, 프로필이 삭제됩니다.");

    if (!shouldReset) {
      setDataManagementMessage({
        tone: "neutral",
        text: "초기화 전에 다시 확인해 주세요.",
      });
      return;
    }

    const shouldResetAgain = window.confirm("초기화 후에는 되돌릴 수 없습니다. 정말 진행할까요?");

    if (!shouldResetAgain) {
      setDataManagementMessage({
        tone: "neutral",
        text: "초기화를 취소했습니다.",
      });
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(CUSTOM_FOODS_STORAGE_KEY);
      window.localStorage.removeItem(PROFILE_STORAGE_KEY);
      window.localStorage.removeItem(FAVORITE_FOODS_STORAGE_KEY);
    }

    setRecords({});
    setCustomFoods([]);
    setProfile(defaultProfile);
    setWeightInput(String(defaultProfile.weightKg));
    setFavoriteFoodIds([]);
    setSelectedDate(getTodayString());
    closeFoodForm();
    setNutritionMessage(null);
    setDataManagementMessage({
      tone: "success",
      text: "모든 데이터를 초기화했습니다.",
    });
  };

  const sectionScores = useMemo<Record<RoutineSectionId, number>>(
    () => ({
      nutrition: calculateDietScore(currentRoutine, customFoods),
      training: calculateExerciseScore(currentRoutine),
      faith: calculateFaithScore(currentRoutine),
    }),
    [currentRoutine, customFoods],
  );

  const dietAssessment = getDietAssessment(currentRoutine, customFoods);
  const faithAssessment = getFaithAssessment(currentRoutine);
  const trainingAssessment = getTrainingAssessment(currentRoutine);
  const hobbyAssessment = getHobbyAssessment(currentRoutine);
  const faithCompletedCount = [
    currentRoutine.qt,
    currentRoutine.prayer,
    currentRoutine.gratitude,
    currentRoutine.worship,
    currentRoutine.bsc,
    currentRoutine.godAwareness,
    currentRoutine.listeningToWord,
  ].filter(Boolean).length;
  const proteinIntake = getDietProteinIntake(currentRoutine, customFoods);
  const recommendedProtein = getRecommendedProtein(profile.weightKg);
  const proteinRatio = recommendedProtein === 0 ? 0 : Math.min(proteinIntake / recommendedProtein, 1);
  const baseScore = sectionScores.nutrition + sectionScores.training + sectionScores.faith;
  const extraScore = calculateExtraScore(currentRoutine);
  const totalScore = baseScore + extraScore;
  const totalRoutineItems = getTotalRoutineItemCount(customFoods);
  const completedCount = getCompletedItemCount(currentRoutine, customFoods);
  const proteinSummary: ProteinSummary = {
    intake: proteinIntake,
    recommended: recommendedProtein,
    ratio: proteinRatio,
  };

  const savedDateSummaries = useMemo(
    () => getSavedDateSummaries(records, customFoods),
    [records, customFoods],
  );

  const recentSevenDaySummary = useMemo(
    () => getRecentSevenDaySummary(selectedDate, records, customFoods, routineSectionsWithNutrition),
    [selectedDate, records, customFoods, routineSectionsWithNutrition],
  );

  const faithHeadline = (() => {
    const activeFaithItems = [
      currentRoutine.qt ? "QT" : null,
      currentRoutine.prayer ? "기도" : null,
      currentRoutine.worship ? "예배" : null,
      currentRoutine.listeningToWord ? "말씀듣기" : null,
      currentRoutine.bsc ? "BSC" : null,
      currentRoutine.gratitude ? "감사" : null,
      currentRoutine.godAwareness ? "하나님 의식" : null,
    ].filter(Boolean);

    return activeFaithItems.length > 0 ? activeFaithItems.join(" · ") : "핵심 루틴 대기";
  })();

  const todayPriority = getTodayPriority({
    routine: currentRoutine,
    dietAssessment,
    trainingAssessment,
    proteinIntake,
    recommendedProtein,
    baseScore,
    extraScore,
  });

  const weeklyAverageCards: WeeklyAverageCardData[] = [
    {
      label: "평균 총점",
      value: hasHydrated
        ? recentSevenDaySummary.hasLoggedData
          ? `${formatAverageValue(recentSevenDaySummary.averageTotalScore)}점`
          : "기록 부족"
        : "불러오는 중",
      detail: hasHydrated
        ? recentSevenDaySummary.hasLoggedData
          ? getAverageHealthLabel(recentSevenDaySummary.averageTotalScore, TOTAL_POSSIBLE_SCORE)
          : "최근 7일 기록이 없어요."
        : "최근 7일을 불러오고 있어요.",
    },
    {
      label: "평균 단백질",
      value: hasHydrated
        ? recentSevenDaySummary.hasLoggedData
          ? `${formatAverageValue(recentSevenDaySummary.averageProtein)}g`
          : "기록 부족"
        : "불러오는 중",
      detail: hasHydrated
        ? recentSevenDaySummary.hasLoggedData
          ? recentSevenDaySummary.averageProtein >= Math.max(35, recommendedProtein * 0.72)
            ? "좋음"
            : "보완 필요"
          : "단백질 기록이 부족해요."
        : `권장 ${recommendedProtein}g 기준`,
    },
    {
      label: "평균 식단",
      value: hasHydrated
        ? recentSevenDaySummary.hasLoggedData
          ? `${formatAverageValue(recentSevenDaySummary.averageDietScore)} / 40`
          : "기록 부족"
        : "불러오는 중",
      detail: hasHydrated
        ? recentSevenDaySummary.hasLoggedData
          ? getAverageHealthLabel(recentSevenDaySummary.averageDietScore, 40)
          : "식단 기록이 부족해요."
        : "식단 점수",
    },
    {
      label: "평균 훈련",
      value: hasHydrated
        ? recentSevenDaySummary.hasLoggedData
          ? `${formatAverageValue(recentSevenDaySummary.averageTrainingScore)} / 40`
          : "기록 부족"
        : "불러오는 중",
      detail: hasHydrated
        ? recentSevenDaySummary.hasLoggedData
          ? getAverageHealthLabel(recentSevenDaySummary.averageTrainingScore, 40)
          : "훈련 기록이 부족해요."
        : "훈련 점수",
    },
    {
      label: "평균 신앙",
      value: hasHydrated
        ? recentSevenDaySummary.hasLoggedData
          ? `${formatAverageValue(recentSevenDaySummary.averageFaithScore)} / 20`
          : "기록 부족"
        : "불러오는 중",
      detail: hasHydrated
        ? recentSevenDaySummary.hasLoggedData
          ? getAverageHealthLabel(recentSevenDaySummary.averageFaithScore, 20)
          : "신앙 기록이 부족해요."
        : "신앙 점수",
    },
  ];

  const weeklyInsightChips: WeeklyInsightChipData[] = [
    {
      label: "기록 일수",
      value: hasHydrated ? `${recentSevenDaySummary.loggedDays} / 7일` : "불러오는 중",
      detail: hasHydrated ? "실제 기록 기준" : undefined,
      tone: "default" as const,
    },
    {
      label: "streak",
      value: hasHydrated ? `${recentSevenDaySummary.streak}일` : "불러오는 중",
      detail: hasHydrated ? "선택 날짜부터 연속" : undefined,
      tone: "default" as const,
    },
    {
      label: "자주 한 훈련",
      value: hasHydrated
        ? recentSevenDaySummary.topTrainingItem?.label ?? (recentSevenDaySummary.hasLoggedData ? "없음" : "기록 부족")
        : "불러오는 중",
      detail: hasHydrated && recentSevenDaySummary.topTrainingItem ? `${recentSevenDaySummary.topTrainingItem.count}회` : undefined,
      tone: "default" as const,
    },
    {
      label: "자주 한 신앙",
      value: hasHydrated
        ? recentSevenDaySummary.topFaithItem?.label ?? (recentSevenDaySummary.hasLoggedData ? "없음" : "기록 부족")
        : "불러오는 중",
      detail: hasHydrated && recentSevenDaySummary.topFaithItem ? `${recentSevenDaySummary.topFaithItem.count}회` : undefined,
      tone: "default" as const,
    },
    {
      label: "보완 영역",
      value: hasHydrated ? recentSevenDaySummary.weakestArea?.label ?? "기록 부족" : "불러오는 중",
      detail:
        hasHydrated && recentSevenDaySummary.weakestArea
          ? `평균 ${formatAverageValue(recentSevenDaySummary.weakestArea.average)} / ${recentSevenDaySummary.weakestArea.maxScore}`
          : undefined,
      tone: hasHydrated && recentSevenDaySummary.weakestArea ? "caution" : "default",
    },
  ];

  const retrospectiveCards: WeeklyAverageCardData[] = [
    {
      label: "최고 점수",
      value: hasHydrated
        ? recentSevenDaySummary.highestDay
          ? formatArchiveDate(recentSevenDaySummary.highestDay.date)
          : "기록 부족"
        : "불러오는 중",
      detail:
        hasHydrated && recentSevenDaySummary.highestDay
          ? `${recentSevenDaySummary.highestDay.totalScore}점`
          : hasHydrated
            ? "최근 7일 비교 불가"
            : "최근 기록을 불러오는 중",
    },
    {
      label: "최저 점수",
      value: hasHydrated
        ? recentSevenDaySummary.lowestDay
          ? formatArchiveDate(recentSevenDaySummary.lowestDay.date)
          : "기록 부족"
        : "불러오는 중",
      detail:
        hasHydrated && recentSevenDaySummary.lowestDay
          ? `${recentSevenDaySummary.lowestDay.totalScore}점`
          : hasHydrated
            ? "최근 7일 비교 불가"
            : "최근 기록을 불러오는 중",
    },
    {
      label: "평균 이상",
      value: hasHydrated ? `${recentSevenDaySummary.aboveAverageDays}일` : "불러오는 중",
      detail: hasHydrated ? "최근 7일 평균보다 높음" : "최근 기록을 불러오는 중",
    },
    {
      label: "평균 이하",
      value: hasHydrated ? `${recentSevenDaySummary.belowAverageDays}일` : "불러오는 중",
      detail: hasHydrated ? "최근 7일 평균보다 낮음" : "최근 기록을 불러오는 중",
    },
  ];

  const retrospectiveChips: WeeklyInsightChipData[] = [
    {
      label: "최근 흐름",
      value: hasHydrated
        ? recentSevenDaySummary.aboveAverageDays > recentSevenDaySummary.belowAverageDays
          ? "상승 흐름"
          : recentSevenDaySummary.aboveAverageDays < recentSevenDaySummary.belowAverageDays
            ? "보완 흐름"
            : recentSevenDaySummary.hasLoggedData
              ? "균형 유지"
              : "기록 부족"
        : "불러오는 중",
      detail: hasHydrated ? "평균 대비 비교" : undefined,
    },
    {
      label: "가장 부족한 영역",
      value: hasHydrated ? recentSevenDaySummary.frequentWeakArea?.label ?? "기록 부족" : "불러오는 중",
      detail: hasHydrated && recentSevenDaySummary.frequentWeakArea ? `${recentSevenDaySummary.frequentWeakArea.count}일` : undefined,
      tone: hasHydrated && recentSevenDaySummary.frequentWeakArea ? "caution" : "default",
    },
    {
      label: "자주 놓친 항목",
      value: hasHydrated
        ? recentSevenDaySummary.missedFocusItems.length > 0
          ? recentSevenDaySummary.missedFocusItems.map((item) => item.label).join(" · ")
          : recentSevenDaySummary.hasLoggedData
            ? "뚜렷한 누락 없음"
            : "기록 부족"
        : "불러오는 중",
      detail:
        hasHydrated && recentSevenDaySummary.missedFocusItems.length > 0
          ? recentSevenDaySummary.missedFocusItems.map((item) => `${item.count}일`).join(" · ")
          : undefined,
      tone: hasHydrated && recentSevenDaySummary.missedFocusItems.length > 0 ? "caution" : "default",
    },
  ];

  const summaryCards = [
    {
      id: "nutrition" as const,
      title: "식단",
      score: sectionScores.nutrition,
      scoreSuffix: "/ 40",
      progress: (sectionScores.nutrition / 40) * 100,
      status:
        dietAssessment.proteinFoodCount > 0
          ? `단백질 ${proteinIntake}g · 채소 ${dietAssessment.fruitVegetableServings}회`
          : "기록 대기",
      theme: sectionStyles.nutrition,
    },
    {
      id: "training" as const,
      title: "훈련",
      score: sectionScores.training,
      scoreSuffix: "/ 40",
      progress: (sectionScores.training / 40) * 100,
      status: trainingAssessment.mainSessionLabel
        ? `${trainingAssessment.mainSessionLabel} 진행`
        : trainingAssessment.hasPlannedRest
          ? "계획 휴식 반영"
          : "메인 세션 대기",
      theme: sectionStyles.training,
    },
    {
      id: "faith" as const,
      title: "신앙",
      score: sectionScores.faith,
      scoreSuffix: "/ 20",
      progress: (sectionScores.faith / 20) * 100,
      status:
        faithCompletedCount > 0
          ? `핵심 ${faithAssessment.coreCount} · 보조 ${faithAssessment.supportScore}점`
          : "핵심 루틴 대기",
      theme: sectionStyles.faith,
    },
    {
      id: "hobby" as const,
      title: "취미",
      score: extraScore,
      scoreSuffix: "/ 8",
      progress: (extraScore / 8) * 100,
      status: hobbyAssessment.mainLabel ? `${hobbyAssessment.practicedCount}개 그룹 진행` : "기록 대기",
      theme: hobbyStyles,
    },
  ];

  const activeSection =
    activeDetail === "hobby"
      ? null
      : routineSectionsWithNutrition.find((section) => section.id === activeDetail) ?? routineSectionsWithNutrition[1];

  const activeDetailMeta =
    activeDetail === "nutrition"
      ? {
          title: "식단",
          highlight: `오늘 단백질 ${proteinIntake}g / 권장 ${recommendedProtein}g`,
          scoreLabel: `${sectionScores.nutrition} / 40`,
          tone: sectionStyles.nutrition,
        }
      : activeDetail === "training"
        ? {
            title: "훈련",
            highlight: trainingAssessment.mainSessionLabel
              ? `오늘 메인 훈련 ${trainingAssessment.mainSessionLabel}`
              : trainingAssessment.hasPlannedRest
                ? "계획 휴식 반영"
                : "메인 훈련 대기",
            scoreLabel: `${sectionScores.training} / 40`,
            tone: sectionStyles.training,
          }
        : activeDetail === "faith"
          ? {
              title: "신앙",
              highlight: faithHeadline,
              scoreLabel: `${sectionScores.faith} / 20`,
              tone: sectionStyles.faith,
            }
          : {
              title: "취미",
              highlight: hobbyAssessment.mainLabel ? `${hobbyAssessment.mainLabel}` : "메인 활동 대기",
              scoreLabel: `extra +${extraScore}`,
              tone: hobbyStyles,
            };

  const hydratedSelectedDate = hasHydrated ? selectedDate : "";
  const hydratedSelectedDateLabel = hasHydrated ? selectedDate : "날짜 불러오는 중";
  const hydratedSelectedDateDetail = hasHydrated ? formatLongDate(selectedDate) : "날짜 불러오는 중";
  const hydratedTodayDate = hasHydrated ? getTodayString() : HYDRATION_SAFE_DATE;
  const hydratedSevenDayRange = hasHydrated
    ? `${recentSevenDaySummary.startDate} - ${recentSevenDaySummary.endDate}`
    : "날짜 불러오는 중";
  const currentDateHasRecord = hasAnyRoutineEntry(currentRoutine);

  return (
    <main className="dashboard-shell relative min-h-screen overflow-hidden px-4 py-5 text-slate-900 sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.62),transparent_34%),linear-gradient(180deg,#f7f7f8_0%,#eef1f4_100%)]" />

      <div className="mx-auto max-w-[1120px] space-y-5 sm:space-y-6">
        <DashboardHero
          totalScore={totalScore}
          baseScore={baseScore}
          totalPossibleScore={TOTAL_POSSIBLE_SCORE}
          completedCount={completedCount}
          totalRoutineItems={totalRoutineItems}
          extraScore={extraScore}
          overallStatus={getOverallStatus(baseScore, extraScore)}
          selectedDate={hydratedSelectedDate}
          selectedDateLabel={hydratedSelectedDateLabel}
          selectedDateDetail={hydratedSelectedDateDetail}
          onSelectedDateChange={setSelectedDate}
          onResetCurrentDate={resetCurrentDate}
          heightCm={profile.heightCm}
          weightInput={weightInput}
          onWeightChange={handleWeightChange}
          onWeightBlur={handleWeightBlur}
          proteinIntake={proteinIntake}
          recommendedProtein={recommendedProtein}
          proteinRatio={proteinRatio}
          priorityTitle={todayPriority.title}
          priorityDetail={todayPriority.detail}
        />

        <WeeklySummarySection
          rangeLabel={hydratedSevenDayRange}
          cards={weeklyAverageCards}
          insightChips={weeklyInsightChips}
          pending={!hasHydrated}
          loggedDays={recentSevenDaySummary.loggedDays}
        />

        <section className="space-y-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-2xl">섹션</h2>
              <p className="mt-1 text-sm text-slate-400">한눈에 보고 바로 이동</p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <SummaryCard
                key={card.id}
                title={card.title}
                score={card.score}
                scoreSuffix={card.scoreSuffix}
                progress={card.progress}
                status={card.status}
                active={activeDetail === card.id}
                theme={card.theme}
                onClick={() => setActiveDetail(card.id)}
              />
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-[32px] p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-2xl">상세 기록</h2>
              <p className="mt-1 text-sm text-slate-400">필요한 섹션만 바로 정리</p>
            </div>

            <div className="overflow-x-auto">
              <div className="score-pill inline-flex min-w-max rounded-full p-1">
                {detailSectionOrder.map((tab) => {
                  const isActive = activeDetail === tab;
                  const label =
                    tab === "nutrition" ? "식단" : tab === "training" ? "운동" : tab === "faith" ? "신앙" : "취미";

                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveDetail(tab)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        isActive
                          ? "bg-white text-slate-950 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.18)]"
                          : "text-slate-400 hover:text-slate-800"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="soft-panel mt-5 rounded-[26px] p-4 sm:p-4.5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${activeDetailMeta.tone.accentText}`}>Active</p>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-slate-950">{activeDetailMeta.title}</h3>
                <p className="mt-2 text-sm leading-5 text-slate-500">{activeDetailMeta.highlight}</p>
              </div>
              <div className="score-pill flex items-center gap-2 self-start rounded-full px-3 py-2">
                <span className="text-xs text-slate-400">점수</span>
                <span className="text-sm font-semibold text-slate-900">{activeDetailMeta.scoreLabel}</span>
              </div>
            </div>
          </div>

          {!currentDateHasRecord ? (
            <div className="mt-4">
              <EmptyStatePanel message="아직 기록이 없습니다" detail="오늘 기록부터 시작해보세요." />
            </div>
          ) : null}

          <div
            key={activeDetail}
            className="mt-5 min-h-[620px] transition-all duration-200 ease-out md:min-h-[700px]"
            style={{ animation: "detailFadeSlide 180ms ease-out" }}
          >
            {activeDetail === "hobby" ? (
              <HobbyCard routine={currentRoutine} score={extraScore} onToggleActivity={updateActivity} />
            ) : activeSection ? (
              <SectionCard
                section={activeSection}
                routine={currentRoutine}
                score={sectionScores[activeSection.id]}
                onToggleActivity={updateActivity}
                onSetNutritionQuantity={setNutritionQuantity}
                onIncrementNutritionFood={incrementNutritionFood}
                onApplyNutritionPreset={applyNutritionPreset}
                onCopyPreviousNutrition={copyPreviousNutrition}
                proteinSummary={proteinSummary}
                nutritionFoods={nutritionFoods}
                customFoods={customFoods}
                favoriteFoodIds={favoriteFoodIds}
                favoriteFoods={favoriteFoods}
                recentFoods={recentFoods}
                nutritionMessage={nutritionMessage}
                isFoodFormOpen={isFoodFormOpen}
                editingFoodId={editingFoodId}
                foodForm={foodForm}
                foodFormError={foodFormError}
                onOpenCreateFoodForm={openCreateFoodForm}
                onCloseFoodForm={closeFoodForm}
                onFoodFormChange={handleFoodFormChange}
                onSaveFood={handleSaveFood}
                onEditFood={handleEditFood}
                onDeleteFood={handleDeleteFood}
                onToggleFavoriteFood={toggleFavoriteFood}
              />
            ) : null}
          </div>
        </section>

        <HistorySection
          summaries={savedDateSummaries}
          retrospectiveCards={retrospectiveCards}
          retrospectiveChips={retrospectiveChips}
          pending={!hasHydrated}
          selectedDate={selectedDate}
          todayDate={hydratedTodayDate}
          totalRoutineItems={totalRoutineItems}
          rangeLabel={hydratedSevenDayRange}
          loggedDays={recentSevenDaySummary.loggedDays}
          onSelectDate={setSelectedDate}
        />

        <DataManagementPanel
          recordCount={savedDateSummaries.length}
          customFoodCount={customFoods.length}
          favoriteFoodCount={favoriteFoodIds.length}
          message={dataManagementMessage}
          importFileInputRef={importFileInputRef}
          onExport={exportAllData}
          onOpenImport={openImportFilePicker}
          onImportChange={handleImportFileChange}
          onReset={resetAllData}
        />
      </div>

      <style jsx global>{`
        @keyframes detailFadeSlide {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
