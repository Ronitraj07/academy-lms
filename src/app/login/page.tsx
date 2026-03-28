'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { GraduationCap, Eye, EyeOff, Mail, Lock, Users, Briefcase, AlertCircle } from 'lucide-react';
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
    if (value && emailError) validateEmail(value);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      {/* Main container */}
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-xl shadow-lg mb-4">
              <GraduationCap className="h-9 w-9 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Sign in to Academy
            </h1>
            <p className="text-blue-100 text-sm">
              Access your account
            </p>
          </div>

          {/* Form Section */}
          <div className="px-8 py-8">
            {/* Role Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Select your role
              </label>
              <div className="inline-flex w-full gap-2 p-1 bg-slate-100 rounded-lg">
                {(['student', 'staff'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    aria-label={`Login as ${role === 'student' ? 'Student' : 'Staff'}`}
                    aria-pressed={selectedRole === role}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium text-sm transition-all duration-200',
                      selectedRole === role
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    )}
                  >
                    {role === 'student' ? <Users className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                    {role === 'student' ? 'Student' : 'Staff'}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 leading-snug">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    aria-label="Email address"
                    aria-describedby={emailError ? "email-error" : undefined}
                    aria-invalid={emailError ? "true" : "false"}
                    className={cn(
                      "w-full pl-10 pr-4 py-3 bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:ring-2",
                      emailError
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                    )}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
                {emailError && (
                  <p id="email-error" className="text-xs text-red-600 mt-1.5">
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-label="Password"
                    className="w-full pl-10 pr-12 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-xs font-medium text-slate-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-6 bg-white hover:bg-slate-50 border-2 border-slate-300 rounded-lg text-slate-700 font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-sm hover:shadow"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google</span>
            </button>

            {/* Footer */}
            <div className="mt-8 text-center space-y-3">
              <p className="text-sm text-slate-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                >
                  Create account
                </button>
              </p>
              <p className="text-xs text-slate-500 pt-3 border-t border-slate-200">
                Demo Mode: Use test credentials to explore
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
