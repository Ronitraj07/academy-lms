import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types';

// Use placeholder values if environment variables are not set (for development/demo)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if we're in demo mode (no env vars or placeholder values)
const isDemoMode = !supabaseUrl || 
                   !supabaseAnonKey || 
                   supabaseUrl === 'your_supabase_url_here' || 
                   supabaseAnonKey === 'your_supabase_anon_key_here';

// Create a mock client for demo mode
let supabase: any;

if (isDemoMode) {
  // Enhanced mock Supabase client for demo purposes
  const mockResponse = { data: null, error: null };
  const mockArrayResponse = { data: [], error: null };
  
  const mockQuery = {
    select: () => mockQuery,
    eq: () => mockQuery,
    neq: () => mockQuery,
    gt: () => mockQuery,
    gte: () => mockQuery,
    lt: () => mockQuery,
    lte: () => mockQuery,
    like: () => mockQuery,
    ilike: () => mockQuery,
    is: () => mockQuery,
    in: () => mockQuery,
    contains: () => mockQuery,
    containedBy: () => mockQuery,
    rangeLt: () => mockQuery,
    rangeGt: () => mockQuery,
    rangeGte: () => mockQuery,
    rangeLte: () => mockQuery,
    rangeAdjacent: () => mockQuery,
    overlaps: () => mockQuery,
    textSearch: () => mockQuery,
    match: () => mockQuery,
    not: () => mockQuery,
    or: () => mockQuery,
    filter: () => mockQuery,
    order: () => mockQuery,
    limit: () => mockQuery,
    range: () => mockQuery,
    single: () => Promise.resolve(mockResponse),
    maybeSingle: () => Promise.resolve(mockResponse),
    then: () => Promise.resolve(mockArrayResponse),
  };

  supabase = {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signIn: () => Promise.resolve(mockResponse),
      signInWithPassword: () => Promise.resolve(mockResponse),
      signInWithOAuth: () => Promise.resolve(mockResponse),
      signOut: () => Promise.resolve(mockResponse),
      signUp: () => Promise.resolve(mockResponse),
      resetPasswordForEmail: () => Promise.resolve(mockResponse),
      updateUser: () => Promise.resolve(mockResponse),
      setSession: () => Promise.resolve(mockResponse),
      onAuthStateChange: () => ({ 
        data: { subscription: { unsubscribe: () => {} } }, 
        error: null 
      }),
    },
    from: () => ({
      ...mockQuery,
      insert: () => Promise.resolve(mockResponse),
      upsert: () => Promise.resolve(mockResponse),
      update: () => mockQuery,
      delete: () => mockQuery,
    }),
    rpc: () => Promise.resolve(mockResponse),
    storage: {
      from: () => ({
        upload: () => Promise.resolve(mockResponse),
        download: () => Promise.resolve(mockResponse),
        list: () => Promise.resolve(mockArrayResponse),
        remove: () => Promise.resolve(mockResponse),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
    channel: () => ({
      on: () => ({
        subscribe: () => ({ unsubscribe: () => {} }),
      }),
      unsubscribe: () => {},
    }),
  };
} else {
  supabase = createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
}

export { supabase };

// Client-side supabase client for use in components
export const createClientComponentClient = () => 
  isDemoMode ? supabase : createClient<Database>(supabaseUrl!, supabaseAnonKey!);

// Helper function to get current user
export const getCurrentUser = async () => {
  if (isDemoMode) return null;
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Helper function to get user profile
export const getUserProfile = async (userId: string) => {
  if (isDemoMode) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

// Helper function to get user role
export const getUserRole = async (userId: string) => {
  if (isDemoMode) return 'student';
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data?.role;
};

export { isDemoMode };