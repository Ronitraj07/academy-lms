'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { GraduationCap, Eye, EyeOff, Mail, Lock, Users, Briefcase, ArrowRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type UIRole = 'student' | 'staff';
type ActualRole = 'student' | 'faculty' | 'admin';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UIRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const router = useRouter();

  // Calculate password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (pass.length >= 12) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[a-z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;

    const levels = [
      { strength: 0, label: '', color: '' },
      { strength: 1, label: 'Weak', color: 'bg-destructive/80' },
      { strength: 2, label: 'Fair', color: 'bg-warning/80' },
      { strength: 3, label: 'Good', color: 'bg-info/80' },
      { strength: 4, label: 'Strong', color: 'bg-success/80' },
    ];

    return levels[Math.min(Math.ceil(strength / 1.5), 4)];
  };

  const passwordStrength = getPasswordStrength(password);

  // Email validation
  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value) validateEmail(value);
  };

  // Map UI roles to actual roles for authentication
  const getRoleCredentials = (uiRole: UIRole) => {
    if (uiRole === 'student') {
      return {
        testEmail: 'student@academy.test',
        testPassword: 'student123!'
      };
    } else {
      return {
        testEmail: 'faculty@academy.test',
        testPassword: 'faculty123!',
        adminEmail: 'admin@academy.test',
        adminPassword: 'admin123!'
      };
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const isEmailValid = validateEmail(email);
    if (!isEmailValid) return;

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const isDemoMode = supabaseUrl.includes('placeholder');

      if (isDemoMode) {
        const creds = getRoleCredentials(selectedRole);

        let actualRole: ActualRole = 'student';
        let isValid = false;

        if (selectedRole === 'student') {
          isValid = email === creds.testEmail && password === creds.testPassword;
          actualRole = 'student';
        } else {
          if (email === creds.testEmail && password === creds.testPassword) {
            isValid = true;
            actualRole = 'faculty';
          } else if (email === creds.adminEmail && password === creds.adminPassword) {
            isValid = true;
            actualRole = 'admin';
          }
        }

        if (isValid) {
          localStorage.setItem('demo_user', JSON.stringify({
            email,
            role: actualRole,
            id: `demo-${actualRole}-id`
          }));

          const dashboardUrl = actualRole === 'admin' ? '/admin' :
                              actualRole === 'faculty' ? '/faculty' : '/student';

          window.location.href = dashboardUrl;
          return;
        } else {
          setError('Invalid credentials. Please check your email and password.');
          setLoading(false);
          return;
        }
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();

        const actualRole = profile?.role || 'student';

        const dashboardUrl = actualRole === 'admin' ? '/admin' :
                            actualRole === 'faculty' ? '/faculty' : '/student';
        router.push(dashboardUrl);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const isDemoMode = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder');

    if (isDemoMode) {
      setError('Google OAuth is not available in demo mode. Please use test credentials.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/student`,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-850 to-black flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Premium animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/15 rounded-full blur-3xl opacity-40 animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute -bottom-32 -right-48 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }}></div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10 fade-in">
        {/* Card container with refined shadow */}
        <div className="relative">
          {/* Glow effect (subtle) */}
          <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/20 to-blue-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {/* Main card */}
          <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-950/95 backdrop-blur-xl border border-slate-700/40 rounded-2xl shadow-2xl p-8 md:p-10">
            {/* Header Section */}
            <div className="text-center mb-8">
              {/* Logo */}
              <div className="inline-block mb-6 transform transition-transform duration-300 hover:scale-105">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary via-pink-500 to-blue-600 rounded-xl blur-md opacity-60"></div>
                  <div className="relative h-14 w-14 bg-gradient-to-br from-primary via-pink-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <GraduationCap className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Title and subtitle */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                Academy LMS
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Access your learning dashboard
              </p>
            </div>

            {/* Role Selector with refined styling */}
            <div className="mb-8">
              <div className="inline-flex w-full gap-1.5 p-1.5 bg-slate-800/50 rounded-xl border border-slate-700/30 backdrop-blur-sm">
                {(['student', 'staff'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    aria-label={`Login as ${role === 'student' ? 'Student' : 'Staff'}`}
                    aria-pressed={selectedRole === role}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-250 whitespace-nowrap',
                      selectedRole === role
                        ? 'bg-gradient-to-r from-primary to-pink-500 text-white shadow-md shadow-primary/30'
                        : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/20'
                    )}
                  >
                    {role === 'student' ? <Users className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                    {role === 'student' ? 'Student' : 'Staff'}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message with smooth animation */}
            {error && (
              <div
                className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl slide-in-up flex items-start gap-3 backdrop-blur-sm"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
              >
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-destructive leading-snug">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-2.5">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-200">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 transition-colors duration-250 group-focus-within:text-primary" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    aria-label="Email address"
                    aria-describedby={emailError ? "email-error" : undefined}
                    aria-invalid={emailError ? "true" : "false"}
                    className={cn(
                      "w-full pl-12 pr-4 py-3 bg-slate-800/50 border rounded-lg text-white placeholder:text-slate-500 transition-all duration-250 focus:outline-none",
                      emailError
                        ? "border-destructive/50 bg-destructive/5 focus:border-destructive focus:ring-2 focus:ring-destructive/20"
                        : "border-slate-700/50 hover:border-slate-600/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    )}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
                {emailError && (
                  <p id="email-error" className="text-xs font-medium text-destructive flex items-center gap-1.5 pt-0.5">
                    <span className="inline">•</span> {emailError}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-200">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors duration-250"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 transition-colors duration-250 group-focus-within:text-primary" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-label="Password"
                    aria-invalid={error ? "true" : "false"}
                    className="w-full pl-12 pr-12 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder:text-slate-500 transition-all duration-250 focus:outline-none hover:border-slate-600/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors duration-250 p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator - Premium version */}
                {password && (
                  <div className="pt-2 space-y-2 animate-in fade-in duration-300">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-slate-700/40 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all duration-300 rounded-full",
                            passwordStrength.color || "bg-slate-600"
                          )}
                          style={{
                            width: `${(passwordStrength.strength / 4) * 100}%`,
                          }}
                        />
                      </div>
                      {passwordStrength.label && (
                        <span className="text-xs font-semibold text-slate-400 min-w-[40px]">
                          {passwordStrength.label}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button - Premium styling */}
              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="w-full mt-7 py-3 px-6 bg-gradient-to-r from-primary via-pink-500 to-blue-600 text-white rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:shadow-lg hover:enabled:shadow-primary/30 active:enabled:scale-[0.98] flex items-center justify-center gap-2 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin text-white/80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/30"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-gradient-to-br from-slate-900/95 to-slate-950/95 text-xs font-medium text-slate-500">
or
                </span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-6 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold transition-all duration-250 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:enabled:shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900 active:enabled:bg-slate-100"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Footer */}
            <div className="mt-8 space-y-4 text-center border-t border-slate-700/30 pt-8">
              <p className="text-sm text-slate-400">
                New here?{' '}
                <button
                  type="button"
                  className="text-primary font-semibold hover:text-primary/80 transition-colors duration-250"
                >
                  Create an account
                </button>
              </p>
              <p className="text-xs text-slate-500">
                Demo Mode: Use test credentials to explore
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
