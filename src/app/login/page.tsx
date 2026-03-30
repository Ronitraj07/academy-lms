'use client';

import { useState, useId, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  BookOpen, Eye, EyeOff, Mail, Lock,
  Users, Briefcase, AlertCircle, ShieldOff,
  ArrowRight, KeyRound, CheckCircle2, LogIn,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
type UIRole     = 'student' | 'staff';
type ActualRole = 'student' | 'faculty' | 'admin';
type Screen     = 'login' | 'forgot' | 'forgot_sent';

interface AllowedUserRow { role: string; is_active: boolean; }

// ─── Role mapping ─────────────────────────────────────────────────────────────
// "student" tab  → only allows actual role: student
// "staff"   tab  → allows actual roles: faculty | admin
function tabMatchesRole(tab: UIRole, actualRole: ActualRole): boolean {
  if (tab === 'student') return actualRole === 'student';
  return actualRole === 'faculty' || actualRole === 'admin';
}

function wrongTabMessage(actualRole: ActualRole): string {
  if (actualRole === 'student')
    return "You're registered as a Student. Please use the Student tab to sign in.";
  return "You're registered as Staff. Please use the Staff tab to sign in.";
}

// ─── Shared animation/style block ────────────────────────────────────────────
const STYLES = `
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes spin { to { transform:rotate(360deg); } }
  .lp-card   { animation: fadeUp .42s cubic-bezier(.16,1,.3,1) both; }
  .lp-screen { animation: fadeIn .22s ease both; }
  .lp-spin   { animation: spin .7s linear infinite; }
  .lp-field:focus {
    border-color: rgba(99,102,241,.7) !important;
    box-shadow: 0 0 0 3px rgba(99,102,241,.13);
  }
  .lp-field-err:focus {
    border-color: rgba(239,68,68,.6) !important;
    box-shadow: 0 0 0 3px rgba(239,68,68,.1);
  }
  .lp-btn-primary {
    position:relative; overflow:hidden;
    background: linear-gradient(135deg,#4f46e5 0%,#3730a3 100%);
    box-shadow: 0 4px 18px rgba(79,70,229,.4);
    transition: transform .15s, opacity .15s, box-shadow .15s;
  }
  .lp-btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(79,70,229,.5);
  }
  .lp-btn-primary:active:not(:disabled) { transform: translateY(0); }
  .lp-btn-primary::after {
    content:''; position:absolute; inset:0;
    background: linear-gradient(105deg,transparent 40%,rgba(255,255,255,.12) 55%,transparent 70%);
    transform: translateX(-100%); transition: transform .5s ease;
  }
  .lp-btn-primary:hover:not(:disabled)::after { transform: translateX(100%); }
  .lp-tab-active {
    background: linear-gradient(135deg,#4f46e5,#4338ca);
    color:#fff;
    box-shadow: 0 2px 12px rgba(79,70,229,.45);
  }
  .lp-tab-inactive {
    background: transparent;
    color: rgba(255,255,255,.35);
  }
  .lp-tab-inactive:hover { color: rgba(255,255,255,.6); }
`;

// ─── Field component ──────────────────────────────────────────────────────────
function Field({
  id, label, type, value, onChange, placeholder, autoComplete, icon: Icon, right, error,
}: {
  id: string; label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string; autoComplete: string;
  icon: React.ElementType; right?: React.ReactNode; error?: string;
}) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
      <label htmlFor={id} style={{ fontSize:12, fontWeight:500, color:'rgba(255,255,255,.5)' }}>
        {label}
      </label>
      <div style={{ position:'relative' }}>
        <Icon style={{
          position:'absolute', left:13, top:'50%', transform:'translateY(-50%)',
          width:15, height:15, color:'rgba(255,255,255,.25)', pointerEvents:'none',
        }} />
        <input
          id={id} type={type} value={value} autoComplete={autoComplete}
          placeholder={placeholder} required
          onChange={e => onChange(e.target.value)}
          className={error ? 'lp-field-err' : 'lp-field'}
          style={{
            width:'100%', boxSizing:'border-box',
            paddingLeft:40, paddingRight: right ? 44 : 14,
            height:48, borderRadius:12, fontSize:14,
            color:'#fff', background:'rgba(255,255,255,.07)',
            border: error
              ? '1.5px solid rgba(239,68,68,.45)'
              : '1.5px solid rgba(255,255,255,.1)',
            outline:'none', transition:'border-color .15s, box-shadow .15s',
          }}
        />
        {right}
      </div>
      {error && (
        <p style={{ fontSize:11, color:'#f87171', display:'flex', alignItems:'center', gap:4, margin:0 }}>
          <AlertCircle style={{ width:11, height:11, flexShrink:0 }} />{error}
        </p>
      )}
    </div>
  );
}

// ─── Error / info banner ──────────────────────────────────────────────────────
type BannerVariant = 'error' | 'warn' | 'success';
function Banner({ msg, variant = 'error' }: { msg: string; variant?: BannerVariant }) {
  const cfg = {
    error:   { bg:'rgba(239,68,68,.12)',   border:'rgba(239,68,68,.28)',   text:'#fca5a5', Icon: AlertCircle,   ic:'#f87171' },
    warn:    { bg:'rgba(251,191,36,.10)',  border:'rgba(251,191,36,.28)',  text:'#fde68a', Icon: ShieldOff,     ic:'#fbbf24' },
    success: { bg:'rgba(34,197,94,.10)',   border:'rgba(34,197,94,.28)',   text:'#86efac', Icon: CheckCircle2,  ic:'#4ade80' },
  }[variant];
  return (
    <div style={{
      display:'flex', alignItems:'flex-start', gap:9,
      padding:'11px 13px', borderRadius:12, fontSize:12,
      background:cfg.bg, border:`1px solid ${cfg.border}`, color:cfg.text,
    }}>
      <cfg.Icon style={{ width:14, height:14, flexShrink:0, marginTop:1, color:cfg.ic }} />
      <span style={{ lineHeight:1.5 }}>{msg}</span>
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="lp-spin" style={{ width:15, height:15 }} fill="none" viewBox="0 0 24 24">
      <circle style={{ opacity:.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path  style={{ opacity:.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
}

// ─── Google SVG ───────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg style={{ width:16, height:16, flexShrink:0 }} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="lp-card" style={{
      position:'relative', width:'100%', maxWidth:428,
      borderRadius:20, overflow:'hidden',
      background:'rgba(9,16,30,.92)',
      backdropFilter:'blur(28px)', WebkitBackdropFilter:'blur(28px)',
      border:'1.5px solid rgba(255,255,255,.09)',
      boxShadow:'0 32px 64px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.03)',
    }}>
      {children}
    </div>
  );
}

// ─── Main inner component ─────────────────────────────────────────────────────
function LoginPageInner() {
  const uid          = useId();
  const router       = useRouter();
  const searchParams = useSearchParams();

  // screens
  const [screen, setScreen] = useState<Screen>('login');

  // login state
  const [tab,      setTab]      = useState<UIRole>('student');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [emailErr, setEmailErr] = useState('');

  // forgot password state
  const [fpEmail,    setFpEmail]    = useState('');
  const [fpEmailErr, setFpEmailErr] = useState('');
  const [fpLoading,  setFpLoading]  = useState(false);
  const [fpError,    setFpError]    = useState('');

  // ── URL error params from OAuth callback ──
  useEffect(() => {
    const e = searchParams.get('error');
    if      (e === 'not_allowed')   setError('Access denied. Your account has not been approved by an administrator.');
    else if (e === 'oauth_failed')  setError('Google sign-in failed. Please try again.');
    else if (e === 'missing_code')  setError('OAuth flow interrupted. Please try again.');
    else if (e === 'wrong_tab')     setError('You signed in via Google but your role doesn\'t match the selected tab. Please select the correct tab.');
  }, [searchParams]);

  // ── Helpers ──
  const validateEmail = (v: string, setter: (s: string) => void) => {
    if (!v)                                      { setter('Email is required'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))  { setter('Enter a valid email'); return false; }
    setter(''); return true;
  };

  const goToDashboard = (r: ActualRole) =>
    router.push(r === 'admin' ? '/admin' : r === 'faculty' ? '/faculty' : '/student');

  // ── Password login ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email, setEmailErr)) return;
    if (!password) { setError('Please enter your password.'); return; }
    setLoading(true); setError('');

    try {
      const supabase = createClient();
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authErr) {
        // Surface a friendlier message for the most common errors
        if (authErr.message.toLowerCase().includes('invalid login credentials')) {
          setError('Incorrect email or password. Please try again.');
        } else {
          setError(authErr.message);
        }
        return;
      }

      if (data.user) {
        const userEmail = (data.user.email || '').toLowerCase().trim();

        const { data: allowed, error: wlErr } = await supabase
          .from('allowed_users' as any)
          .select('role, is_active')
          .eq('email', userEmail)
          .maybeSingle();

        if (wlErr) console.error('Whitelist lookup:', wlErr.message);
        const row = allowed as AllowedUserRow | null;

        // ── 1. Not whitelisted or deactivated
        if (!row || !row.is_active) {
          await supabase.auth.signOut();
          setError('Access denied. Your account has not been approved by an administrator.');
          return;
        }

        const actualRole = (row.role as ActualRole) || 'student';

        // ── 2. TAB MISMATCH CHECK ──────────────────────────────────────────
        if (!tabMatchesRole(tab, actualRole)) {
          await supabase.auth.signOut();
          setError(wrongTabMessage(actualRole));
          return;
        }

        // ── 3. Upsert profile
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('profiles') as any).upsert(
          { user_id: data.user.id, email: userEmail, role: actualRole },
          { onConflict: 'user_id' }
        );

        goToDashboard(actualRole);
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth ──
  // We pass the selected tab as a query param so the callback can do the
  // same role/tab check on the server side.
  const handleGoogle = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const callbackUrl = `${window.location.origin}/auth/callback?tab=${tab}`;
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: callbackUrl },
      });
      if (oauthErr) setError(oauthErr.message);
    } catch {
      setError('Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot password ──
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(fpEmail, setFpEmailErr)) return;
    setFpLoading(true); setFpError('');

    try {
      const supabase = createClient();
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(
        fpEmail.trim().toLowerCase(),
        { redirectTo: `${window.location.origin}/auth/reset-password` }
      );
      if (resetErr) {
        setFpError(resetErr.message);
      } else {
        setScreen('forgot_sent');
      }
    } catch {
      setFpError('Failed to send reset email. Please try again.');
    } finally {
      setFpLoading(false);
    }
  };

  // ── Error category helpers ──
  const isAccessDenied  = error.includes('Access denied') || error.includes('not been approved');
  const isWrongTab      = error.includes('tab') && (error.includes('Student') || error.includes('Staff'));
  const bannerVariant   = (isAccessDenied || isWrongTab) ? 'warn' : 'error';

  // ─── Shared header ─────────────────────────────────────────────────────────
  const Header = ({ subtitle }: { subtitle: string }) => (
    <div style={{ textAlign:'center', marginBottom:22 }}>
      <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:9, marginBottom:7 }}>
        <div style={{
          width:36, height:36, borderRadius:10,
          background:'linear-gradient(135deg,#4f46e5,#7c3aed)',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 4px 14px rgba(79,70,229,.4)',
        }}>
          <BookOpen style={{ width:18, height:18, color:'#fff' }} />
        </div>
        <h1 style={{ margin:0, color:'#fff', fontSize:20, fontWeight:700, letterSpacing:'-.35px' }}>
          Academy LMS
        </h1>
      </div>
      <p style={{ margin:0, color:'rgba(255,255,255,.35)', fontSize:12.5 }}>{subtitle}</p>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // SCREEN: forgot_sent
  // ─────────────────────────────────────────────────────────────────────────
  if (screen === 'forgot_sent') {
    return (
      <div className="lp-screen" style={{ padding:'32px 28px 28px' }}>
        <Header subtitle="Password reset sent" />
        <div style={{ height:1, background:'rgba(255,255,255,.07)', marginBottom:22 }} />
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14, textAlign:'center' }}>
          <div style={{
            width:56, height:56, borderRadius:'50%',
            background:'rgba(34,197,94,.12)', border:'1.5px solid rgba(34,197,94,.25)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <CheckCircle2 style={{ width:26, height:26, color:'#4ade80' }} />
          </div>
          <p style={{ color:'rgba(255,255,255,.7)', fontSize:13.5, lineHeight:1.6, margin:0 }}>
            We've sent a password reset link to<br />
            <strong style={{ color:'#fff' }}>{fpEmail}</strong>
          </p>
          <p style={{ color:'rgba(255,255,255,.3)', fontSize:12, margin:0 }}>
            Check your inbox and spam folder.<br/>
            The link expires in 1 hour.
          </p>
        </div>
        <div style={{ height:1, background:'rgba(255,255,255,.07)', margin:'22px 0' }} />
        <button
          onClick={() => { setScreen('login'); setFpEmail(''); setFpError(''); }}
          style={{
            width:'100%', height:44, borderRadius:12,
            background:'rgba(255,255,255,.08)', border:'1.5px solid rgba(255,255,255,.12)',
            color:'rgba(255,255,255,.75)', fontSize:13, fontWeight:600,
            cursor:'pointer', transition:'background .15s',
            display:'flex', alignItems:'center', justifyContent:'center', gap:7,
          }}
        >
          <LogIn style={{ width:14, height:14 }} />
          Back to Sign In
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SCREEN: forgot
  // ─────────────────────────────────────────────────────────────────────────
  if (screen === 'forgot') {
    return (
      <div className="lp-screen" style={{ padding:'32px 28px 28px' }}>
        <Header subtitle="We'll email you a reset link" />
        <div style={{ height:1, background:'rgba(255,255,255,.07)', marginBottom:22 }} />

        {fpError && (
          <div style={{ marginBottom:16 }}>
            <Banner msg={fpError} variant="error" />
          </div>
        )}

        <form onSubmit={handleForgotPassword} noValidate style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Field
            id={`${uid}-fp-em`} label="Your email address" type="email"
            value={fpEmail} onChange={v => { setFpEmail(v); if (fpEmailErr) validateEmail(v, setFpEmailErr); }}
            placeholder="Enter your registered email" autoComplete="email"
            icon={Mail} error={fpEmailErr}
          />

          <button
            type="submit" disabled={fpLoading}
            className="lp-btn-primary"
            style={{
              width:'100%', height:48, borderRadius:12,
              fontWeight:700, fontSize:13.5, color:'#fff', border:'none',
              cursor: fpLoading ? 'not-allowed' : 'pointer',
              opacity: fpLoading ? .7 : 1,
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            }}
          >
            {fpLoading ? <><Spinner />Sending…</> : <><KeyRound style={{ width:14, height:14 }} />Send Reset Link</>}
          </button>
        </form>

        <div style={{ height:1, background:'rgba(255,255,255,.07)', margin:'20px 0' }} />
        <button
          type="button"
          onClick={() => { setScreen('login'); setFpEmail(''); setFpError(''); setFpEmailErr(''); }}
          style={{
            width:'100%', background:'none', border:'none', cursor:'pointer',
            color:'rgba(255,255,255,.35)', fontSize:12.5, fontWeight:500,
            padding:0, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
          }}
        >
          ← Back to Sign In
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SCREEN: login (default)
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="lp-screen" style={{ padding:'32px 28px 28px' }}>
      <Header subtitle="Sign in to your dashboard" />

      {/* Divider */}
      <div style={{ height:1, background:'rgba(255,255,255,.07)', marginBottom:22 }} />

      {/* Role tabs */}
      <div style={{
        display:'flex', padding:4, borderRadius:13, marginBottom:20,
        background:'rgba(255,255,255,.05)',
        border:'1px solid rgba(255,255,255,.07)',
      }}>
        {(['student', 'staff'] as UIRole[]).map(t => (
          <button
            key={t} type="button"
            onClick={() => { setTab(t); setError(''); }}
            className={tab === t ? 'lp-tab-active' : 'lp-tab-inactive'}
            style={{
              flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
              height:36, borderRadius:10, fontSize:12.5, fontWeight:600,
              border:'none', cursor:'pointer', transition:'all .2s',
            }}
          >
            {t === 'student'
              ? <Users style={{ width:13, height:13 }} />
              : <Briefcase style={{ width:13, height:13 }} />}
            {t === 'student' ? 'Student' : 'Staff / Admin'}
          </button>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ marginBottom:16 }}>
          <Banner msg={error} variant={bannerVariant} />
        </div>
      )}

      {/* Login form */}
      <form onSubmit={handleLogin} noValidate style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <Field
          id={`${uid}-em`} label="Email" type="email"
          value={email} onChange={v => { setEmail(v); if (emailErr) validateEmail(v, setEmailErr); }}
          placeholder="Enter your email" autoComplete="email"
          icon={Mail} error={emailErr}
        />
        <Field
          id={`${uid}-pw`} label="Password" type={showPw ? 'text' : 'password'}
          value={password} onChange={setPassword}
          placeholder="Enter your password" autoComplete="current-password"
          icon={Lock}
          right={
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              style={{
                position:'absolute', right:11, top:'50%', transform:'translateY(-50%)',
                background:'none', border:'none', cursor:'pointer', padding:4,
                color:'rgba(255,255,255,.28)',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}
            >
              {showPw
                ? <EyeOff style={{ width:15, height:15 }} />
                : <Eye    style={{ width:15, height:15 }} />}
            </button>
          }
        />

        {/* Forgot password link */}
        <div style={{ textAlign:'right', marginTop:-6 }}>
          <button
            type="button"
            onClick={() => { setScreen('forgot'); setFpEmail(email); setFpError(''); setFpEmailErr(''); }}
            style={{
              background:'none', border:'none', cursor:'pointer',
              fontSize:12, color:'#818cf8', fontWeight:500, padding:0,
              transition:'color .15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#a5b4fc')}
            onMouseLeave={e => (e.currentTarget.style.color = '#818cf8')}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit" disabled={loading}
          className="lp-btn-primary"
          style={{
            width:'100%', height:48, borderRadius:12,
            fontWeight:700, fontSize:14, color:'#fff', border:'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? .7 : 1,
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          }}
        >
          {loading
            ? <><Spinner />Signing in…</>
            : <><ArrowRight style={{ width:15, height:15 }} />Sign In as {tab === 'student' ? 'Student' : 'Staff'}</>}
        </button>
      </form>

      {/* Divider */}
      <div style={{ display:'flex', alignItems:'center', gap:10, margin:'18px 0' }}>
        <div style={{ flex:1, height:1, background:'rgba(255,255,255,.07)' }} />
        <span style={{ fontSize:11.5, color:'rgba(255,255,255,.22)', letterSpacing:'.5px' }}>OR</span>
        <div style={{ flex:1, height:1, background:'rgba(255,255,255,.07)' }} />
      </div>

      {/* Google sign-in */}
      <button
        type="button" onClick={handleGoogle} disabled={loading}
        style={{
          width:'100%', height:48,
          display:'flex', alignItems:'center', justifyContent:'center', gap:10,
          borderRadius:12, fontSize:13.5, fontWeight:600,
          color:'rgba(255,255,255,.78)', cursor: loading ? 'not-allowed' : 'pointer',
          background:'rgba(255,255,255,.07)',
          border:'1.5px solid rgba(255,255,255,.12)',
          opacity: loading ? .5 : 1,
          transition:'background .15s, border-color .15s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background     = 'rgba(255,255,255,.11)';
          (e.currentTarget as HTMLButtonElement).style.borderColor    = 'rgba(255,255,255,.2)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background     = 'rgba(255,255,255,.07)';
          (e.currentTarget as HTMLButtonElement).style.borderColor    = 'rgba(255,255,255,.12)';
        }}
      >
        <GoogleIcon />
        Continue with Google
      </button>

      {/* Note about Google + password */}
      <p style={{ textAlign:'center', fontSize:11.5, color:'rgba(255,255,255,.2)', marginTop:12, marginBottom:0, lineHeight:1.6 }}>
        Using Google for the first time?{' '}
        <button
          type="button"
          onClick={() => setScreen('forgot')}
          style={{ background:'none', border:'none', cursor:'pointer', color:'#818cf8', fontSize:11.5, fontWeight:500, padding:0 }}
        >
          Set a password afterwards
        </button>
      </p>

      {/* Contact footer */}
      <p style={{ textAlign:'center', fontSize:12, color:'rgba(255,255,255,.2)', marginTop:20, marginBottom:0 }}>
        Need access?{' '}
        <a
          href="mailto:academyhub01@gmail.com"
          style={{ color:'#818cf8', fontWeight:500, textDecoration:'none' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#a5b4fc')}
          onMouseLeave={e => (e.currentTarget.style.color = '#818cf8')}
        >
          Contact your administrator
        </a>
      </p>
    </div>
  );
}

// ─── Page shell ───────────────────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
        background:'#060d18',
      }}>
        <svg style={{ width:28, height:28, animation:'spin .7s linear infinite' }} fill="none" viewBox="0 0 24 24">
          <circle style={{ opacity:.2 }} cx="12" cy="12" r="10" stroke="#6366f1" strokeWidth="3"/>
          <path   style={{ opacity:.8 }} fill="#6366f1" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    }>
      <>
        <style>{STYLES}</style>
        <div style={{
          minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
          padding:'20px 16px',
          background:'radial-gradient(ellipse 90% 70% at 50% 30%, #0d1b3e 0%, #060d18 60%, #020810 100%)',
          fontFamily:"'Inter',system-ui,-apple-system,'Segoe UI',sans-serif",
        }}>
          {/* bg glow orb */}
          <div aria-hidden style={{
            pointerEvents:'none', position:'fixed', inset:0,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <div style={{
              width:560, height:560, borderRadius:'50%',
              background:'radial-gradient(circle, rgba(79,70,229,.15) 0%, transparent 70%)',
              filter:'blur(72px)',
            }} />
          </div>

          <Card>
            <LoginPageInner />
          </Card>
        </div>
      </>
    </Suspense>
  );
}
