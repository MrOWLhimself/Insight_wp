import { createClient, SupabaseClient } from "@supabase/supabase-js";

// This is a browser-safe client using the anon key (protected by RLS —
// "Public insert" policies on the analytics_* tables allow anonymous
// writes, but reads require an admin role). Never put the service role
// key here; that one stays server-only in lib/supabase.ts.
//
// Created lazily, same reasoning as lib/supabase.ts: Next.js touches this
// module during build-time prerendering of every page (including
// /_not-found) since it's imported by a client component mounted in the
// root layout — an eager createClient() call there throws "supabaseUrl is
// required" if the env var isn't in scope for that specific build phase.

let _client: SupabaseClient | null = null;

export function getSupabasePublic(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set."
    );
  }

  _client = createClient(url, key);
  return _client;
}
