'use client';

import { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isDemoMode } from '@/lib/supabase';
import {
  GraduationCap, Eye, EyeOff, Mail, Lock,
  Users, Briefcase, AlertCircle, ChevronDown,
  BookOpen, BarChart3, Shield, Zap, CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

type UIRole     = 'student' | 'staff';
type ActualRole = 'student' | 'faculty' | 'admin';

const DEMO_CREDS = [
  { role: 'Student', tag: 'student', email: 'student@academy.test', password: 'student123!', color: 'bg-emerald-500' },
  { role: 'Faculty', tag: 'staff',   email: 'faculty@academy.test', password: 'faculty123!', color: 'bg-blue-500'    },
  { role: 'Admin',   tag: 'staff',   email: 'admin@academy.test',   password: 'admin123!',   color: 'bg-rose-500'    },
] as const;

const FEATURES = [
  { icon: BookOpen,  label: 'Smart Timetable',      sub: 'Auto-generated schedules'      },
  { icon: BarChart3, label: 'Live Analytics',        sub: 'Real-time attendance insights'  },
  { icon: Shield,    label: 'Role-based Access',     sub: 'Student · Faculty · Admin'      },
  { icon: Zap,       label: 'Instant Notifications', sub: 'Never miss an update'           },
] as const;

/* ─── Field component ─────────────────────────────────────────────────────── */
function Field({
  id, label, type, value, onChange, placeholder, autoComplete,
  error, rightSlot, icon: Icon,
}: {
  id: string; label: string; type: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string; autoComplete: string;
  error?: string; rightSlot?: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1.5">
        {label}
      </label>
      <div className="relative group">
        <Icon className={cn(
          'absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-colors duration-150',
          error ? 'text-destructive' : 'text-muted-foreground group-focus-within:text-primary'
        )} />
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            'w-full pl-10 pr-4 min-h-[48px] text-base rounded-xl border',
            // card bg so inputs have depth on both light + dark
            'bg-card text-foreground placeholder:text-muted-foreground/60',
            'transition-all duration-150 focus:outline-none focus:ring-2',
            'hover:border-foreground/25',
            error
              ? 'border-destructive/60 focus:ring-destructive/20 focus:border-destructive'
              : 'border-border focus:ring-primary/20 focus:border-primary',
            rightSlot && 'pr-12'
          )}
        />
        {rightSlot}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3 shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const uid = useId();
  const router = useRouter();

  const [role,     setRole]     = useState<UIRole>('student');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  const [fillAnim, setFillAnim] = useState<string | null>(null);

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
      /* ── DEMO MODE ── use isDemoMode from supabase.ts (single source of truth) */
      if (isDemoMode) {
        const match = DEMO_CREDS.find(
          c => c.email.toLowerCase() === email.trim().toLowerCase()
            && c.password === password
        );
        if (match) {
          const actualRole: ActualRole =
            match.role === 'Admin' ? 'admin'
            : match.role === 'Faculty' ? 'faculty'
            : 'student';
          localStorage.setItem('demo_user', JSON.stringify({
            email: match.email,
            role: actualRole,
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

      /* ── REAL SUPABASE ── */
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authErr) {
        // If Supabase creds fail but matches demo creds, show helpful message
        const isDemoCred = DEMO_CREDS.some(
          c => c.email.toLowerCase() === email.trim().toLowerCase()
        );
        if (isDemoCred) {
          setError('This appears to be a demo credential. The app is running in live mode — please use a real account or check your .env setup.');
        } else {
          setError(authErr.message);
        }
        return;
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();
        const r: ActualRole = profile?.role || 'student';
        redirect(r);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (isDemoMode) {
      setError('Google sign-in is not available in demo mode.'); return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/student` },
      });
      if (error) setError(error.message);
    } catch { setError('Failed to sign in with Google.'); }
    finally  { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex lg:flex-row flex-col bg-muted/30">

      {/* ── LEFT brand panel ── desktop only ──────────────────────────────── */}
      <div className="
        hidden lg:flex flex-col justify-between
        w-[460px] xl:w-[500px] shrink-0
        relative overflow-hidden
        bg-gradient-to-br from-primary via-violet-600 to-indigo-700
        p-10 xl:p-14
      ">
        {/* decorative blobs */}
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2  -right-32 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3  w-72 h-72 rounded-full bg-white/8 blur-3xl" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`${uid}-g`} width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${uid}-g)`}/>
          </svg>
        </div>

        {/* logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center ring-1 ring-white/20">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">Academy LMS</p>
            <p className="text-white/55 text-xs">Management System</p>
          </div>
        </div>

        {/* headline + features */}
        <div className="relative space-y-8">
          <div>
            <h1 className="text-white font-bold leading-[1.15]" style={{fontSize:'clamp(2rem,2.8vw,2.6rem)'}}>
              Education,<br/>reimagined.
            </h1>
            <p className="text-white/65 text-sm mt-3 leading-relaxed max-w-xs">
              A unified platform for students, faculty, and administrators — built for clarity and scale.
            </p>
          </div>

          <ul className="space-y-3.5">
            {FEATURES.map(({ icon: Icon, label, sub }) => (
              <li key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 ring-1 ring-white/15 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-white/85" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{label}</p>
                  <p className="text-white/50 text-xs">{sub}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex gap-2.5">
            {[{v:'2.4k+',l:'Students'},{v:'98%',l:'Uptime'},{v:'150+',l:'Subjects'}].map(s=>(
              <div key={s.l} className="flex-1 bg-white/10 rounded-2xl p-3 ring-1 ring-white/15 text-center">
                <p className="text-white font-bold text-base leading-tight">{s.v}</p>
                <p className="text-white/55 text-[11px] mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-white/35 text-xs">© {new Date().getFullYear()} Academy LMS</p>
      </div>

      {/* ── RIGHT form column ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto px-4 py-10 sm:py-14">

        {/* mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-violet-600 rounded-xl flex items-center justify-center shadow-primary">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-gradient">Academy LMS</span>
        </div>

        {/* form card */}
        <div className="w-full max-w-[420px] bg-card rounded-2xl shadow-modal border border-border p-6 sm:p-8 animate-fade-up">

          {/* heading */}
          <div className="mb-7">
            <h2 className="text-foreground font-bold text-2xl">Welcome back</h2>
            <p className="text-muted-foreground text-sm mt-1">Sign in to continue to Academy LMS</p>
          </div>

          {/* role selector */}
          <div className="mb-6">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">I am a</p>
            <div className="relative flex p-1 bg-muted rounded-xl">
              {/* sliding pill */}
              <div
                aria-hidden
                className="absolute top-1 bottom-1 rounded-lg bg-card shadow-sm border border-border/50 transition-transform duration-200"
                style={{
                  width: 'calc(50% - 6px)',
                  transform: role === 'student' ? 'translateX(4px)' : 'translateX(calc(100% + 4px))',
                }}
              />
              {(['student','staff'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setRole(r); setError(''); }}
                  aria-pressed={role === r}
                  className={cn(
                    'relative z-10 flex-1 flex items-center justify-center gap-1.5',
                    'min-h-[40px] rounded-lg text-sm font-medium transition-colors duration-150',
                    role === r ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'
                  )}
                >
                  {r === 'student' ? <Users className="h-3.5 w-3.5" /> : <Briefcase className="h-3.5 w-3.5" />}
                  {r === 'student' ? 'Student' : 'Staff / Admin'}
                </button>
              ))}
            </div>
          </div>

          {/* error */}
          {error && (
            <div
              role="alert" aria-live="assertive"
              className="mb-5 flex items-start gap-2.5 px-3.5 py-3 bg-destructive/8 border border-destructive/20 rounded-xl text-sm text-destructive animate-scale-in"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* form */}
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <Field
              id={`${uid}-em`}
              label="Email address"
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); if (emailErr) validateEmail(e.target.value); }}
              placeholder="you@example.com"
              autoComplete="email"
              error={emailErr}
              icon={Mail}
            />

            <div>
              <Field
                id={`${uid}-pw`}
                label="Password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                icon={Lock}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
              <div className="flex justify-end mt-1.5">
                <button type="button" className="text-xs text-primary hover:text-primary/75 font-medium transition-colors">
                  Forgot password?
                </button>
              </div>
            </div>

            {/* submit */}
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className={cn(
                'group relative w-full min-h-[48px] rounded-xl font-semibold text-sm text-white overflow-hidden',
                'bg-gradient-to-r from-primary to-violet-600',
                'shadow-primary transition-all duration-150',
                'hover:brightness-110 hover:-translate-y-px hover:shadow-lg',
                'active:translate-y-0 active:brightness-95',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                'disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none'
              )}
            >
              {/* shimmer sweep */}
              <span
                aria-hidden
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500"
                style={{background:'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.18) 55%,transparent 70%)'}}
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
                    Sign in
                    <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center"><span className="px-3 bg-card text-xs text-muted-foreground">or continue with</span></div>
          </div>

          {/* google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className={cn(
              'w-full min-h-[48px] flex items-center justify-center gap-2.5 px-5 rounded-xl',
              'bg-card border border-border text-foreground text-sm font-medium',
              'hover:bg-muted transition-colors duration-150',
              'disabled:opacity-55 disabled:cursor-not-allowed',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30'
            )}
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* demo creds */}
          <div className="mt-5 rounded-xl border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setShowDemo(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-muted-foreground hover:bg-muted/40 transition-colors"
              aria-expanded={showDemo}
            >
              <span className="flex items-center gap-2 font-medium">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                Demo Credentials
              </span>
              <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', showDemo && 'rotate-180')} />
            </button>

            {showDemo && (
              <div className="border-t border-border px-3 pb-3 pt-2.5 space-y-1.5 animate-fade-up">
                <p className="text-[11px] text-muted-foreground px-1 mb-2">Click to auto-fill &amp; sign in:</p>
                {DEMO_CREDS.map(c => (
                  <button
                    key={c.role}
                    type="button"
                    onClick={() => fillCred(c)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left',
                      'border transition-all duration-150',
                      fillAnim === c.role
                        ? 'bg-primary/8 border-primary/25'
                        : 'border-transparent hover:bg-muted/50 hover:border-border'
                    )}
                  >
                    <span className={cn('w-2 h-2 rounded-full shrink-0', c.color)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">{c.role}</p>
                      <p className="text-[11px] font-mono text-muted-foreground truncate">{c.email}</p>
                    </div>
                    {fillAnim === c.role
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      : <ArrowRight   className="h-3   w-3   text-muted-foreground/40 shrink-0" />
                    }
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="text-center text-[11px] text-muted-foreground mt-6">
            © {new Date().getFullYear()} Academy LMS · All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}
