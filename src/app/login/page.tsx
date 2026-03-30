'use client';

import { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  GraduationCap, Eye, EyeOff, Mail, Lock,
  Users, Briefcase, AlertCircle, ChevronDown,
  BookOpen, BarChart3, Shield, Zap, CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

type UIRole   = 'student' | 'staff';
type ActualRole = 'student' | 'faculty' | 'admin';

/* ─── credential sets ─────────────────────────────────────────────────────── */
const DEMO_CREDS = [
  { role: 'Student', tag: 'student', email: 'student@academy.test', password: 'student123!', color: 'bg-emerald-500' },
  { role: 'Faculty', tag: 'staff',   email: 'faculty@academy.test', password: 'faculty123!', color: 'bg-blue-500'    },
  { role: 'Admin',   tag: 'staff',   email: 'admin@academy.test',   password: 'admin123!',   color: 'bg-rose-500'    },
] as const;

/* ─── brand panel feature list ───────────────────────────────────────────── */
const FEATURES = [
  { icon: BookOpen,  label: 'Smart Timetable',      sub: 'Auto-generated schedules'     },
  { icon: BarChart3, label: 'Live Analytics',        sub: 'Real-time attendance insights' },
  { icon: Shield,    label: 'Role-based Access',     sub: 'Student · Faculty · Admin'    },
  { icon: Zap,       label: 'Instant Notifications', sub: 'Never miss an update'         },
] as const;

/* ─── reusable input ──────────────────────────────────────────────────────── */
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
            'w-full pl-10 pr-4 min-h-[48px] text-base rounded-xl border bg-background',
            'text-foreground placeholder:text-muted-foreground/60',
            'transition-all duration-150 focus:outline-none focus:ring-2',
            'hover:border-foreground/30',
            error
              ? 'border-destructive focus:ring-destructive/20 focus:border-destructive'
              : 'border-border focus:ring-primary/20 focus:border-primary',
            rightSlot && 'pr-12'
          )}
        />
        {rightSlot}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3 shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

/* ─── main component ─────────────────────────────────────────────────────── */
export default function LoginPage() {
  const uid              = useId();
  const router           = useRouter();
  const [role,    setRole]    = useState<UIRole>('student');
  const [email,   setEmail]   = useState('');
  const [password,setPassword]= useState('');
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [emailErr,setEmailErr]= useState('');
  const [showDemo,setShowDemo]= useState(false);
  const [fillAnim,setFillAnim]= useState<string | null>(null);

  const validateEmail = (v: string) => {
    if (!v)                               { setEmailErr('Email is required'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setEmailErr('Enter a valid email'); return false; }
    setEmailErr(''); return true;
  };

  /* one-click demo fill */
  const fillCred = (cred: typeof DEMO_CREDS[number]) => {
    setRole(cred.tag as UIRole);
    setEmail(cred.email);
    setPassword(cred.password);
    setError(''); setEmailErr('');
    setFillAnim(cred.role);
    setTimeout(() => setFillAnim(null), 600);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return;
    if (!password) { setError('Please enter your password'); return; }
    setLoading(true); setError('');

    try {
      const isDemo = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').includes('placeholder');

      if (isDemo) {
        const match = DEMO_CREDS.find(c => c.email === email && c.password === password);
        if (match) {
          const actualRole: ActualRole =
            match.role === 'Admin' ? 'admin' : match.role === 'Faculty' ? 'faculty' : 'student';
          localStorage.setItem('demo_user', JSON.stringify({
            email, role: actualRole,
            id: `demo-${actualRole}-1`,
            full_name: match.role + ' User',
          }));
          router.push(actualRole === 'admin' ? '/admin' : actualRole === 'faculty' ? '/faculty' : '/student');
        } else {
          setError('Invalid credentials. Try a demo account below.');
          setShowDemo(true);
        }
        return;
      }

      const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) { setError(authErr.message); return; }
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles').select('role').eq('user_id', data.user.id).single();
        const r: ActualRole = profile?.role || 'student';
        router.push(r === 'admin' ? '/admin' : r === 'faculty' ? '/faculty' : '/student');
      }
    } catch { setError('An unexpected error occurred. Please try again.'); }
    finally   { setLoading(false); }
  };

  const handleGoogle = async () => {
    if ((process.env.NEXT_PUBLIC_SUPABASE_URL || '').includes('placeholder')) {
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
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex lg:flex-row flex-col bg-background">

      {/* ── LEFT: Brand Panel (lg+) ───────────────────────────────────────── */}
      <div className="
        hidden lg:flex flex-col justify-between
        w-[480px] xl:w-[520px] shrink-0
        relative overflow-hidden
        bg-gradient-to-br from-primary via-violet-600 to-indigo-700
        p-10 xl:p-14
      ">
        {/* mesh background */}
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 -right-32 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3  w-72 h-72 rounded-full bg-white/8 blur-3xl" />
          {/* subtle grid */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`${uid}-grid`} width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${uid}-grid)`}/>
          </svg>
        </div>

        {/* logo */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center ring-1 ring-white/20">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl leading-tight">Academy LMS</h2>
              <p className="text-white/60 text-xs">Management System</p>
            </div>
          </div>
        </div>

        {/* headline */}
        <div className="relative space-y-6">
          <div>
            <h1 className="text-white font-bold leading-tight" style={{ fontSize:'clamp(2rem,3vw,2.75rem)' }}>
              Education,<br/>reimagined.
            </h1>
            <p className="text-white/70 text-base mt-3 leading-relaxed max-w-sm">
              A unified platform for students, faculty, and administrators — built for clarity, speed, and scale.
            </p>
          </div>

          {/* feature list */}
          <ul className="space-y-4">
            {FEATURES.map(({ icon: Icon, label, sub }) => (
              <li key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 ring-1 ring-white/15 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-white/90" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{label}</p>
                  <p className="text-white/55 text-xs">{sub}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* floating stat cards */}
          <div className="flex gap-3 pt-2">
            {[
              { value: '2.4k+', label: 'Students' },
              { value: '98%',   label: 'Uptime'   },
              { value: '150+',  label: 'Subjects'  },
            ].map(s => (
              <div key={s.label} className="flex-1 bg-white/10 rounded-2xl p-3 ring-1 ring-white/15 text-center">
                <p className="text-white font-bold text-lg leading-tight">{s.value}</p>
                <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* footer */}
        <p className="relative text-white/40 text-xs">© {new Date().getFullYear()} Academy LMS</p>
      </div>

      {/* ── RIGHT: Form Column ────────────────────────────────────────────── */}
      <div className="
        flex-1 flex flex-col items-center justify-start
        overflow-y-auto
        min-h-screen lg:min-h-0
        bg-background
        px-4 py-8 sm:py-12
      ">
        {/* mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-violet-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-gradient">Academy LMS</span>
        </div>

        {/* card */}
        <div className="w-full max-w-[460px] animate-fade-up">
          {/* heading */}
          <div className="mb-8">
            <h1 className="text-foreground font-bold" style={{ fontSize:'clamp(1.5rem,3vw,2rem)' }}>
              Welcome back
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Sign in to your account to continue
            </p>
          </div>

          {/* ── Role selector ─────────────────────────────────────────────── */}
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">I am a</p>
            <div className="relative flex gap-2 p-1 bg-muted rounded-2xl">
              {/* animated sliding pill */}
              <div
                aria-hidden
                className="absolute top-1 bottom-1 w-[calc(50%-6px)] rounded-xl bg-background shadow-card transition-transform duration-200 ease-standard"
                style={{ transform: role === 'student' ? 'translateX(4px)' : 'translateX(calc(100% + 4px))' }}
              />
              {(['student','staff'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setRole(r); setError(''); }}
                  aria-pressed={role === r}
                  className={cn(
                    'relative z-10 flex-1 flex items-center justify-center gap-2',
                    'min-h-[44px] rounded-xl font-medium text-sm',
                    'transition-colors duration-150',
                    role === r ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {r === 'student'
                    ? <Users    className="h-4 w-4" />
                    : <Briefcase className="h-4 w-4" />}
                  {r === 'student' ? 'Student' : 'Staff / Admin'}
                </button>
              ))}
            </div>
          </div>

          {/* ── Error banner ──────────────────────────────────────────────── */}
          {error && (
            <div
              role="alert" aria-live="assertive"
              className="mb-5 flex items-start gap-3 px-4 py-3 bg-destructive/8 border border-destructive/25 rounded-xl animate-scale-in"
            >
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* ── Form ──────────────────────────────────────────────────────── */}
          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            <Field
              id={`${uid}-email`}
              label="Email address"
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); if (emailErr) validateEmail(e.target.value); }}
              placeholder="you@example.com"
              autoComplete="email"
              error={emailErr}
              icon={Mail}
            />

            <Field
              id={`${uid}-password`}
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            <div className="flex justify-end -mt-2">
              <button type="button" className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className={cn(
                'group relative w-full min-h-[48px] px-6 rounded-xl font-semibold text-sm',
                'bg-gradient-to-r from-primary to-violet-600 text-white',
                'shadow-primary transition-all duration-150',
                'hover:shadow-lg hover:brightness-105 hover:-translate-y-px',
                'active:translate-y-0 active:brightness-95',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none',
                'overflow-hidden'
              )}
            >
              {/* shimmer */}
              <span
                aria-hidden
                className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"
                style={{ background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.2) 55%,transparent 70%)' }}
              />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Signing in...
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

          {/* ── Divider ───────────────────────────────────────────────────── */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-background text-xs text-muted-foreground">Or</span>
            </div>
          </div>

          {/* ── Google ────────────────────────────────────────────────────── */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className={cn(
              'w-full min-h-[48px] flex items-center justify-center gap-3 px-6 rounded-xl',
              'border border-border bg-background text-foreground font-medium text-sm',
              'hover:bg-muted transition-colors duration-150',
              'disabled:opacity-60 disabled:cursor-not-allowed',
              'focus:outline-none focus:ring-2 focus:ring-primary/20'
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

          {/* ── Demo Credentials ──────────────────────────────────────────── */}
          <div className="mt-6 rounded-2xl border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setShowDemo(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
              aria-expanded={showDemo}
              aria-controls="demo-creds-panel"
            >
              <span className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                Demo Credentials
              </span>
              <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', showDemo && 'rotate-180')} />
            </button>

            {showDemo && (
              <div id="demo-creds-panel" className="border-t border-border px-4 pb-4 pt-3 space-y-2 animate-fade-up">
                <p className="text-xs text-muted-foreground mb-3">Click any row to auto-fill credentials:</p>
                {DEMO_CREDS.map(c => (
                  <button
                    key={c.role}
                    type="button"
                    onClick={() => fillCred(c)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl',
                      'border border-transparent text-left',
                      'hover:bg-muted/60 hover:border-border transition-all duration-150',
                      fillAnim === c.role && 'bg-primary/5 border-primary/20'
                    )}
                  >
                    <div className={cn('w-2 h-2 rounded-full shrink-0', c.color)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">{c.role}</p>
                      <p className="text-[11px] text-muted-foreground font-mono truncate">{c.email}</p>
                    </div>
                    {fillAnim === c.role ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    ) : (
                      <ArrowRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            © {new Date().getFullYear()} Academy LMS — All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}
