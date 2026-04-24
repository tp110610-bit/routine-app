import { fromDailyRoutineLog } from "../lib/routineMappers";
import { createRoutineBackupData } from "../lib/routineStorageFormat";
import type { CustomFood, DailyRoutineLog, NutritionFood, RoutineBackupData } from "../types/routine";

export const mockCustomFoods: CustomFood[] = [
  {
    id: "custom-food-tofu",
    label: "두부",
    proteinGrams: 8,
    unitLabel: "100g",
    category: "protein",
    isCustom: true,
    archived: false,
  },
  {
    id: "custom-food-oatmeal",
    label: "오트밀",
    proteinGrams: 5,
    unitLabel: "1회",
    category: "proteinMeal",
    isCustom: true,
    archived: true,
    archivedAt: "2026-04-20T09:00:00.000Z",
  },
];

export const mockRoutineLogs: DailyRoutineLog[] = [
  {
    date: "2026-04-24",
    diet: {
      foods: {
        greekYogurt: 1,
        banana: 1,
        "custom-food-tofu": 1,
      },
    },
    training: {
      activities: {
        plannedRest: true,
      },
    },
    faith: {
      activities: {
        qt: true,
        prayer: true,
      },
    },
    hobby: {
      activities: {
        pianoShort: true,
      },
    },
    scores: {
      diet: 18,
      training: 5,
      faith: 9,
      hobby: 2,
      total: 34,
    },
  },
];

export const mockNutritionFoods: NutritionFood[] = mockCustomFoods.map((food) => ({
  id: food.id,
  label: food.label,
  proteinGrams: food.proteinGrams,
  unitLabel: food.unitLabel,
  category: food.category,
  isCustom: true,
  isArchived: food.archived,
  archivedAt: food.archivedAt,
}));

export const mockRoutineStateFromLog = fromDailyRoutineLog(mockRoutineLogs[0], mockNutritionFoods);

export const mockRoutineBackupData: RoutineBackupData = createRoutineBackupData(
  mockRoutineLogs,
  mockCustomFoods,
);
