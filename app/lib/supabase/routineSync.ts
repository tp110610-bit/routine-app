import type {
  CustomFood,
  DailyRecords,
  DailyRoutineLog,
  NutritionFood,
  RoutineBackupData,
  RoutineState,
  UserProfile,
} from "../../types/routine";
import { defaultProfile } from "../dashboard-config";
import { toDailyRoutineLog } from "../routineMappers";
import { normalizeRoutineBackupData } from "../routineStorageFormat";
import { createBrowserSupabaseClient } from "./client";
import {
  getSupabaseEnvStatus,
  getSupabaseInvalidEnvMessage,
  getSupabaseMissingEnvMessage,
} from "./isSupabaseConfigured";
import type { AppSupabaseClient } from "./client";
import type { Database, Json } from "./types";

type RoutineLogRow = Database["public"]["Tables"]["routine_logs"]["Row"];
type RoutineLogInsert = Database["public"]["Tables"]["routine_logs"]["Insert"];
type CustomFoodRow = Database["public"]["Tables"]["custom_foods"]["Row"];
type CustomFoodInsert = Database["public"]["Tables"]["custom_foods"]["Insert"];
type UserProfileRow = Database["public"]["Tables"]["user_profiles"]["Row"];
type UserPreferencesRow = Database["public"]["Tables"]["user_preferences"]["Row"];

type SyncFailure = {
  ok: false;
  error: string;
};

export type UploadRoutineBackupParams = {
  userId: string;
  records: DailyRecords;
  customFoods: readonly NutritionFood[];
  profile: UserProfile;
  favoriteFoodIds: readonly string[];
  client?: AppSupabaseClient | null;
};

export type UploadRoutineBackupSuccess = {
  ok: true;
  uploaded: {
    logs: number;
    customFoods: number;
    profile: boolean;
    preferences: boolean;
  };
};

export type UploadRoutineBackupResult = UploadRoutineBackupSuccess | SyncFailure;

export type DownloadRoutineBackupParams = {
  userId: string;
  client?: AppSupabaseClient | null;
};

export type DownloadRoutineBackupSuccess = {
  ok: true;
  isEmpty: boolean;
  backup: RoutineBackupData;
  counts: {
    logs: number;
    customFoods: number;
    hasProfile: boolean;
    favoriteFoodIds: number;
  };
};

export type DownloadRoutineBackupResult = DownloadRoutineBackupSuccess | SyncFailure;

function getSupabaseClient(client?: AppSupabaseClient | null): AppSupabaseClient | SyncFailure {
  if (client) {
    return client;
  }

  const env = getSupabaseEnvStatus();
  if (!env.isConfigured) {
    return {
      ok: false,
      error:
        env.missingKeys.length > 0
          ? getSupabaseMissingEnvMessage(env.missingKeys)
          : getSupabaseInvalidEnvMessage(env.invalidKeys),
    };
  }

  const browserClient = createBrowserSupabaseClient();
  if (!browserClient) {
    return {
      ok: false,
      error: "Supabase client is not available.",
    };
  }

  return browserClient;
}

function isFailure(value: AppSupabaseClient | SyncFailure): value is SyncFailure {
  return "ok" in value && value.ok === false;
}

function getSyncErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }

  return "Supabase sync failed.";
}

function isDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isRecordObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCustomFood(value: CustomFood | NutritionFood): value is CustomFood {
  return value.isCustom === true && "archived" in value;
}

function getArchivedState(food: CustomFood | NutritionFood) {
  return isCustomFood(food) ? food.archived : food.isArchived === true;
}

function toCustomFoodRow(userId: string, food: CustomFood | NutritionFood): CustomFoodInsert {
  const isArchived = getArchivedState(food);

  return {
    user_id: userId,
    food_key: food.id,
    label: food.label,
    protein_grams: food.proteinGrams,
    unit_label: food.unitLabel,
    category: food.category,
    is_archived: isArchived,
    archived_at: isArchived ? food.archivedAt ?? null : null,
  };
}

function toRoutineLogRow(
  userId: string,
  date: string,
  record: Partial<RoutineState>,
  customFoods: readonly NutritionFood[],
): RoutineLogInsert {
  const log = toDailyRoutineLog(record, date, customFoods);

  return {
    user_id: userId,
    date,
    log: log as unknown as Json,
  };
}

function rowToCustomFood(row: CustomFoodRow): CustomFood {
  return {
    id: row.food_key,
    label: row.label,
    proteinGrams: Number(row.protein_grams),
    unitLabel: row.unit_label,
    category: row.category as CustomFood["category"],
    isCustom: true,
    archived: row.is_archived,
    archivedAt: row.archived_at ?? undefined,
  };
}

function rowToProfile(row: UserProfileRow | null): UserProfile {
  if (!row) {
    return defaultProfile;
  }

  return {
    heightCm: Number(row.height_cm),
    weightKg: Number(row.weight_kg),
  };
}

function rowToFavoriteFoodIds(row: UserPreferencesRow | null) {
  if (!row || !Array.isArray(row.favorite_food_ids)) {
    return [];
  }

  return row.favorite_food_ids.filter((value): value is string => typeof value === "string");
}

function rowToDailyRoutineLog(row: RoutineLogRow): DailyRoutineLog | null {
  if (!isRecordObject(row.log)) {
    return null;
  }

  return {
    ...row.log,
    date: row.date,
  } as unknown as DailyRoutineLog;
}

export async function uploadRoutineBackupToSupabase(
  params: UploadRoutineBackupParams,
): Promise<UploadRoutineBackupResult> {
  const supabase = getSupabaseClient(params.client);
  if (isFailure(supabase)) {
    return supabase;
  }

  try {
    const normalizedRecords = Object.entries(params.records)
      .filter(([date]) => isDateKey(date))
      .sort(([leftDate], [rightDate]) => leftDate.localeCompare(rightDate));
    const routineLogRows = normalizedRecords.map(([date, record]) =>
      toRoutineLogRow(params.userId, date, record, params.customFoods),
    );
    const customFoodRows = params.customFoods
      .filter((food) => food.isCustom)
      .map((food) => toCustomFoodRow(params.userId, food));

    if (routineLogRows.length > 0) {
      const { error } = await supabase.from("routine_logs").upsert(routineLogRows as never[], {
        onConflict: "user_id,date",
      });

      if (error) {
        return { ok: false, error: getSyncErrorMessage(error) };
      }
    }

    if (customFoodRows.length > 0) {
      const { error } = await supabase.from("custom_foods").upsert(customFoodRows as never[], {
        onConflict: "user_id,food_key",
      });

      if (error) {
        return { ok: false, error: getSyncErrorMessage(error) };
      }
    }

    const { error: profileError } = await supabase.from("user_profiles").upsert(
      {
        user_id: params.userId,
        height_cm: params.profile.heightCm,
        weight_kg: params.profile.weightKg,
      } as never,
      { onConflict: "user_id" },
    );

    if (profileError) {
      return { ok: false, error: getSyncErrorMessage(profileError) };
    }

    const { error: preferencesError } = await supabase.from("user_preferences").upsert(
      {
        user_id: params.userId,
        favorite_food_ids: [...params.favoriteFoodIds] as Json,
      } as never,
      { onConflict: "user_id" },
    );

    if (preferencesError) {
      return { ok: false, error: getSyncErrorMessage(preferencesError) };
    }

    return {
      ok: true,
      uploaded: {
        logs: routineLogRows.length,
        customFoods: customFoodRows.length,
        profile: true,
        preferences: true,
      },
    };
  } catch (error) {
    return { ok: false, error: getSyncErrorMessage(error) };
  }
}

export async function downloadRoutineBackupFromSupabase(
  params: DownloadRoutineBackupParams,
): Promise<DownloadRoutineBackupResult> {
  const supabase = getSupabaseClient(params.client);
  if (isFailure(supabase)) {
    return supabase;
  }

  try {
    const [
      routineLogsResult,
      customFoodsResult,
      profileResult,
      preferencesResult,
    ] = await Promise.all([
      supabase.from("routine_logs").select("*").eq("user_id", params.userId).order("date", { ascending: true }),
      supabase.from("custom_foods").select("*").eq("user_id", params.userId).order("label", { ascending: true }),
      supabase.from("user_profiles").select("*").eq("user_id", params.userId).maybeSingle(),
      supabase.from("user_preferences").select("*").eq("user_id", params.userId).maybeSingle(),
    ]);

    if (routineLogsResult.error) {
      return { ok: false, error: getSyncErrorMessage(routineLogsResult.error) };
    }

    if (customFoodsResult.error) {
      return { ok: false, error: getSyncErrorMessage(customFoodsResult.error) };
    }

    if (profileResult.error) {
      return { ok: false, error: getSyncErrorMessage(profileResult.error) };
    }

    if (preferencesResult.error) {
      return { ok: false, error: getSyncErrorMessage(preferencesResult.error) };
    }

    const routineRows = routineLogsResult.data ?? [];
    const customFoodRows = customFoodsResult.data ?? [];
    const profileRow = profileResult.data ?? null;
    const preferencesRow = preferencesResult.data ?? null;
    const favoriteFoodIds = rowToFavoriteFoodIds(preferencesRow);
    const isEmpty =
      routineRows.length === 0 &&
      customFoodRows.length === 0 &&
      profileRow === null &&
      favoriteFoodIds.length === 0;
    const backup = normalizeRoutineBackupData({
      logs: routineRows.map(rowToDailyRoutineLog).filter((log): log is DailyRoutineLog => Boolean(log)),
      customFoods: customFoodRows.map(rowToCustomFood),
      profile: rowToProfile(profileRow),
      favoriteFoodIds,
    });

    return {
      ok: true,
      isEmpty,
      backup,
      counts: {
        logs: routineRows.length,
        customFoods: customFoodRows.length,
        hasProfile: profileRow !== null,
        favoriteFoodIds: favoriteFoodIds.length,
      },
    };
  } catch (error) {
    return { ok: false, error: getSyncErrorMessage(error) };
  }
}
