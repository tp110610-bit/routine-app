import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabaseInvalidEnvMessage,
  getSupabaseEnvStatus,
  getSupabaseMissingEnvMessage,
} from "./isSupabaseConfigured";
import type { Database } from "./types";

export type AppSupabaseClient = SupabaseClient<Database>;

let browserClient: AppSupabaseClient | null = null;

export function createBrowserSupabaseClient(): AppSupabaseClient | null {
  const env = getSupabaseEnvStatus();

  if (!env.isConfigured) {
    return null;
  }

  browserClient ??= createClient<Database>(env.url, env.anonKey);
  return browserClient;
}

export function requireBrowserSupabaseClient(): AppSupabaseClient {
  const client = createBrowserSupabaseClient();

  if (!client) {
    const env = getSupabaseEnvStatus();
    const message = env.missingKeys.length > 0
      ? getSupabaseMissingEnvMessage(env.missingKeys)
      : getSupabaseInvalidEnvMessage(env.invalidKeys);
    throw new Error(message);
  }

  return client;
}
