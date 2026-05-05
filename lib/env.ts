function getEnvValue(key: string) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function normalizeSupabaseProjectUrl(value: string) {
  const dashboardMatch = value.match(/^https:\/\/supabase\.com\/dashboard\/project\/([a-z0-9-]+)\/?$/i);
  if (dashboardMatch) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  return value;
}

export function getSupabaseUrl() {
  return normalizeSupabaseProjectUrl(getEnvValue("NEXT_PUBLIC_SUPABASE_URL"));
}

export function getSupabaseAnonKey() {
  return getEnvValue("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export function getSupabaseServiceRoleKey() {
  return getEnvValue("SUPABASE_SERVICE_ROLE_KEY");
}

export function getSectorCode() {
  return getEnvValue("SECTOR_CODE");
}
