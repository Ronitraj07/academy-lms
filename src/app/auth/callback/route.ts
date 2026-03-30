import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * OAuth callback — whitelist-gated.
 *
 * Flow:
 * 1. Exchange OAuth code for session
 * 2. Look up email in `allowed_users` table
 * 3. If NOT found  → destroy session, redirect /login?error=not_allowed
 * 4. If found      → upsert profile with role from allowed_users, redirect dashboard
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  // We need a mutable response so cookie helpers can write to it
  let response = NextResponse.redirect(`${origin}/login`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // 1. Exchange code → session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error('[auth/callback] exchange error:', error?.message);
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  const user  = data.user;
  const email = (user.email || '').toLowerCase().trim();

  // 2. Check whitelist
  const { data: allowed, error: wlErr } = await supabase
    .from('allowed_users')
    .select('role, is_active')
    .eq('email', email)
    .maybeSingle();

  if (wlErr) {
    console.error('[auth/callback] whitelist lookup error:', wlErr.message);
  }

  // 3. Not whitelisted or deactivated → destroy session & bounce
  if (!allowed || !allowed.is_active) {
    await supabase.auth.signOut();
    response = NextResponse.redirect(`${origin}/login?error=not_allowed`);
    return response;
  }

  // 4. Whitelisted → upsert profile with role from DB
  const role: 'admin' | 'faculty' | 'student' = allowed.role || 'student';

  await supabase.from('profiles').upsert(
    {
      user_id:    user.id,
      email,
      full_name:  user.user_metadata?.full_name || user.user_metadata?.name || '',
      avatar_url: user.user_metadata?.avatar_url || '',
      role,
    },
    { onConflict: 'user_id' }
  );

  // 5. Redirect to correct dashboard
  const dest = role === 'admin' ? '/admin' : role === 'faculty' ? '/faculty' : '/student';
  response = NextResponse.redirect(`${origin}${dest}`);
  return response;
}
