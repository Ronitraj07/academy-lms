/**
 * Single source of truth for demo mode detection.
 *
 * Rules:
 *  - If NEXT_PUBLIC_SUPABASE_URL is missing entirely  → demo
 *  - If it still holds the placeholder value          → demo
 *  - If NEXT_PUBLIC_DEMO_MODE=true is explicitly set  → demo
 *  - Everything else                                  → live
 *
 * Import this everywhere instead of inline string checks.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isDemoMode: boolean =
  process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
  !supabaseUrl ||
  !supabaseKey ||
  supabaseUrl === 'your_supabase_url_here' ||
  supabaseKey === 'your_supabase_anon_key_here';
