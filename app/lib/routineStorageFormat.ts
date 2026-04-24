import {
  ROUTINE_BACKUP_VERSION,
  CustomFood,
  DailyRoutineLog,
  NutritionCategory,
  NutritionFood,
  RoutineBackupData,
} from "../types/routine";

const NUTRITION_CATEGORIES = [
  "protein",
  "proteinMeal",
  "fruit",
  "vegetable",
  "processed",
  "snack",
] as const;

function isRecordObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function isNutritionCategory(value: unknown): value is NutritionCategory {
  return typeof value === "string" && NUTRITION_CATEGORIES.includes(value as NutritionCategory);
}

function normalizeCustomFood(value: unknown): CustomFood | null {
  if (!isRecordObject(value)) {
    return null;
  }

  const id = normalizeString(value.id).trim();
  const label = normalizeString(value.label).trim();
  const unitLabel = normalizeString(value.unitLabel).trim();
  const proteinGrams = isFiniteNumber(value.proteinGrams) ? Math.max(0, value.proteinGrams) : 0;
  const category = value.category;

  if (!id || !label || !unitLabel) {
    return null;
  }

  if (!isNutritionCategory(category)) {
    return null;
  }

  return {
    id,
    label,
    proteinGrams,
    unitLabel,
    category,
    isCustom: true,
    archived: normalizeBoolean(value.archived, normalizeBoolean(value.isArchived)),
    archivedAt: typeof value.archivedAt === "string" ? value.archivedAt : undefined,
  };
}

function normalizeNumberRecord(value: unknown) {
  if (!isRecordObject(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, entryValue]) =>
      isFiniteNumber(entryValue) ? [[key, entryValue]] : [],
    ),
  );
}

function normalizeBooleanRecord(value: unknown) {
  if (!isRecordObject(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, entryValue]) =>
      typeof entryValue === "boolean" ? [[key, entryValue]] : [],
    ),
  );
}

function normalizeScores(value: unknown): DailyRoutineLog["scores"] {
  const scores = isRecordObject(value) ? value : {};

  return {
    diet: isFiniteNumber(scores.diet) ? scores.diet : 0,
    training: isFiniteNumber(scores.training) ? scores.training : 0,
    faith: isFiniteNumber(scores.faith) ? scores.faith : 0,
    hobby: isFiniteNumber(scores.hobby) ? scores.hobby : 0,
    total: isFiniteNumber(scores.total) ? scores.total : 0,
  };
}

function normalizeDailyRoutineLog(value: unknown): DailyRoutineLog | null {
  if (!isRecordObject(value)) {
    return null;
  }

  const date = normalizeString(value.date).trim();
  if (!date) {
    return null;
  }

  const diet = isRecordObject(value.diet) ? value.diet : {};
  const training = isRecordObject(value.training) ? value.training : {};
  const faith = isRecordObject(value.faith) ? value.faith : {};
  const hobby = isRecordObject(value.hobby) ? value.hobby : {};

  return {
    date,
    diet: {
      foods: normalizeNumberRecord(diet.foods),
      note: typeof diet.note === "string" ? diet.note : undefined,
    },
    training: {
      activities: normalizeBooleanRecord(training.activities),
      note: typeof training.note === "string" ? training.note : undefined,
    },
    faith: {
      activities: normalizeBooleanRecord(faith.activities),
      note: typeof faith.note === "string" ? faith.note : undefined,
    },
    hobby: {
      activities: normalizeBooleanRecord(hobby.activities),
      note: typeof hobby.note === "string" ? hobby.note : undefined,
    },
    scores: normalizeScores(value.scores),
  };
}

// Version lets us evolve the JSON shape later without guessing which importer rules should run.
export function createRoutineBackupData(
  logs: readonly DailyRoutineLog[],
  customFoods: readonly (CustomFood | NutritionFood)[],
): RoutineBackupData {
  return {
    version: ROUTINE_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    logs: logs.map((log) => normalizeDailyRoutineLog(log)).filter((log): log is DailyRoutineLog => Boolean(log)),
    customFoods: customFoods
      .map((food) => normalizeCustomFood(food))
      .filter((food): food is CustomFood => Boolean(food)),
  };
}

export function isRoutineBackupData(value: unknown): value is RoutineBackupData {
  if (!isRecordObject(value)) {
    return false;
  }

  if (value.version !== ROUTINE_BACKUP_VERSION || typeof value.exportedAt !== "string") {
    return false;
  }

  if (!Array.isArray(value.logs) || !Array.isArray(value.customFoods)) {
    return false;
  }

  return value.logs.every((log) => normalizeDailyRoutineLog(log) !== null) &&
    value.customFoods.every((food) => normalizeCustomFood(food) !== null);
}

export function normalizeRoutineBackupData(value: unknown): RoutineBackupData {
  if (!isRecordObject(value)) {
    return {
      version: ROUTINE_BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      logs: [],
      customFoods: [],
    };
  }

  const normalizedLogs = Array.isArray(value.logs)
    ? value.logs.map((log) => normalizeDailyRoutineLog(log)).filter((log): log is DailyRoutineLog => Boolean(log))
    : [];
  const normalizedCustomFoods = Array.isArray(value.customFoods)
    ? value.customFoods
        .map((food) => normalizeCustomFood(food))
        .filter((food): food is CustomFood => Boolean(food))
    : [];

  return {
    version: ROUTINE_BACKUP_VERSION,
    exportedAt: typeof value.exportedAt === "string" ? value.exportedAt : new Date().toISOString(),
    logs: normalizedLogs,
    customFoods: normalizedCustomFoods,
  };
}
