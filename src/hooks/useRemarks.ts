'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Remark {
  id: string;
  student_id: string;
  faculty_id: string;
  subject_id: string | null;
  content: string;
  type: 'positive' | 'negative' | 'neutral';
  is_parent_visible: boolean;
  created_at: string;
  updated_at: string;
  subjects?: {
    id: string;
    name: string;
    code: string;
  } | null;
  faculty: {
    id: string;
    full_name: string;
    email: string;
  };
}

export function useRemarks() {
  const { profile } = useAuth();
  const [remarks, setRemarks] = useState<Remark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchRemarks = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);

      const { data: remarksData, error: remarksError } = await supabase
        .from('remarks')
        .select(`
          *,
          subjects:subject_id (
            id,
            name,
            code
          ),
          faculty:faculty_id (
            id,
            full_name,
            email
          )
        `)
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });

      if (remarksError) throw remarksError;

      setRemarks(remarksData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch remarks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRemarks();
  }, [profile?.id]);

  // Set up real-time subscription for remarks updates
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel('remarks_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'remarks',
          filter: `student_id=eq.${profile.id}`
        },
        () => {
          fetchRemarks(); // Refresh remarks when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const getRemarksByType = () => {
    const positive = remarks.filter(r => r.type === 'positive');
    const negative = remarks.filter(r => r.type === 'negative');
    const neutral = remarks.filter(r => r.type === 'neutral');

    return { positive, negative, neutral };
  };

  const getRecentRemarks = (limit: number = 5) => {
    return remarks.slice(0, limit);
  };

  return {
    remarks,
    loading,
    error,
    getRemarksByType,
    getRecentRemarks,
    refetch: fetchRemarks
  };
}