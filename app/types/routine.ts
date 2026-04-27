import type { UserProfile } from "../lib/dashboard-config";

export type { UserProfile } from "../lib/dashboard-config";

export type NutritionKey =
  | "greekYogurt"
  | "banana"
  | "mealit"
  | "blackBeanSoyMilk"
  | "proteinDrink"
  | "proteinBar"
  | "nuts"
  | "chickenBreast"
  | "chickenFriedRice"
  | "cherryTomatoes"
  | "broccoli"
  | "cucumberCarrot"
  | "egg"
  | "ramen";

export type TrainingKey =
  | "runZone2"
  | "runInterval"
  | "runLsd"
  | "runShort"
  | "runMedium"
  | "runLong"
  | "swimLesson"
  | "swimFree"
  | "swimFinDay"
  | "swimOpenWater"
  | "cycleRecovery"
  | "cycleNormal"
  | "cycleHard"
  | "cycleLong"
  | "bodyweightLight"
  | "bodyweightModerate"
  | "bodyweightHigh"
  | "stretching"
  | "recoveryRoutine"
  | "supportWorkout"
  | "plannedRest";

export type FaithKey =
  | "qt"
  | "prayer"
  | "gratitude"
  | "worship"
  | "bsc"
  | "listeningToWord"
  | "godAwareness";

export type HobbyKey =
  | "pianoShort"
  | "pianoPractice"
  | "pianoDeep"
  | "pianoLesson"
  | "vocalWarmup"
  | "vocalPractice"
  | "vocalLesson"
  | "codingShort"
  | "codingWork"
  | "codingDeep";

export type ActivityKey = TrainingKey | FaithKey | HobbyKey;
export type NutritionFoodId = NutritionKey | string;

export type NutritionCategory =
  | "protein"
  | "proteinMeal"
  | "fruit"
  | "vegetable"
  | "processed"
  | "snack";

export type NutritionFood = {
  id: string;
  label: string;
  proteinGrams: number;
  unitLabel: string;
  category: NutritionCategory;
  isCustom: boolean;
  isArchived?: boolean;
  archivedAt?: string;
};

export type CustomFood = {
  id: string;
  label: string;
  proteinGrams: number;
  unitLabel: string;
  category: NutritionCategory;
  isCustom: true;
  archived: boolean;
  archivedAt?: string;
};

export type DietRoutineRecord = {
  foods: Partial<Record<NutritionFoodId, number>>;
  note?: string;
};

export type TrainingRoutineRecord = {
  activities: Partial<Record<TrainingKey, boolean>>;
  note?: string;
};

export type FaithRoutineRecord = {
  activities: Partial<Record<FaithKey, boolean>>;
  note?: string;
};

export type HobbyRoutineRecord = {
  activities: Partial<Record<HobbyKey, boolean>>;
  note?: string;
};

export type RoutineScores = {
  diet: number;
  training: number;
  faith: number;
  hobby: number;
  total: number;
};

export type DailyRoutineLog = {
  date: string;
  diet: DietRoutineRecord;
  training: TrainingRoutineRecord;
  faith: FaithRoutineRecord;
  hobby: HobbyRoutineRecord;
  scores: RoutineScores;
};

export const ROUTINE_BACKUP_VERSION = "1.1" as const;
export const SUPPORTED_ROUTINE_BACKUP_VERSIONS = ["1.0", ROUTINE_BACKUP_VERSION] as const;

export type RoutineBackupVersion = (typeof SUPPORTED_ROUTINE_BACKUP_VERSIONS)[number];

export type RoutineBackupData = {
  version: RoutineBackupVersion;
  exportedAt: string;
  logs: DailyRoutineLog[];
  customFoods: CustomFood[];
  profile: UserProfile;
  favoriteFoodIds: string[];
};

export type RoutineState = Record<string, number | boolean> & Record<ActivityKey, boolean>;

export type DailyRecords = {
  [date: string]: Partial<RoutineState>;
};
