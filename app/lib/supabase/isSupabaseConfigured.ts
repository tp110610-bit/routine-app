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
  invalidKeys: SupabaseEnvKey[];
};

function normalizeEnvValue(value: string | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function isSupabaseProjectUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

function isSafeHeaderValue(value: string) {
  return /^[\x20-\x7E]+$/.test(value);
}

export function getSupabaseEnvStatus(): SupabaseEnvStatus {
  const url = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const missingKeys: SupabaseEnvKey[] = [];
  const invalidKeys: SupabaseEnvKey[] = [];

  if (!url) {
    missingKeys.push("NEXT_PUBLIC_SUPABASE_URL");
  } else if (!isSupabaseProjectUrl(url)) {
    invalidKeys.push("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!anonKey) {
    missingKeys.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  } else if (!isSafeHeaderValue(anonKey)) {
    invalidKeys.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return {
    isConfigured: missingKeys.length === 0 && invalidKeys.length === 0,
    url,
    anonKey,
    missingKeys,
    invalidKeys,
  };
}

export function isSupabaseConfigured() {
  return getSupabaseEnvStatus().isConfigured;
}

export function getSupabaseMissingEnvMessage(missingKeys: readonly SupabaseEnvKey[]) {
  return `Supabase environment variables are not configured: ${missingKeys.join(", ")}. Set them in .env.local or Vercel project settings.`;
}

export function getSupabaseInvalidEnvMessage(invalidKeys: readonly SupabaseEnvKey[]) {
  return `Supabase environment variables are invalid: ${invalidKeys.join(", ")}. Use a Project URL and an ASCII anon public key.`;
}
