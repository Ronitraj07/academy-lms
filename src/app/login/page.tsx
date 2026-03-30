'use client';

import { useState, useId, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isDemoMode } from '@/lib/supabase';
import {
  BookOpen, Eye, EyeOff, Mail, Lock,
  Users, Briefcase, AlertCircle, ChevronDown,
  Zap, CheckCircle2, ArrowRight, ShieldOff
} from 'lucide-react';

type UIRole     = 'student' | 'staff';
type ActualRole = 'student' | 'faculty' | 'admin';

interface AllowedUserRow {
  role: string;
  is_active: boolean;
}

const DEMO_CREDS = [
  { role: 'Student' as const, tag: 'student' as UIRole, email: 'student@academy.test', password: 'student123!', dot: '#34d399' },
  { role: 'Faculty' as const, tag: 'staff'   as UIRole, email: 'faculty@academy.test', password: 'faculty123!', dot: '#60a5fa' },
  { role: 'Admin'   as const, tag: 'staff'   as UIRole, email: 'admin@academy.test',   password: 'admin123!',   dot: '#f87171' },
];

const STYLES = `
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0);    }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .lp-fadein  { animation: fadeUp .45s cubic-bezier(.16,1,.3,1) both; }
  .lp-spin    { animation: spin .7s linear infinite; }
  .lp-btn-shine::after {
    content:''; position:absolute; inset:0;
    background: linear-gradient(105deg,transparent 40%,rgba(255,255,255,.14) 55%,transparent 70%);
    transform: translateX(-100%);
    transition: transform .55s ease;
  }
  .lp-btn-shine:hover::after { transform: translateX(100%); }
`;

function Field({
  id, label, type, value, onChange, placeholder, autoComplete, icon: Icon,
  right, error
}: {
  id: string; label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string; autoComplete: string;
  icon: React.ElementType; right?: React.ReactNode; error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} style={{ display:'block', fontSize:13, fontWeight:500, color:'rgba(255,255,255,.55)', marginBottom:6 }}>
        {label}
      </label>
      <div style={{ position:'relative' }}>
        <Icon style={{
          position:'absolute', left:13, top:'50%', transform:'translateY(-50%)',
          width:16, height:16, color:'rgba(255,255,255,.28)', pointerEvents:'none',
          flexShrink:0,
        }} />
        <input
          id={id} type={type} value={value} autoComplete={autoComplete}
          placeholder={placeholder} required
          onChange={e => onChange(e.target.value)}
          style={{
            width:'100%', boxSizing:'border-box',
            paddingLeft:42, paddingRight: right ? 44 : 14,
            height:48, borderRadius:12, fontSize:15,
            color:'#fff',
            background:'rgba(255,255,255,.07)',
            border: error ? '1px solid rgba(239,68,68,.5)' : '1px solid rgba(255,255,255,.1)',
            outline:'none', transition:'border-color .15s, box-shadow .15s',
          }}
          onFocus={e => {
            e.target.style.borderColor = 'rgba(59,130,246,.7)';
            e.target.style.boxShadow   = '0 0 0 3px rgba(59,130,246,.15)';
          }}
          onBlur={e => {
            e.target.style.borderColor = error ? 'rgba(239,68,68,.5)' : 'rgba(255,255,255,.1)';
            e.target.style.boxShadow   = 'none';
          }}
        />
        {right}
      </div>
      {error && (
        <p style={{ marginTop:5, fontSize:12, color:'#f87171', display:'flex', alignItems:'center', gap:4 }}>
          <AlertCircle style={{ width:12, height:12, flexShrink:0 }} />{error}
        </p>
      )}
    </div>
  );
}

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
    if      (e === 'not_allowed')  setError('Access denied. Your account has not been approved by an administrator.');
    else if (e === 'oauth_failed') setError('Google sign-in failed. Please try again.');
    else if (e === 'missing_code') setError('OAuth flow interrupted. Please try again.');
  }, [searchParams]);

  const validateEmail = (v: string) => {
    if (!v)                                    { setEmailErr('Email is required'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setEmailErr('Enter a valid email'); return false; }
    setEmailErr(''); return true;
  };

  const fillCred = (c: typeof DEMO_CREDS[number]) => {
    setRole(c.tag); setEmail(c.email); setPassword(c.password);
    setError(''); setEmailErr('');
    setFillAnim(c.role); setTimeout(() => setFillAnim(null), 700);
  };

  const goToDashboard = (r: ActualRole) =>
    router.push(r === 'admin' ? '/admin' : r === 'faculty' ? '/faculty' : '/student');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return;
    if (!password) { setError('Please enter your password'); return; }
    setLoading(true); setError('');

    try {
      if (isDemoMode) {
        const m = DEMO_CREDS.find(
          c => c.email.toLowerCase() === email.trim().toLowerCase() && c.password === password
        );
        if (m) {
          const r: ActualRole = m.role === 'Admin' ? 'admin' : m.role === 'Faculty' ? 'faculty' : 'student';
          localStorage.setItem('demo_user', JSON.stringify({ email: m.email, role: r, id:`demo-${r}-1`, full_name:`${m.role} User` }));
          goToDashboard(r);
        } else {
          setError('Invalid credentials. Use a demo account below.'); setShowDemo(true);
        }
        return;
      }

      const supabase = createClient();
      const { data, error: authErr } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (authErr) { setError(authErr.message); return; }

      if (data.user) {
        const userEmail = (data.user.email || '').toLowerCase().trim();

        const { data: allowedRaw, error: wlErr } = await supabase
          .from('allowed_users')
          .select('role, is_active')
          .eq('email', userEmail)
          .maybeSingle();

        if (wlErr) console.error('Whitelist lookup:', wlErr.message);

        const allowed = allowedRaw as AllowedUserRow | null;

        if (!allowed || !allowed.is_active) {
          await supabase.auth.signOut();
          setError('Access denied. Your account has not been approved by an administrator.');
          return;
        }

        await supabase.from('profiles').upsert(
          { user_id: data.user.id, email: userEmail, role: allowed.role },
          { onConflict: 'user_id' }
        );

        goToDashboard((allowed.role as ActualRole) || 'student');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (isDemoMode) { setError('Google sign-in is not available in demo mode.'); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) setError(error.message);
    } catch { setError('Failed to sign in with Google.'); }
    finally  { setLoading(false); }
  };

  const isAccessDenied = error.includes('Access denied');

  return (
    <>
      <style>{STYLES}</style>
      <div style={{
        minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
        padding:'40px 16px',
        background:'radial-gradient(ellipse 90% 70% at 50% 35%, #0a2140 0%, #060f1c 60%, #020810 100%)',
        fontFamily:"system-ui,-apple-system,'Segoe UI',sans-serif",
      }}>

        <div aria-hidden style={{
          pointerEvents:'none', position:'fixed', inset:0,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <div style={{
            width:600, height:600, borderRadius:'50%',
            background:'radial-gradient(circle, rgba(30,111,255,.22) 0%, transparent 70%)',
            filter:'blur(70px)',
          }} />
        </div>

        <div className="lp-fadein" style={{
          position:'relative', width:'100%', maxWidth:460, borderRadius:20,
          overflow:'hidden',
          background:'rgba(10,18,32,.88)',
          backdropFilter:'blur(28px)',
          WebkitBackdropFilter:'blur(28px)',
          border:'1px solid rgba(255,255,255,.09)',
          boxShadow:'0 40px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.04)',
        }}>
          <div style={{ padding:'36px 32px 32px' }}>

            <div style={{ textAlign:'center', marginBottom:28 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:10 }}>
                <BookOpen style={{ width:22, height:22, color:'#fff' }} />
                <h1 style={{ margin:0, color:'#fff', fontSize:22, fontWeight:700, letterSpacing:'-.3px' }}>
                  Sign in to Academy
                </h1>
              </div>
              <p style={{ margin:0, color:'rgba(255,255,255,.38)', fontSize:13 }}>Access your dashboard</p>
            </div>

            <div style={{ height:1, background:'rgba(255,255,255,.07)', marginBottom:24 }} />

            <div style={{
              display:'flex', padding:4, borderRadius:12, marginBottom:24,
              background:'rgba(255,255,255,.05)',
            }}>
              {(['student','staff'] as UIRole[]).map(r => (
                <button key={r} type="button" onClick={() => { setRole(r); setError(''); }}
                  style={{
                    flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                    height:38, borderRadius:9, fontSize:13, fontWeight:600,
                    border:'none', cursor:'pointer', transition:'all .2s',
                    background: role === r ? '#2563eb' : 'transparent',
                    color:      role === r ? '#fff'    : 'rgba(255,255,255,.38)',
                    boxShadow:  role === r ? '0 2px 12px rgba(37,99,235,.4)' : 'none',
                  }}
                >
                  {r === 'student'
                    ? <Users      style={{ width:13, height:13 }} />
                    : <Briefcase  style={{ width:13, height:13 }} />}
                  {r === 'student' ? 'Student' : 'Staff'}
                </button>
              ))}
            </div>

            {error && (
              <div style={{
                marginBottom:20, display:'flex', alignItems:'flex-start', gap:10,
                padding:'11px 14px', borderRadius:12, fontSize:13,
                background: isAccessDenied ? 'rgba(251,191,36,.10)' : 'rgba(239,68,68,.12)',
                border:     isAccessDenied ? '1px solid rgba(251,191,36,.28)' : '1px solid rgba(239,68,68,.28)',
                color:      isAccessDenied ? '#fde68a' : '#fca5a5',
              }}>
                {isAccessDenied
                  ? <ShieldOff   style={{ width:15, height:15, flexShrink:0, marginTop:1, color:'#fbbf24' }} />
                  : <AlertCircle style={{ width:15, height:15, flexShrink:0, marginTop:1, color:'#f87171' }} />}
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} noValidate style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <Field
                id={`${uid}-em`} label="Email" type="email"
                value={email} onChange={v => { setEmail(v); if (emailErr) validateEmail(v); }}
                placeholder="Enter your email" autoComplete="email"
                icon={Mail} error={emailErr}
              />

              <Field
                id={`${uid}-pw`} label="Password" type={showPw ? 'text' : 'password'}
                value={password} onChange={setPassword}
                placeholder="••••••" autoComplete="current-password"
                icon={Lock}
                right={
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? 'Hide' : 'Show'}
                    style={{
                      position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                      background:'none', border:'none', cursor:'pointer', padding:4,
                      color:'rgba(255,255,255,.3)',
                    }}
                  >
                    {showPw
                      ? <EyeOff style={{ width:16, height:16 }} />
                      : <Eye    style={{ width:16, height:16 }} />}
                  </button>
                }
              />

              <div style={{ textAlign:'right', marginTop:-8 }}>
                <button type="button" style={{
                  background:'none', border:'none', cursor:'pointer',
                  fontSize:12, color:'#60a5fa', fontWeight:500,
                }}>
                  Forgot password?
                </button>
              </div>

              <button
                type="submit" disabled={loading}
                className="lp-btn-shine"
                style={{
                  position:'relative', overflow:'hidden',
                  width:'100%', height:48, borderRadius:12,
                  fontWeight:700, fontSize:14, color:'#fff', border:'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading ? 'rgba(37,99,235,.6)' : 'linear-gradient(135deg,#2563eb 0%,#1a4fcc 100%)',
                  boxShadow: loading ? 'none' : '0 4px 22px rgba(37,99,235,.5)',
                  transition:'opacity .15s, transform .15s',
                  opacity: loading ? .65 : 1,
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                }}
                onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform='translateY(-1px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform='translateY(0)'; }}
              >
                {loading ? (
                  <>
                    <svg className="lp-spin" style={{ width:16, height:16 }} fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity:.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path style={{ opacity:.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>
                    Login as {role === 'student' ? 'Student' : 'Staff'}
                    <ArrowRight style={{ width:15, height:15 }} />
                  </>
                )}
              </button>
            </form>

            <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0' }}>
              <div style={{ flex:1, height:1, background:'rgba(255,255,255,.07)' }} />
              <span style={{ fontSize:12, color:'rgba(255,255,255,.28)' }}>or</span>
              <div style={{ flex:1, height:1, background:'rgba(255,255,255,.07)' }} />
            </div>

            <button type="button" onClick={handleGoogle} disabled={loading}
              style={{
                width:'100%', height:48,
                display:'flex', alignItems:'center', justifyContent:'center', gap:12,
                borderRadius:12, fontSize:14, fontWeight:600,
                color:'rgba(255,255,255,.8)', cursor: loading ? 'not-allowed' : 'pointer',
                background:'rgba(255,255,255,.07)',
                border:'1px solid rgba(255,255,255,.11)',
                transition:'background .15s, border-color .15s',
                opacity: loading ? .5 : 1,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,.11)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,.07)'; }}
            >
              <svg style={{ width:17, height:17, flexShrink:0 }} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>

            <div style={{ marginTop:20, borderRadius:12, border:'1px solid rgba(255,255,255,.07)', overflow:'hidden' }}>
              <button type="button" onClick={() => setShowDemo(v => !v)}
                style={{
                  width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'11px 16px', background:'none', border:'none', cursor:'pointer',
                  fontSize:13, color:'rgba(255,255,255,.35)', fontWeight:500,
                }}
              >
                <span style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <Zap style={{ width:13, height:13, color:'#fbbf24' }} />
                  Demo Credentials
                </span>
                <ChevronDown style={{
                  width:15, height:15,
                  transform: showDemo ? 'rotate(180deg)' : 'none',
                  transition:'transform .2s',
                }} />
              </button>
              {showDemo && (
                <div style={{ padding:'4px 10px 10px', borderTop:'1px solid rgba(255,255,255,.05)' }}>
                  <p style={{ fontSize:11, color:'rgba(255,255,255,.28)', padding:'0 4px', marginBottom:8 }}>Click to auto-fill:</p>
                  {DEMO_CREDS.map(c => (
                    <button key={c.role} type="button" onClick={() => fillCred(c)}
                      style={{
                        width:'100%', display:'flex', alignItems:'center', gap:10,
                        padding:'9px 10px', borderRadius:9, textAlign:'left',
                        background: fillAnim === c.role ? 'rgba(37,99,235,.15)' : 'transparent',
                        border: fillAnim === c.role ? '1px solid rgba(37,99,235,.3)' : '1px solid transparent',
                        cursor:'pointer', transition:'background .15s',
                      }}
                    >
                      <span style={{ width:8, height:8, borderRadius:'50%', background:c.dot, flexShrink:0 }} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ margin:0, fontSize:12, fontWeight:600, color:'rgba(255,255,255,.72)' }}>{c.role}</p>
                        <p style={{ margin:0, fontSize:11, fontFamily:'monospace', color:'rgba(255,255,255,.32)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.email}</p>
                      </div>
                      {fillAnim === c.role
                        ? <CheckCircle2 style={{ width:13, height:13, color:'#60a5fa', flexShrink:0 }} />
                        : <ArrowRight   style={{ width:12, height:12, color:'rgba(255,255,255,.2)', flexShrink:0 }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p style={{ textAlign:'center', fontSize:13, color:'rgba(255,255,255,.28)', marginTop:22 }}>
              Need access?{' '}
              <a href="mailto:academyhub01@gmail.com"
                style={{ color:'#60a5fa', fontWeight:500, textDecoration:'none' }}
                onMouseEnter={e => (e.currentTarget.style.color='#93c5fd')}
                onMouseLeave={e => (e.currentTarget.style.color='#60a5fa')}
              >
                Contact your administrator
              </a>
            </p>

          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
        background:'radial-gradient(ellipse 90% 70% at 50% 35%, #0a2140 0%, #060f1c 60%, #020810 100%)',
      }}>
        <svg style={{ width:32, height:32 }} className="lp-spin" fill="none" viewBox="0 0 24 24">
          <circle style={{ opacity:.2 }} cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="3"/>
          <path style={{ opacity:.8 }} fill="#3b82f6" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    }>
      <LoginPageInner />
    </Suspense>
  );
}
