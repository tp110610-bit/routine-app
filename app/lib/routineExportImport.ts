import type { DailyRecords, NutritionFood } from "../routineData";
import type { RoutineBackupData, UserProfile } from "../types/routine";
import { getActiveNutritionFoods, getTodayString } from "../routineData";
import { fromDailyRoutineLog, toDailyRoutineLog } from "./routineMappers";
import {
  normalizeStoredCustomFoods,
  normalizeStoredFavoriteFoodIds,
  normalizeStoredRecords,
  parseImportedBackup,
} from "./dashboard-storage";
import {
  createRoutineBackupData,
  isRoutineBackupData,
  normalizeRoutineBackupData,
} from "./routineStorageFormat";

type RoutineExportSource = {
  records: DailyRecords;
  customFoods: readonly NutritionFood[];
  profile: UserProfile;
  favoriteFoodIds: readonly string[];
};

export type RoutineImportData = {
  records: DailyRecords;
  customFoods: NutritionFood[];
  profile: UserProfile;
  favoriteFoodIds: string[];
};

type RoutineImportSuccess = {
  ok: true;
  data: RoutineImportData;
  source: "routine-backup" | "legacy-backup";
  warnings: string[];
};

type RoutineImportFailure = {
  ok: false;
  message: string;
};

export type RoutineImportResult = RoutineImportSuccess | RoutineImportFailure;

function isRecordObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRoutineBackupCandidate(value: unknown) {
  return isRecordObject(value) && (isRoutineBackupData(value) || Array.isArray(value.logs));
}

function mapBackupCustomFoodsToNutritionFoods(customFoods: RoutineBackupData["customFoods"]) {
  return normalizeStoredCustomFoods(
    customFoods.map((food) => ({
      id: food.id,
      label: food.label,
      proteinGrams: food.proteinGrams,
      unitLabel: food.unitLabel,
      category: food.category,
      isCustom: true,
      isArchived: food.archived,
      archivedAt: food.archivedAt,
    })),
  );
}

function mapRoutineBackupToRecords(backup: RoutineBackupData, customFoods: readonly NutritionFood[]) {
  return backup.logs.reduce<DailyRecords>((nextRecords, log) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(log.date)) {
      return nextRecords;
    }

    nextRecords[log.date] = fromDailyRoutineLog(log, customFoods);
    return nextRecords;
  }, {});
}

export function createRoutineExportPayload({
  records,
  customFoods,
  profile,
  favoriteFoodIds,
}: RoutineExportSource) {
  const normalizedRecords = normalizeStoredRecords(records, customFoods);
  const logs = Object.entries(normalizedRecords)
    .sort(([leftDate], [rightDate]) => leftDate.localeCompare(rightDate))
    .map(([date, routine]) => toDailyRoutineLog(routine, date, customFoods));

  return createRoutineBackupData(logs, normalizeStoredCustomFoods(customFoods), {
    profile,
    favoriteFoodIds,
  });
}

export function createRoutineExportFilename(date = getTodayString()) {
  return `routine-backup-${date}.json`;
}

export function convertRoutineBackupToLocalData(backup: RoutineBackupData): RoutineImportData {
  const customFoods = mapBackupCustomFoodsToNutritionFoods(backup.customFoods);

  return {
    customFoods,
    records: mapRoutineBackupToRecords(backup, customFoods),
    profile: backup.profile,
    favoriteFoodIds: normalizeStoredFavoriteFoodIds(
      backup.favoriteFoodIds,
      getActiveNutritionFoods(customFoods),
    ),
  };
}

export function parseRoutineImportPayload(input: unknown): RoutineImportResult {
  if (isRoutineBackupCandidate(input)) {
    return {
      ok: true,
      data: convertRoutineBackupToLocalData(normalizeRoutineBackupData(input)),
      source: "routine-backup",
      warnings: [],
    };
  }

  const legacyResult = parseImportedBackup(input);

  if (!legacyResult.ok) {
    return {
      ok: false,
      message: legacyResult.error,
    };
  }

  return {
    ok: true,
    data: {
      records: legacyResult.data.records,
      customFoods: legacyResult.data.customFoods,
      profile: legacyResult.data.profile,
      favoriteFoodIds: normalizeStoredFavoriteFoodIds(
        legacyResult.data.favoriteFoodIds,
        getActiveNutritionFoods(legacyResult.data.customFoods),
      ),
    },
    source: "legacy-backup",
    warnings: legacyResult.warnings,
  };
}
