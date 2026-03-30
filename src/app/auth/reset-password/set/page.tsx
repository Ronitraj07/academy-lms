'use client';

/**
 * /auth/reset-password/set
 *
 * The user lands here AFTER the route.ts handler has exchanged the token
 * and set a valid Supabase session in cookies.  This page simply lets them
 * type a new password and calls supabase.auth.updateUser().
 *
 * Works for two scenarios:
 *  1. Forgot password  — came from the reset email link
 *  2. First-time Google user  — wants to set a password so they can also
 *     log in with email/password in the future
 */

import { useState, useEffect, useId, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  BookOpen, Lock, Eye, EyeOff,
  CheckCircle2, AlertCircle, ShieldCheck, ArrowRight,
} from 'lucide-react';

// ─── Styles ────────────────────────────────────────────────────────────────
const STYLES = `
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes spin { to { transform:rotate(360deg); } }
  .rp-card   { animation: fadeUp .42s cubic-bezier(.16,1,.3,1) both; }
  .rp-field:focus {
    border-color: rgba(99,102,241,.7) !important;
    box-shadow: 0 0 0 3px rgba(99,102,241,.13);
  }
  .rp-field-err:focus {
    border-color: rgba(239,68,68,.6) !important;
    box-shadow: 0 0 0 3px rgba(239,68,68,.1);
  }
  .rp-spin { animation: spin .7s linear infinite; }
  .rp-btn {
    position:relative; overflow:hidden;
    background: linear-gradient(135deg,#4f46e5 0%,#3730a3 100%);
    box-shadow: 0 4px 18px rgba(79,70,229,.4);
    transition: transform .15s, opacity .15s, box-shadow .15s;
  }
  .rp-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(79,70,229,.5);
  }
  .rp-btn::after {
    content:''; position:absolute; inset:0;
    background: linear-gradient(105deg,transparent 40%,rgba(255,255,255,.12) 55%,transparent 70%);
    transform: translateX(-100%); transition: transform .5s ease;
  }
  .rp-btn:hover:not(:disabled)::after { transform: translateX(100%); }
`;

// ─── Password strength ─────────────────────────────────────────────────────
interface StrengthResult {
  score: number;      // 0–4
  label: string;
  color: string;
  barColor: string;
}
function getStrength(pw: string): StrengthResult {
  let score = 0;
  if (pw.length >= 8)                        score++;
  if (pw.length >= 12)                       score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw))                      score++;
  if (/[^A-Za-z0-9]/.test(pw))              score++;
  // cap at 4
  score = Math.min(score, 4);
  const map: StrengthResult[] = [
    { score:0, label:'',         color:'transparent',           barColor:'transparent' },
    { score:1, label:'Weak',     color:'rgba(239,68,68,.9)',     barColor:'#ef4444' },
    { score:2, label:'Fair',     color:'rgba(251,146,60,.9)',    barColor:'#f97316' },
    { score:3, label:'Good',     color:'rgba(250,204,21,.9)',    barColor:'#eab308' },
    { score:4, label:'Strong',   color:'rgba(34,197,94,.9)',     barColor:'#22c55e' },
  ];
  return map[score];
}

// ─── Field ─────────────────────────────────────────────────────────────────
function Field({
  id, label, type, value, onChange, placeholder, autoComplete, right, error,
}: {
  id: string; label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string; autoComplete: string;
  right?: React.ReactNode; error?: string;
}) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
      <label htmlFor={id} style={{ fontSize:12, fontWeight:500, color:'rgba(255,255,255,.5)' }}>
        {label}
      </label>
      <div style={{ position:'relative' }}>
        <Lock style={{
          position:'absolute', left:13, top:'50%', transform:'translateY(-50%)',
          width:15, height:15, color:'rgba(255,255,255,.25)', pointerEvents:'none',
        }} />
        <input
          id={id} type={type} value={value} autoComplete={autoComplete}
          placeholder={placeholder} required
          onChange={e => onChange(e.target.value)}
          className={error ? 'rp-field-err' : 'rp-field'}
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

// ─── Spinner ───────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="rp-spin" style={{ width:15, height:15 }} fill="none" viewBox="0 0 24 24">
      <circle style={{ opacity:.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path   style={{ opacity:.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
}

// ─── StrengthBar ───────────────────────────────────────────────────────────
function StrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const s = getStrength(password);
  return (
    <div style={{ marginTop:6 }}>
      <div style={{ display:'flex', gap:4, marginBottom:5 }}>
        {[1,2,3,4].map(i => (
          <div
            key={i}
            style={{
              flex:1, height:3, borderRadius:99,
              background: i <= s.score ? s.barColor : 'rgba(255,255,255,.1)',
              transition:'background .3s',
            }}
          />
        ))}
      </div>
      {s.label && (
        <p style={{ fontSize:11, margin:0, color:s.color, fontWeight:500 }}>
          Password strength: {s.label}
        </p>
      )}
    </div>
  );
}

// ─── Requirements list ─────────────────────────────────────────────────────
function Requirement({ met, text }: { met: boolean; text: string }) {
  return (
    <li style={{ display:'flex', alignItems:'center', gap:6, fontSize:11.5,
      color: met ? 'rgba(74,222,128,.85)' : 'rgba(255,255,255,.3)',
      transition:'color .2s',
    }}>
      <CheckCircle2 style={{ width:11, height:11, flexShrink:0,
        color: met ? '#4ade80' : 'rgba(255,255,255,.15)',
        transition:'color .2s',
      }} />
      {text}
    </li>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
function ResetPasswordInner() {
  const uid    = useId();
  const router = useRouter();

  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [showCf,    setShowCf]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState(false);
  const [sessionOk, setSessionOk] = useState<boolean | null>(null);

  // Verify there's actually a live session before showing the form
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionOk(!!session);
    });
  }, []);

  // Redirect to dashboard after 3s on success
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => router.push('/login'), 3000);
    return () => clearTimeout(t);
  }, [success, router]);

  const pwRequirements = [
    { met: password.length >= 8,                              text: 'At least 8 characters' },
    { met: /[A-Z]/.test(password) && /[a-z]/.test(password), text: 'Upper and lowercase letters' },
    { met: /[0-9]/.test(password),                           text: 'At least one number' },
    { met: /[^A-Za-z0-9]/.test(password),                    text: 'At least one special character' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.'); return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.'); return;
    }
    const strength = getStrength(password);
    if (strength.score < 2) {
      setError('Please choose a stronger password.'); return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateErr } = await supabase.auth.updateUser({ password });
      if (updateErr) {
        setError(updateErr.message);
      } else {
        setSuccess(true);
        // Sign out so the user logs in fresh with their new password
        await supabase.auth.signOut();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleBtn = (show: boolean, onToggle: () => void) => (
    <button
      type="button" onClick={onToggle}
      aria-label={show ? 'Hide password' : 'Show password'}
      style={{
        position:'absolute', right:11, top:'50%', transform:'translateY(-50%)',
        background:'none', border:'none', cursor:'pointer', padding:4,
        color:'rgba(255,255,255,.28)',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}
    >
      {show ? <EyeOff style={{ width:15, height:15 }} /> : <Eye style={{ width:15, height:15 }} />}
    </button>
  );

  // ── Loading session check ──
  if (sessionOk === null) {
    return (
      <div style={{ padding:'48px 28px', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Spinner />
      </div>
    );
  }

  // ── No valid session (link expired / already used) ──
  if (sessionOk === false) {
    return (
      <div style={{ padding:'36px 28px 32px', textAlign:'center' }}>
        <div style={{
          width:52, height:52, borderRadius:'50%',
          background:'rgba(239,68,68,.12)', border:'1.5px solid rgba(239,68,68,.25)',
          display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto 16px',
        }}>
          <AlertCircle style={{ width:24, height:24, color:'#f87171' }} />
        </div>
        <h2 style={{ margin:'0 0 8px', color:'#fff', fontSize:17, fontWeight:700 }}>Link expired or invalid</h2>
        <p style={{ color:'rgba(255,255,255,.4)', fontSize:13, margin:'0 0 22px', lineHeight:1.6 }}>
          This password reset link has expired or has already been used.
          Please request a new one.
        </p>
        <button
          onClick={() => router.push('/login')}
          style={{
            width:'100%', height:44, borderRadius:12,
            background:'rgba(255,255,255,.08)', border:'1.5px solid rgba(255,255,255,.12)',
            color:'rgba(255,255,255,.75)', fontSize:13, fontWeight:600,
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7,
          }}
        >
          ← Back to Sign In
        </button>
      </div>
    );
  }

  // ── Success ──
  if (success) {
    return (
      <div style={{ padding:'36px 28px 32px', textAlign:'center' }}>
        <div style={{
          width:56, height:56, borderRadius:'50%',
          background:'rgba(34,197,94,.12)', border:'1.5px solid rgba(34,197,94,.25)',
          display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto 18px',
        }}>
          <CheckCircle2 style={{ width:27, height:27, color:'#4ade80' }} />
        </div>
        <h2 style={{ margin:'0 0 8px', color:'#fff', fontSize:18, fontWeight:700 }}>Password updated!</h2>
        <p style={{ color:'rgba(255,255,255,.4)', fontSize:13, margin:'0 0 6px', lineHeight:1.6 }}>
          Your new password has been saved successfully.
        </p>
        <p style={{ color:'rgba(255,255,255,.25)', fontSize:12, margin:0 }}>
          Redirecting you to sign in…
        </p>
      </div>
    );
  }

  // ── Form ──
  return (
    <div style={{ padding:'32px 28px 28px' }}>
      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:22 }}>
        <div style={{
          display:'inline-flex', alignItems:'center', justifyContent:'center',
          gap:9, marginBottom:7,
        }}>
          <div style={{
            width:36, height:36, borderRadius:10,
            background:'linear-gradient(135deg,#4f46e5,#7c3aed)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 14px rgba(79,70,229,.4)',
          }}>
            <ShieldCheck style={{ width:18, height:18, color:'#fff' }} />
          </div>
          <h1 style={{ margin:0, color:'#fff', fontSize:20, fontWeight:700, letterSpacing:'-.35px' }}>
            Set New Password
          </h1>
        </div>
        <p style={{ margin:0, color:'rgba(255,255,255,.35)', fontSize:12.5 }}>
          Choose a strong password for your account
        </p>
      </div>

      <div style={{ height:1, background:'rgba(255,255,255,.07)', marginBottom:22 }} />

      {error && (
        <div style={{
          display:'flex', alignItems:'flex-start', gap:9,
          padding:'11px 13px', borderRadius:12, fontSize:12, marginBottom:16,
          background:'rgba(239,68,68,.12)', border:'1px solid rgba(239,68,68,.28)',
          color:'#fca5a5',
        }}>
          <AlertCircle style={{ width:14, height:14, flexShrink:0, marginTop:1, color:'#f87171' }} />
          <span style={{ lineHeight:1.5 }}>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div>
          <Field
            id={`${uid}-pw`} label="New password"
            type={showPw ? 'text' : 'password'}
            value={password} onChange={setPassword}
            placeholder="Create a strong password"
            autoComplete="new-password"
            right={toggleBtn(showPw, () => setShowPw(v => !v))}
          />
          {password && <StrengthBar password={password} />}
        </div>

        <Field
          id={`${uid}-cf`} label="Confirm password"
          type={showCf ? 'text' : 'password'}
          value={confirm} onChange={setConfirm}
          placeholder="Repeat your password"
          autoComplete="new-password"
          error={
            confirm && confirm !== password
              ? 'Passwords do not match'
              : undefined
          }
          right={toggleBtn(showCf, () => setShowCf(v => !v))}
        />

        {/* Requirements checklist */}
        {password && (
          <ul style={{ margin:0, padding:'10px 12px', borderRadius:10, listStyle:'none',
            background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)',
            display:'flex', flexDirection:'column', gap:6,
          }}>
            {pwRequirements.map(r => (
              <Requirement key={r.text} met={r.met} text={r.text} />
            ))}
          </ul>
        )}

        <button
          type="submit" disabled={loading}
          className="rp-btn"
          style={{
            width:'100%', height:48, borderRadius:12,
            fontWeight:700, fontSize:14, color:'#fff', border:'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? .7 : 1,
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            marginTop:4,
          }}
        >
          {loading
            ? <><Spinner />Saving…</>
            : <><ArrowRight style={{ width:15, height:15 }} />Save New Password</>}
        </button>
      </form>
    </div>
  );
}

// ─── Page shell ────────────────────────────────────────────────────────────
export default function ResetPasswordPage() {
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
              width:520, height:520, borderRadius:'50%',
              background:'radial-gradient(circle, rgba(79,70,229,.14) 0%, transparent 70%)',
              filter:'blur(72px)',
            }} />
          </div>

          {/* Card */}
          <div
            className="rp-card"
            style={{
              position:'relative', width:'100%', maxWidth:428,
              borderRadius:20, overflow:'hidden',
              background:'rgba(9,16,30,.92)',
              backdropFilter:'blur(28px)', WebkitBackdropFilter:'blur(28px)',
              border:'1.5px solid rgba(255,255,255,.09)',
              boxShadow:'0 32px 64px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.03)',
            }}
          >
            <ResetPasswordInner />
          </div>
        </div>
      </>
    </Suspense>
  );
}
