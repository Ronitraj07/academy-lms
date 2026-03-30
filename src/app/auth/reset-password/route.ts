/**
 * /auth/reset-password  (GET handler)
 *
 * Supabase sends the user here after they click the reset-password email link.
 * The URL contains ?token_hash=...&type=recovery
 *
 * We exchange the token for a session server-side, then redirect to the
 * /auth/reset-password PAGE (which is a Client Component that calls updateUser).
 *
 * Why a separate route.ts?
 * Supabase's email link carries token_hash + type as query params, not a hash
 * fragment, so they ARE available on the server. We exchange here so the
 * session cookies are set before the React page renders.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type       = searchParams.get('type');

  if (!token_hash || type !== 'recovery') {
    // Malformed or expired link — send back to login with a clear error
    return NextResponse.redirect(`${origin}/login?error=invalid_reset_link`);
  }

  // Shared response ref so Set-Cookie headers land on the final response
  const response = { current: NextResponse.redirect(`${origin}/login?error=reset_failed`) };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.current.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.current.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { error } = await supabase.auth.verifyOtp({ token_hash, type: 'recovery' });

  if (error) {
    console.error('[reset-password/route] verifyOtp error:', error.message);
    const r = NextResponse.redirect(`${origin}/login?error=reset_failed`);
    response.current.cookies.getAll().forEach(c => r.cookies.set(c));
    return r;
  }

  // Session is now valid — redirect to the React page so the user can set a new password
  const dest = NextResponse.redirect(`${origin}/auth/reset-password/set`);
  response.current.cookies.getAll().forEach(c => dest.cookies.set(c));
  return dest;
}
