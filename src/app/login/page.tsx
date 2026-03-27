'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, GraduationCap, Users, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<'student' | 'faculty' | 'admin' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const roles = [
    {
      id: 'student' as const,
      title: 'Student',
      description: 'Access your courses, attendance, and academic records',
      icon: GraduationCap,
      color: 'bg-blue-500',
      testCredentials: { email: 'student@academy.test', password: 'student123!' }
    },
    {
      id: 'faculty' as const,
      title: 'Faculty',
      description: 'Manage courses, mark attendance, and track student progress',
      icon: Users,
      color: 'bg-green-500',
      testCredentials: { email: 'faculty@academy.test', password: 'faculty123!' }
    },
    {
      id: 'admin' as const,
      title: 'Admin',
      description: 'Full system access and user management capabilities',
      icon: Shield,
      color: 'bg-purple-500',
      testCredentials: { email: 'admin@academy.test', password: 'admin123!' }
    },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if we're in demo mode (placeholder URL)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const isDemoMode = supabaseUrl.includes('placeholder');
      
      console.log('🔍 Debug - Supabase URL:', supabaseUrl);
      console.log('🔍 Debug - Is Demo Mode:', isDemoMode);
      console.log('🔍 Debug - Selected Role:', selectedRole);
      console.log('🔍 Debug - Email:', email);
      
      if (isDemoMode) {
        // Demo mode: Check against test credentials
        const testCreds = roles.find(r => r.id === selectedRole)?.testCredentials;
        
        console.log('🔍 Debug - Test Credentials:', testCreds);
        console.log('🔍 Debug - Password match:', password === testCreds?.password);
        
        if (email === testCreds?.email && password === testCreds?.password) {
          // Simulate successful login in demo mode
          console.log('✅ Demo mode login successful:', { role: selectedRole, email });
          
          // Store demo user in localStorage
          localStorage.setItem('demo_user', JSON.stringify({
            email,
            role: selectedRole,
            id: `demo-${selectedRole}-id`
          }));
          
          // Redirect based on role
          const dashboardUrl = selectedRole === 'admin' ? '/admin' : 
                              selectedRole === 'faculty' ? '/faculty' : '/student';
          
          console.log('🚀 Attempting to navigate to:', dashboardUrl);
          
          // Use window.location for demo mode to ensure navigation
          window.location.href = dashboardUrl;
          return;
        } else {
          setError('Invalid credentials. Use test credentials provided above.');
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

      // Redirect based on role
      const dashboardUrl = selectedRole === 'admin' ? '/admin' : 
                          selectedRole === 'faculty' ? '/faculty' : '/student';
      router.push(dashboardUrl);
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!selectedRole) {
      setError('Please select a role first');
      return;
    }

    // Check if we're in demo mode
    const isDemoMode = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder');
    
    if (isDemoMode) {
      setError('Google OAuth is not available in demo mode. Please use test credentials above.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/${selectedRole}`,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        <div className="text-center fade-in">
          <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center shadow-lg bounce-in relative">
            <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-25"></div>
            <GraduationCap className="h-8 w-8 text-white relative z-10" />
          </div>
          <h1 className="mt-8 text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-blue-600">
            Academy LMS
          </h1>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
            Select your role to continue
          </p>
        </div>

        {/* Role Selection */}
        {!selectedRole && (
          <div className="space-y-4 pt-4">
            {roles.map((role, index) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className="w-full p-6 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-primary transition-all duration-300 text-left group hover:shadow-xl hover:scale-[1.03] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-4">
                  <div className={cn('p-4 rounded-2xl text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3', role.color)}>
                    <role.icon className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                      {role.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {role.description}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M9 5l7 7-7 7"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Login Modal Overlay */}
        {selectedRole && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 fade-in"
              onClick={() => setSelectedRole(null)}
            />

            {/* Modal Content */}
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 scale-in">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 m-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    {(() => {
                      const role = roles.find(r => r.id === selectedRole);
                      return role ? (
                        <>
                          <div className={cn('p-3 rounded-2xl text-white shadow-md', role.color)}>
                            <role.icon className="h-6 w-6" />
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                              Sign in as {role.title}
                            </h2>
                            <button
                              onClick={() => setSelectedRole(null)}
                              className="text-sm text-gray-500 hover:text-primary transition-colors hover:underline"
                            >
                              Change role
                            </button>
                          </div>
                        </>
                      ) : null;
                    })()}
                  </div>
                  <button
                    onClick={() => setSelectedRole(null)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* OAuth Section - Moved to top */}
                <div className="mb-6">
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-3.5 px-6 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-3 font-medium shadow-sm hover:shadow-md hover:border-gray-400 dark:hover:border-gray-500 group"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-gray-700 dark:text-gray-200 font-semibold">
                      {loading ? 'Signing in...' : 'Continue with Google'}
                    </span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      Or continue with email
                    </span>
                  </div>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white transition-all hover:border-primary/50"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white transition-all hover:border-primary/50"
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-primary via-purple-600 to-blue-600 text-white rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:scale-[1.02] relative overflow-hidden group"
                  >
                    <span className="relative z-10">{loading ? 'Signing in...' : 'Sign In'}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}