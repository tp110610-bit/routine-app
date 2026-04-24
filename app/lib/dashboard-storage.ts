import {
  DailyRecords,
  NutritionCategory,
  NutritionFood,
  RoutineState,
  defaultNutritionFoods,
  getActiveCustomFoods,
  getNutritionFoods,
  normalizeRoutineState,
} from "../routineData";
import { UserProfile, defaultProfile } from "./dashboard-config";

export const STORAGE_KEY = "daily-routine-records";
export const PROFILE_STORAGE_KEY = "routine-user-profile";
export const DETAIL_STORAGE_KEY = "routine-active-detail";
export const CUSTOM_FOODS_STORAGE_KEY = "routine-custom-foods";
export const FAVORITE_FOODS_STORAGE_KEY = "routine-favorite-foods";
export const BACKUP_FILE_APP_ID = "routine-app";
export const BACKUP_FILE_VERSION = 1;

type BackupPayload = {
  app: typeof BACKUP_FILE_APP_ID;
  version: number;
  exportedAt: string;
  records: DailyRecords;
  customFoods: NutritionFood[];
  profile: UserProfile;
  favoriteFoodIds: string[];
};

type BackupParseSuccess = {
  ok: true;
  data: BackupPayload;
  warnings: string[];
};

type BackupParseFailure = {
  ok: false;
  error: string;
};

function isNutritionCategory(value: unknown): value is NutritionCategory {
  return ["protein", "proteinMeal", "fruit", "vegetable", "processed", "snack"].includes(String(value));
}

function isRecordObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function normalizeStoredCustomFoods(input: unknown): NutritionFood[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const ids = new Set<string>();

  return input.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const candidate = item as Partial<NutritionFood>;
    const id = typeof candidate.id === "string" && candidate.id.trim() ? candidate.id.trim() : null;
    const label = typeof candidate.label === "string" ? candidate.label.trim() : "";
    const unitLabel = typeof candidate.unitLabel === "string" ? candidate.unitLabel.trim() : "";
    const proteinGrams =
      typeof candidate.proteinGrams === "number" && Number.isFinite(candidate.proteinGrams)
        ? Math.max(0, candidate.proteinGrams)
        : null;
    const isArchived = candidate.isArchived === true;
    const archivedAt =
      typeof candidate.archivedAt === "string" && candidate.archivedAt.trim() ? candidate.archivedAt.trim() : undefined;

    if (!id || !label || !unitLabel || proteinGrams === null || !isNutritionCategory(candidate.category)) {
      return [];
    }

    if (ids.has(id) || defaultNutritionFoods.some((food) => food.id === id)) {
      return [];
    }

    ids.add(id);

    return [
      {
        id,
        label,
        proteinGrams,
        unitLabel,
        category: candidate.category,
        isCustom: true,
        isArchived,
        archivedAt: isArchived ? archivedAt : undefined,
      },
    ];
  });
}

export function normalizeStoredProfile(input: unknown): UserProfile {
  if (!isRecordObject(input)) {
    return defaultProfile;
  }

  const heightCm =
    typeof input.heightCm === "number" && Number.isFinite(input.heightCm) && input.heightCm > 0
      ? Number(input.heightCm.toFixed(1))
      : defaultProfile.heightCm;
  const weightKg =
    typeof input.weightKg === "number" && Number.isFinite(input.weightKg) && input.weightKg > 0
      ? Number(input.weightKg.toFixed(1))
      : defaultProfile.weightKg;

  return {
    heightCm,
    weightKg,
  };
}

export function normalizeStoredRecords(
  input: unknown,
  customFoods: readonly NutritionFood[] = [],
): DailyRecords {
  if (!isRecordObject(input)) {
    return {};
  }

  return Object.entries(input).reduce<DailyRecords>((records, [date, value]) => {
    if (!isDateKey(date) || !isRecordObject(value)) {
      return records;
    }

    records[date] = normalizeRoutineState(value as Partial<RoutineState>, customFoods);
    return records;
  }, {});
}

export function normalizeStoredFavoriteFoodIds(
  input: unknown,
  foods: readonly NutritionFood[] = defaultNutritionFoods,
) {
  if (!Array.isArray(input)) {
    return [];
  }

  const availableIds = new Set(foods.map((food) => food.id));
  const seen = new Set<string>();

  return input.flatMap((value) => {
    if (typeof value !== "string") {
      return [];
    }

    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed) || !availableIds.has(trimmed)) {
      return [];
    }

    seen.add(trimmed);
    return [trimmed];
  });
}

export function parseImportedBackup(input: unknown): BackupParseSuccess | BackupParseFailure {
  if (!isRecordObject(input)) {
    return { ok: false, error: "불러올 수 없는 파일입니다." };
  }

  const rawRecords = input.records ?? input.dailyRecords ?? input[STORAGE_KEY];
  if (rawRecords === undefined || !isRecordObject(rawRecords)) {
    return { ok: false, error: "데이터 형식이 올바르지 않습니다." };
  }

  const rawCustomFoods = input.customFoods ?? input[CUSTOM_FOODS_STORAGE_KEY] ?? [];
  const rawProfile = input.profile ?? input[PROFILE_STORAGE_KEY] ?? defaultProfile;
  const customFoods = normalizeStoredCustomFoods(rawCustomFoods);
  const records = normalizeStoredRecords(rawRecords, customFoods);
  const profile = normalizeStoredProfile(rawProfile);
  const favoriteFoodIds = normalizeStoredFavoriteFoodIds(
    input.favoriteFoodIds ?? input[FAVORITE_FOODS_STORAGE_KEY] ?? [],
    getNutritionFoods(getActiveCustomFoods(customFoods)),
  );
  const warnings = [
    input.customFoods === undefined && input[CUSTOM_FOODS_STORAGE_KEY] === undefined ? "커스텀 음식 없음" : null,
    input.profile === undefined && input[PROFILE_STORAGE_KEY] === undefined ? "프로필 기본값 사용" : null,
    input.favoriteFoodIds === undefined && input[FAVORITE_FOODS_STORAGE_KEY] === undefined ? "즐겨찾기 없음" : null,
  ].filter((warning): warning is string => Boolean(warning));

  return {
    ok: true,
    data: {
      app: BACKUP_FILE_APP_ID,
      version:
        typeof input.version === "number" && Number.isFinite(input.version)
          ? Math.max(1, Math.round(input.version))
          : BACKUP_FILE_VERSION,
      exportedAt:
        typeof input.exportedAt === "string" && input.exportedAt.trim()
          ? input.exportedAt
          : new Date().toISOString(),
      records,
      customFoods,
      profile,
      favoriteFoodIds,
    },
    warnings,
  };
}

export function loadStoredCustomFoods(): NutritionFood[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const saved = window.localStorage.getItem(CUSTOM_FOODS_STORAGE_KEY);
    if (!saved) {
      return [];
    }

    return normalizeStoredCustomFoods(JSON.parse(saved));
  } catch (error) {
    console.error("사용자 음식 목록을 불러오는 중 오류가 발생했습니다.", error);
    return [];
  }
}

export function loadStoredRecords(customFoods: readonly NutritionFood[] = []): DailyRecords {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return {};
    }

    return normalizeStoredRecords(JSON.parse(saved), customFoods);
  } catch (error) {
    console.error("저장된 루틴 기록을 불러오는 중 오류가 발생했습니다.", error);
    return {};
  }
}

export function loadStoredProfile(): UserProfile {
  if (typeof window === "undefined") {
    return defaultProfile;
  }

  try {
    const saved = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!saved) {
      return defaultProfile;
    }

    return normalizeStoredProfile(JSON.parse(saved));
  } catch (error) {
    console.error("사용자 신체 정보를 불러오는 중 오류가 발생했습니다.", error);
    return defaultProfile;
  }
}

export function loadStoredFavoriteFoodIds(customFoods: readonly NutritionFood[] = []) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const saved = window.localStorage.getItem(FAVORITE_FOODS_STORAGE_KEY);
    if (!saved) {
      return [];
    }

    return normalizeStoredFavoriteFoodIds(JSON.parse(saved), getNutritionFoods(customFoods));
  } catch (error) {
    console.error("즐겨찾기 음식 목록을 불러오는 중 오류가 발생했습니다.", error);
    return [];
  }
}
