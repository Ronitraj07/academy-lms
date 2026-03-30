'use client';

import { useState, useId, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, isDemoMode } from '@/lib/supabase';
import {
  BookOpen, Eye, EyeOff, Mail, Lock,
  Users, Briefcase, AlertCircle, ChevronDown,
  Zap, CheckCircle2, ArrowRight, ShieldOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

type UIRole     = 'student' | 'staff';
type ActualRole = 'student' | 'faculty' | 'admin';

const DEMO_CREDS = [
  { role: 'Student', tag: 'student', email: 'student@academy.test', password: 'student123!', color: 'bg-emerald-400' },
  { role: 'Faculty', tag: 'staff',   email: 'faculty@academy.test', password: 'faculty123!', color: 'bg-blue-400'    },
  { role: 'Admin',   tag: 'staff',   email: 'admin@academy.test',   password: 'admin123!',   color: 'bg-rose-400'    },
] as const;

/* ─────────────────────────────────────────────────────────────────────────
   Inner component — uses useSearchParams(), must be inside <Suspense>
───────────────────────────────────────────────────────────────────────── */
function LoginPageInner() {
  const uid          = useId();
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [role,     setRole]     = useState<UIRole>('student');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  const [fillAnim, setFillAnim] = useState<string | null>(null);

  useEffect(() => {
    const e = searchParams.get('error');
    if (e === 'not_allowed')  setError('Access denied. Your account has not been approved by an administrator.');
    else if (e === 'oauth_failed') setError('Google sign-in failed. Please try again.');
    else if (e === 'missing_code') setError('OAuth flow interrupted. Please try again.');
  }, [searchParams]);

  const validateEmail = (v: string) => {
    if (!v)                                        { setEmailErr('Email is required'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setEmailErr('Enter a valid email'); return false; }
    setEmailErr(''); return true;
  };

  const fillCred = (cred: typeof DEMO_CREDS[number]) => {
    setRole(cred.tag as UIRole);
    setEmail(cred.email);
    setPassword(cred.password);
    setError(''); setEmailErr('');
    setFillAnim(cred.role);
    setTimeout(() => setFillAnim(null), 700);
  };

  const redirect = (r: ActualRole) =>
    router.push(r === 'admin' ? '/admin' : r === 'faculty' ? '/faculty' : '/student');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return;
    if (!password) { setError('Please enter your password'); return; }
    setLoading(true); setError('');

    try {
      if (isDemoMode) {
        const match = DEMO_CREDS.find(
          c => c.email.toLowerCase() === email.trim().toLowerCase() && c.password === password
        );
        if (match) {
          const actualRole: ActualRole =
            match.role === 'Admin' ? 'admin' : match.role === 'Faculty' ? 'faculty' : 'student';
          localStorage.setItem('demo_user', JSON.stringify({
            email: match.email, role: actualRole,
            id: `demo-${actualRole}-1`,
            full_name: match.role + ' User',
          }));
          redirect(actualRole);
        } else {
          setError('Invalid credentials. Use a demo account below.');
          setShowDemo(true);
        }
        return;
      }

      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: email.trim(), password,
      });
      if (authErr) { setError(authErr.message); return; }

      if (data.user) {
        const userEmail = (data.user.email || '').toLowerCase().trim();
        const { data: allowed } = await supabase
          .from('allowed_users')
          .select('role, is_active')
          .eq('email', userEmail)
          .maybeSingle();

        if (!allowed || !allowed.is_active) {
          await supabase.auth.signOut();
          setError('Access denied. Your account has not been approved by an administrator.');
          return;
        }

        await supabase.from('profiles').upsert(
          { user_id: data.user.id, email: userEmail, role: allowed.role },
          { onConflict: 'user_id' }
        );
        redirect(allowed.role || 'student');
      }
    } catch { setError('An unexpected error occurred. Please try again.'); }
    finally   { setLoading(false); }
  };

  const handleGoogle = async () => {
    if (isDemoMode) { setError('Google sign-in is not available in demo mode.'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) setError(error.message);
    } catch { setError('Failed to sign in with Google.'); }
    finally  { setLoading(false); }
  };

  const roleLabel = role === 'student' ? 'Student' : 'Staff';
  const isAccessDenied = error.includes('Access denied');

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 40%, #0d2a4a 0%, #07111f 55%, #040d18 100%)',
      }}
    >
      {/* glow orb */}
      <div aria-hidden className="pointer-events-none fixed inset-0 flex items-center justify-center">
        <div
          className="w-[520px] h-[520px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #1e6fff 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
      </div>

      {/* glass card */}
      <div
        className="relative w-full max-w-[460px] rounded-2xl overflow-hidden animate-fade-up"
        style={{
          background: 'rgba(13, 22, 38, 0.82)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        <div className="px-8 py-9">

          {/* heading */}
          <div className="text-center mb-7">
            <div className="flex items-center justify-center gap-2 mb-3">
              <BookOpen className="h-6 w-6 text-white" strokeWidth={2} />
              <h1 className="text-white font-bold text-2xl tracking-tight">Sign in to Academy</h1>
            </div>
            <p className="text-white/45 text-sm">Access your dashboard</p>
          </div>

          <div className="h-px bg-white/8 mb-6" />

          {/* role tabs */}
          <div className="flex p-1 mb-6 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
            {(['student','staff'] as const).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => { setRole(r); setError(''); }}
                aria-pressed={role === r}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 min-h-[40px] rounded-md text-sm font-semibold transition-all duration-200',
                  role === r ? 'bg-blue-600 text-white shadow-md' : 'text-white/45 hover:text-white/70'
                )}
              >
                {r === 'student' ? <Users className="h-3.5 w-3.5" /> : <Briefcase className="h-3.5 w-3.5" />}
                {r === 'student' ? 'Student' : 'Staff'}
              </button>
            ))}
          </div>

          {/* error */}
          {error && (
            <div
              role="alert" aria-live="assertive"
              className="mb-5 flex items-start gap-2.5 px-3.5 py-3 rounded-xl text-sm animate-scale-in"
              style={{
                background: isAccessDenied ? 'rgba(251,191,36,0.10)' : 'rgba(239,68,68,0.12)',
                border:     isAccessDenied ? '1px solid rgba(251,191,36,0.25)' : '1px solid rgba(239,68,68,0.25)',
                color:      isAccessDenied ? '#fde68a' : '#fca5a5',
              }}
            >
              {isAccessDenied
                ? <ShieldOff   className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                : <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
              }
              <span>{error}</span>
            </div>
          )}

          {/* form */}
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div>
              <label htmlFor={`${uid}-em`} className="block text-sm font-medium text-white/60 mb-1.5">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none transition-colors group-focus-within:text-blue-400" />
                <input
                  id={`${uid}-em`}
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (emailErr) validateEmail(e.target.value); }}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  className={cn(
                    'w-full pl-10 pr-4 h-12 text-base rounded-xl text-white placeholder-white/25',
                    'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60',
                    emailErr ? 'border border-red-500/50' : 'border border-white/10 hover:border-white/20'
                  )}
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                />
              </div>
              {emailErr && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />{emailErr}
                </p>
              )}
            </div>

            <div>
              <label htmlFor={`${uid}-pw`} className="block text-sm font-medium text-white/60 mb-1.5">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none transition-colors group-focus-within:text-blue-400" />
                <input
                  id={`${uid}-pw`}
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-12 h-12 text-base rounded-xl text-white placeholder-white/30 border border-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60 transition-all duration-150"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <button type="button" className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="group relative w-full h-12 rounded-xl font-bold text-sm text-white overflow-hidden transition-all duration-150 hover:brightness-110 hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                boxShadow: '0 4px 20px rgba(37,99,235,0.45)',
              }}
            >
              <span
                aria-hidden
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500"
                style={{ background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.15) 55%,transparent 70%)' }}
              />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>
                    Login as {roleLabel}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-white/30">or</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full h-12 flex items-center justify-center gap-3 rounded-xl text-sm font-semibold text-white/80 hover:text-white transition-all duration-150 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          {/* demo creds */}
          <div className="mt-5 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            <button
              type="button"
              onClick={() => setShowDemo(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-white/35 hover:text-white/55 transition-colors"
              aria-expanded={showDemo}
            >
              <span className="flex items-center gap-2 font-medium">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                Demo Credentials
              </span>
              <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', showDemo && 'rotate-180')} />
            </button>
            {showDemo && (
              <div
                className="px-3 pb-3 pt-2 space-y-1.5"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p className="text-[11px] text-white/30 px-1 mb-2">Click to auto-fill:</p>
                {DEMO_CREDS.map(c => (
                  <button
                    key={c.role}
                    type="button"
                    onClick={() => fillCred(c)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150',
                      fillAnim === c.role
                        ? 'bg-blue-600/15 border border-blue-500/25'
                        : 'border border-transparent hover:bg-white/5 hover:border-white/8'
                    )}
                  >
                    <span className={cn('w-2 h-2 rounded-full shrink-0', c.color)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white/75">{c.role}</p>
                      <p className="text-[11px] font-mono text-white/35 truncate">{c.email}</p>
                    </div>
                    {fillAnim === c.role
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      : <ArrowRight   className="h-3   w-3   text-white/20  shrink-0" />
                    }
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="text-center text-sm text-white/30 mt-6">
            Need access?{' '}
            <a href="mailto:academyhub01@gmail.com" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Contact your administrator
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Default export — wraps inner component in Suspense so Next.js can
   statically prerender the shell while useSearchParams() stays client-only
───────────────────────────────────────────────────────────────────────── */
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%, #0d2a4a 0%, #07111f 55%, #040d18 100%)' }}
      >
        <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
      </div>
    }>
      <LoginPageInner />
    </Suspense>
  );
}
