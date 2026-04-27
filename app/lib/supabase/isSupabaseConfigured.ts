export const SUPABASE_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

export type SupabaseEnvKey = (typeof SUPABASE_ENV_KEYS)[number];

export type SupabaseEnvStatus = {
  isConfigured: boolean;
  url: string;
  anonKey: string;
  missingKeys: SupabaseEnvKey[];
};

function normalizeEnvValue(value: string | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

export function getSupabaseEnvStatus(): SupabaseEnvStatus {
  const url = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const missingKeys: SupabaseEnvKey[] = [];

  if (!url) {
    missingKeys.push("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!anonKey) {
    missingKeys.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return {
    isConfigured: missingKeys.length === 0,
    url,
    anonKey,
    missingKeys,
  };
}

export function isSupabaseConfigured() {
  return getSupabaseEnvStatus().isConfigured;
}

export function getSupabaseMissingEnvMessage(missingKeys: readonly SupabaseEnvKey[]) {
  return `Supabase environment variables are not configured: ${missingKeys.join(", ")}. Set them in .env.local or Vercel project settings.`;
}
