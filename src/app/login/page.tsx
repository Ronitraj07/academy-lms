'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { GraduationCap, Eye, EyeOff, Mail, Lock, Users, Briefcase } from 'lucide-react';
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
  const router = useRouter();

  // Map UI roles to actual roles for authentication
  const getRoleCredentials = (uiRole: UIRole) => {
    if (uiRole === 'student') {
      return {
        testEmail: 'student@academy.test',
        testPassword: 'student123!'
      };
    } else {
      // Staff can be either faculty or admin - we'll check on login
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
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if we're in demo mode
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const isDemoMode = supabaseUrl.includes('placeholder');

      if (isDemoMode) {
        // Demo mode: Check against test credentials
        const creds = getRoleCredentials(selectedRole);

        let actualRole: ActualRole = 'student';
        let isValid = false;

        if (selectedRole === 'student') {
          isValid = email === creds.testEmail && password === creds.testPassword;
          actualRole = 'student';
        } else {
          // Staff login - check both faculty and admin credentials
          if (email === creds.testEmail && password === creds.testPassword) {
            isValid = true;
            actualRole = 'faculty';
          } else if (email === creds.adminEmail && password === creds.adminPassword) {
            isValid = true;
            actualRole = 'admin';
          }
        }

        if (isValid) {
          // Store demo user in localStorage
          localStorage.setItem('demo_user', JSON.stringify({
            email,
            role: actualRole,
            id: `demo-${actualRole}-id`
          }));

          // Redirect based on actual role
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

      // Real Supabase authentication
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // Get user's actual role from profile
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();

        const actualRole = profile?.role || 'student';

        // Redirect based on actual role from backend
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
    // Check if we're in demo mode
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-[420px] relative z-10 fade-in">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl shadow-2xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-14 w-14 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg mb-4 bounce-in">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Sign in to Academy
            </h1>
            <p className="text-sm text-gray-400">
              Access your dashboard
            </p>
          </div>

          {/* Role Selector - Segmented Control */}
          <div className="mb-6">
            <div className="bg-gray-800/50 backdrop-blur-sm p-1.5 rounded-xl border border-gray-700/50 inline-flex w-full">
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300',
                  selectedRole === 'student'
                    ? 'bg-gradient-to-r from-primary to-pink-600 text-white shadow-lg shadow-primary/30'
                    : 'text-gray-400 hover:text-gray-300'
                )}
              >
                <Users className="h-4 w-4" />
                Student
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('staff')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300',
                  selectedRole === 'staff'
                    ? 'bg-gradient-to-r from-primary to-pink-600 text-white shadow-lg shadow-primary/30'
                    : 'text-gray-400 hover:text-gray-300'
                )}
              >
                <Briefcase className="h-4 w-4" />
                Staff
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl slide-in-up">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300 hover:border-gray-600/50"
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300 hover:border-gray-600/50"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
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
              className="w-full py-3.5 px-6 bg-gradient-to-r from-primary via-pink-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
            >
              <span className="relative z-10">
                {loading ? 'Signing in...' : `Login as ${selectedRole === 'student' ? 'Student' : 'Staff'}`}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-pink-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-gray-900/80 text-gray-500">
                or
              </span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 px-6 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-3 font-semibold shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] group"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-gray-700 font-semibold">
              Continue with Google
            </span>
          </button>

          {/* Create Account Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <button
                type="button"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Create account
              </button>
            </p>
          </div>

          {/* Demo Credentials Hint */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-xs text-gray-600 text-center">
              Demo Mode: Use test credentials to try the app
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
