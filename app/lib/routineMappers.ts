import {
  DailyRoutineLog,
  NutritionFood,
  NutritionFoodId,
  RoutineState,
  calculateDietScore,
  calculateExerciseScore,
  calculateExtraScore,
  calculateFaithScore,
  clampNutritionQuantity,
  defaultState,
  getNutritionFoods,
  normalizeRoutineState,
  routineSections,
  hobbySection,
} from "../routineData";

function isPositiveQuantity(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function getTrainingActivityRecord(state: RoutineState): DailyRoutineLog["training"]["activities"] {
  return Object.fromEntries(
    routineSections
      .find((section) => section.id === "training")
      ?.items.filter((item) => Boolean(state[item.key]))
      .map((item) => [item.key, true]) ?? [],
  );
}

function getFaithActivityRecord(state: RoutineState): DailyRoutineLog["faith"]["activities"] {
  return Object.fromEntries(
    routineSections
      .find((section) => section.id === "faith")
      ?.items.filter((item) => Boolean(state[item.key]))
      .map((item) => [item.key, true]) ?? [],
  );
}

function getHobbyActivityRecord(state: RoutineState): DailyRoutineLog["hobby"]["activities"] {
  return Object.fromEntries(
    hobbySection.items.filter((item) => Boolean(state[item.key])).map((item) => [item.key, true]),
  );
}

// Only populated values are serialized so the mapper stays stable even if the flat state grows.
export function toDailyRoutineLog(
  state: Partial<RoutineState> | RoutineState,
  date: string,
  customFoods: readonly NutritionFood[] = [],
): DailyRoutineLog {
  const normalizedState = normalizeRoutineState(state, customFoods);
  const dietFoods = Object.fromEntries(
    getNutritionFoods(customFoods)
      .filter((food) => isPositiveQuantity(normalizedState[food.id]))
      .map((food) => [food.id, clampNutritionQuantity(Number(normalizedState[food.id] ?? 0))]),
  ) as DailyRoutineLog["diet"]["foods"];

  const diet = calculateDietScore(normalizedState, customFoods);
  const training = calculateExerciseScore(normalizedState);
  const faith = calculateFaithScore(normalizedState);
  const hobby = calculateExtraScore(normalizedState);

  return {
    date,
    diet: {
      foods: dietFoods,
    },
    training: {
      activities: getTrainingActivityRecord(normalizedState),
    },
    faith: {
      activities: getFaithActivityRecord(normalizedState),
    },
    hobby: {
      activities: getHobbyActivityRecord(normalizedState),
    },
    scores: {
      diet,
      training,
      faith,
      hobby,
      total: diet + training + faith + hobby,
    },
  };
}

export function fromDailyRoutineLog(
  log: DailyRoutineLog,
  customFoods: readonly NutritionFood[] = [],
): RoutineState {
  const flatRecord: Partial<RoutineState> = {};

  for (const [foodId, quantity] of Object.entries(log.diet.foods)) {
    if (!isPositiveQuantity(quantity)) {
      continue;
    }

    flatRecord[foodId as NutritionFoodId] = clampNutritionQuantity(quantity);
  }

  for (const [activityKey, checked] of Object.entries(log.training.activities)) {
    if (checked) {
      flatRecord[activityKey] = true;
    }
  }

  for (const [activityKey, checked] of Object.entries(log.faith.activities)) {
    if (checked) {
      flatRecord[activityKey] = true;
    }
  }

  for (const [activityKey, checked] of Object.entries(log.hobby.activities)) {
    if (checked) {
      flatRecord[activityKey] = true;
    }
  }

  const normalizedState = normalizeRoutineState(flatRecord, customFoods);

  // Unknown custom-food keys may not exist in the current metadata set yet, so preserve them as safe quantities.
  for (const [foodId, quantity] of Object.entries(log.diet.foods)) {
    if (!isPositiveQuantity(quantity) || foodId in defaultState || foodId in normalizedState) {
      continue;
    }

    normalizedState[foodId] = clampNutritionQuantity(quantity);
  }

  return normalizedState;
}
