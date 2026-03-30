'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isDemoMode } from '@/lib/supabase';
import { Profile } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (isDemoMode) {
      try {
        const stored = localStorage.getItem('demo_user');
        if (stored) {
          const demoUser = JSON.parse(stored);
          // #22 — use the stored id, not a hardcoded fallback string
          const resolvedId = demoUser.id || 'demo-user-id';
          setProfile({
            id: resolvedId,
            user_id: resolvedId,
            full_name: demoUser.full_name || demoUser.email?.split('@')[0] || 'Demo User',
            role: demoUser.role || 'student',
          });
          return;
        }
      } catch {
        // fall through to default below
      }
      // Fallback only when nothing is stored at all
      setProfile({
        id: 'demo-user-id',
        user_id: 'demo-user-id',
        full_name: 'Demo User',
        role: 'student',
      });
      return;
    }

    if (!user) {
      setProfile(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  }, [user]);

  useEffect(() => {
    if (isDemoMode) {
      try {
        const stored = localStorage.getItem('demo_user');
        if (stored) {
          const demoUser = JSON.parse(stored);
          setUser({
            id: demoUser.id || 'demo-user-id',
            email: demoUser.email || 'demo@academy.test',
          } as User);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }: { data: { session: { user: User } | null } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: string, session: { user: User } | null) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      refreshProfile();
    } else if (!isDemoMode) {
      setProfile(null);
    }
  }, [user, refreshProfile]);

  const signOut = async () => {
    if (isDemoMode) {
      localStorage.removeItem('demo_user');
      sessionStorage.removeItem('demo_user');
      setUser(null);
      setProfile(null);
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
