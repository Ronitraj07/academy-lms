import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * OAuth callback — whitelist-gated + tab-role mismatch guard.
 *
 * Flow:
 * 1. Exchange OAuth code for session
 * 2. Look up email in `allowed_users` table
 * 3. NOT found / deactivated  → destroy session, redirect /login?error=not_allowed
 * 4. Tab mismatch              → destroy session, redirect /login?error=wrong_tab
 * 5. All good                 → upsert profile with DB role, redirect dashboard
 *
 * NOTE: All cookie writes are applied to `response` BEFORE we ever reassign it,
 * so the session is always correctly persisted on the final redirect response.
 */

type ActualRole = 'student' | 'faculty' | 'admin';
type UITab      = 'student' | 'staff';

function tabMatchesRole(tab: UITab, role: ActualRole): boolean {
  return tab === 'student' ? role === 'student' : (role === 'faculty' || role === 'admin');
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // The login page passes ?tab=student|staff so we can enforce the same guard here
  const tab  = (searchParams.get('tab') || 'student') as UITab;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  // ─────────────────────────────────────────────────────────────────────
  // Use a single shared response object so all Set-Cookie headers land
  // on the exact response object the browser sees, not a discarded draft.
  // ─────────────────────────────────────────────────────────────────────
  const response = { current: NextResponse.redirect(`${origin}/login`) };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Write to the CURRENT response, not a captured snapshot
          response.current.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.current.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // 1. Exchange code → session (this writes auth cookies via the set() handler above)
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error('[auth/callback] exchange error:', error?.message);
    // Redirect, preserving any cookies already written
    response.current = NextResponse.redirect(`${origin}/login?error=oauth_failed`);
    return response.current;
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
    const r = NextResponse.redirect(`${origin}/login?error=not_allowed`);
    // Copy any cookies from the exchange step
    response.current.cookies.getAll().forEach(c => r.cookies.set(c));
    return r;
  }

  const role: ActualRole = (allowed.role as ActualRole) || 'student';

  // 4. Tab mismatch → destroy session & bounce
  if (!tabMatchesRole(tab, role)) {
    await supabase.auth.signOut();
    const r = NextResponse.redirect(`${origin}/login?error=wrong_tab`);
    response.current.cookies.getAll().forEach(c => r.cookies.set(c));
    return r;
  }

  // 5. Whitelisted + tab matches → upsert profile
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

  // 6. Redirect to correct dashboard, preserving session cookies
  const dest = role === 'admin' ? '/admin' : role === 'faculty' ? '/faculty' : '/student';
  const finalRedirect = NextResponse.redirect(`${origin}${dest}`);
  response.current.cookies.getAll().forEach(c => finalRedirect.cookies.set(c));
  return finalRedirect;
}
