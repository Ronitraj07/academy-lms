import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * OAuth callback handler.
 * After Google redirects back here, we:
 * 1. Exchange the code for a session
 * 2. Look up the user's role in the profiles table
 * 3. Redirect to the correct dashboard
 * 4. If no profile exists yet (first Google sign-in), create one with
 *    the role derived from ADMIN_EMAILS / FACULTY_EMAILS env vars
 */

const ADMIN_EMAILS   = (process.env.ADMIN_EMAILS   || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
const FACULTY_EMAILS = (process.env.FACULTY_EMAILS || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);

function getRoleFromEmail(email: string): 'admin' | 'faculty' | 'student' {
  const e = email.toLowerCase();
  if (ADMIN_EMAILS.includes(e))   return 'admin';
  if (FACULTY_EMAILS.includes(e)) return 'faculty';
  return 'student';
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code  = searchParams.get('code');
  const next  = searchParams.get('next') ?? '/';

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  let response = NextResponse.redirect(`${origin}/student`);

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

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  const user = data.user;
  const email = user.email || '';

  // Check if profile exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  let role: 'admin' | 'faculty' | 'student';

  if (existing?.role) {
    role = existing.role;
  } else {
    // First sign-in: derive role from email, create profile
    role = getRoleFromEmail(email);
    await supabase.from('profiles').upsert({
      user_id:    user.id,
      email:      email,
      full_name:  user.user_metadata?.full_name || user.user_metadata?.name || '',
      avatar_url: user.user_metadata?.avatar_url || '',
      role,
    });
  }

  const dest = role === 'admin' ? '/admin' : role === 'faculty' ? '/faculty' : '/student';

  response = NextResponse.redirect(`${origin}${dest}`);

  return response;
}
