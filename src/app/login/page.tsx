'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { GraduationCap, Eye, EyeOff, Mail, Lock, Users, Briefcase, AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type UIRole = 'student' | 'staff';
type ActualRole = 'student' | 'faculty' | 'admin';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UIRole>('student');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [emailError, setEmailError]     = useState('');
  // 1.3 bonus — collapsible demo credentials hint
  const [showDemoHint, setShowDemoHint] = useState(false);
  const router = useRouter();

  const validateEmail = (value: string) => {
    if (!value) { setEmailError('Email is required'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError('Please enter a valid email address'); return false;
    }
    setEmailError(''); return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setEmail(v);
    if (v && emailError) validateEmail(v);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return;
    if (!password) { setError('Please enter your password'); return; }

    setLoading(true);
    setError('');

    try {
      const isDemoMode = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').includes('placeholder');

      if (isDemoMode) {
        let actualRole: ActualRole = 'student';
        let isValid = false;

        if (selectedRole === 'student') {
          isValid = email === 'student@academy.test' && password === 'student123!';
          actualRole = 'student';
        } else {
          if (email === 'faculty@academy.test' && password === 'faculty123!') {
            isValid = true; actualRole = 'faculty';
          } else if (email === 'admin@academy.test' && password === 'admin123!') {
            isValid = true; actualRole = 'admin';
          }
        }

        if (isValid) {
          localStorage.setItem('demo_user', JSON.stringify({
            email, role: actualRole,
            id: `demo-${actualRole}-1`,
            full_name: actualRole.charAt(0).toUpperCase() + actualRole.slice(1) + ' User'
          }));
          // 1.3 — router.push instead of window.location.href (no full reload)
          const dest = actualRole === 'admin' ? '/admin' : actualRole === 'faculty' ? '/faculty' : '/student';
          router.push(dest);
          return;
        } else {
          setError('Invalid credentials. Use the demo credentials below.');
          setShowDemoHint(true);
          setLoading(false);
          return;
        }
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) { setError(authError.message); return; }

      if (data.user) {
        const { data: profileData } = await supabase
          .from('profiles').select('role').eq('user_id', data.user.id).single();
        const role: ActualRole = profileData?.role || 'student';
        const dest = role === 'admin' ? '/admin' : role === 'faculty' ? '/faculty' : '/student';
        router.push(dest);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const isDemoMode = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').includes('placeholder');
    if (isDemoMode) {
      setError('Google OAuth is not available in demo mode.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/student` },
      });
      if (error) setError(error.message);
    } catch { setError('Failed to sign in with Google'); }
    finally { setLoading(false); }
  };

  const demoCredentials = [
    { role: 'Student',  email: 'student@academy.test',  password: 'student123!' },
    { role: 'Faculty',  email: 'faculty@academy.test',  password: 'faculty123!' },
    { role: 'Admin',    email: 'admin@academy.test',    password: 'admin123!'   },
  ];

  return (
    // 1.3 — mobile-first centering, no fixed width, p-4 prevents 320px clip
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">

          {/* Header — shrinks gracefully on short screens */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 sm:px-8 py-7 sm:py-10 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-xl shadow-lg mb-3">
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Sign in to Academy</h1>
            <p className="text-blue-100 text-sm">Access your account</p>
          </div>

          {/* Form section */}
          <div className="px-5 sm:px-8 py-6 sm:py-8">

            {/* Role selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Select your role
              </label>
              <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                {(['student', 'staff'] as const).map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    aria-pressed={selectedRole === role}
                    aria-label={`Login as ${role === 'student' ? 'Student' : 'Staff / Admin'}`}
                    className={cn(
                      // 1.3 — min-h-[48px] for touch target
                      'flex-1 flex items-center justify-center gap-2 px-4 min-h-[48px] rounded-lg font-medium text-sm transition-all duration-200',
                      selectedRole === role
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    )}
                  >
                    {role === 'student' ? <Users className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                    {role === 'student' ? 'Student' : 'Staff'}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3" role="alert" aria-live="assertive">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Login form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    aria-describedby={emailError ? 'email-error' : undefined}
                    aria-invalid={emailError ? 'true' : 'false'}
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    // 1.3 — min-h-[48px] + text-base prevents iOS zoom
                    className={cn(
                      'w-full pl-10 pr-4 min-h-[48px] text-base bg-white dark:bg-gray-800 border rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:ring-2',
                      emailError
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 focus:border-blue-500 focus:ring-blue-500/20'
                    )}
                  />
                </div>
                {emailError && <p id="email-error" className="text-xs text-red-600 mt-1">{emailError}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button type="button" className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    // 1.3 — correct autocomplete attribute
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    required
                    className="w-full pl-10 pr-12 min-h-[48px] text-base bg-white dark:bg-gray-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all duration-200 focus:outline-none hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="w-full min-h-[48px] px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </>
                ) : 'Sign in'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700" /></div>
              <div className="relative flex justify-center"><span className="px-3 bg-white dark:bg-gray-900 text-xs text-slate-500">Or continue with</span></div>
            </div>

            {/* Google */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full min-h-[48px] px-6 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-200 font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>

            {/* 1.3 bonus — collapsible demo credentials */}
            <div className="mt-6 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowDemoHint(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                aria-expanded={showDemoHint}
              >
                <span>Demo Mode Credentials</span>
                <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', showDemoHint && 'rotate-180')} />
              </button>
              {showDemoHint && (
                <div className="px-4 pb-4 space-y-2 border-t border-slate-200 dark:border-slate-700 pt-3">
                  {demoCredentials.map(c => (
                    <div key={c.role} className="text-xs space-y-0.5">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">{c.role}</p>
                      <p className="text-slate-500 font-mono">{c.email} / {c.password}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
