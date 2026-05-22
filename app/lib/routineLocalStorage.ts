import type { DailyRecords, NutritionFood } from "../routineData";
import type { UserProfile } from "./dashboard-config";
import { getActiveCustomFoods } from "../routineData";
import {
  CUSTOM_FOODS_STORAGE_KEY,
  DETAIL_STORAGE_KEY,
  FAVORITE_FOODS_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
  STORAGE_KEY,
  loadStoredCustomFoods,
  loadStoredFavoriteFoodIds,
  loadStoredProfile,
  loadStoredRecords,
} from "./dashboard-storage";

export const WEEKLY_SUMMARY_STORAGE_KEY = "routine-weekly-summary-open";

export type RoutineLocalData = {
  records: DailyRecords;
  customFoods: NutritionFood[];
  profile: UserProfile;
  favoriteFoodIds: string[];
  activeDetail: string | null;
  isWeeklySummaryOpen: boolean;
};

type RoutineLocalSaveData = Partial<{
  records: DailyRecords;
  customFoods: readonly NutritionFood[];
  profile: UserProfile;
  favoriteFoodIds: readonly string[];
  activeDetail: string;
  isWeeklySummaryOpen: boolean;
}>;

function hasBrowserStorage() {
  return typeof window !== "undefined";
}

export function loadRoutineLocalData(): RoutineLocalData {
  const customFoods = loadStoredCustomFoods();
  const profile = loadStoredProfile();

  return {
    records: loadStoredRecords(customFoods),
    customFoods,
    profile,
    favoriteFoodIds: loadStoredFavoriteFoodIds(getActiveCustomFoods(customFoods)),
    activeDetail: hasBrowserStorage() ? window.localStorage.getItem(DETAIL_STORAGE_KEY) : null,
    isWeeklySummaryOpen:
      hasBrowserStorage() && window.localStorage.getItem(WEEKLY_SUMMARY_STORAGE_KEY) === "true",
  };
}

export function saveRoutineLocalData(data: RoutineLocalSaveData) {
  if (!hasBrowserStorage()) {
    return;
  }

  if (data.records !== undefined) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data.records));
  }

  if (data.customFoods !== undefined) {
    window.localStorage.setItem(CUSTOM_FOODS_STORAGE_KEY, JSON.stringify(data.customFoods));
  }

  if (data.profile !== undefined) {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data.profile));
  }

  if (data.favoriteFoodIds !== undefined) {
    window.localStorage.setItem(FAVORITE_FOODS_STORAGE_KEY, JSON.stringify(data.favoriteFoodIds));
  }

  if (data.activeDetail !== undefined) {
    window.localStorage.setItem(DETAIL_STORAGE_KEY, data.activeDetail);
  }

  if (data.isWeeklySummaryOpen !== undefined) {
    window.localStorage.setItem(WEEKLY_SUMMARY_STORAGE_KEY, String(data.isWeeklySummaryOpen));
  }
}

export function clearRoutineLocalData() {
  if (!hasBrowserStorage()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(CUSTOM_FOODS_STORAGE_KEY);
  window.localStorage.removeItem(PROFILE_STORAGE_KEY);
  window.localStorage.removeItem(FAVORITE_FOODS_STORAGE_KEY);
}
