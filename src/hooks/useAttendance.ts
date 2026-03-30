'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AttendanceRecord {
  id: string;
  subject_id: string;
  student_id: string;
  class_date: string;
  is_present: boolean;
  marked_by: string;
  created_at: string;
  subjects: {
    id: string;
    name: string;
    code: string;
  };
}

interface AttendanceStats {
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  subjectWise: {
    [subjectId: string]: {
      subject: string;
      total: number;
      attended: number;
      percentage: number;
    };
  };
}

export function useAttendance() {
  const { profile } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // #13 — stable client reference, never recreated on re-render
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  // #14 — useCallback so the realtime subscription always closes over the latest version
  const fetchAttendance = useCallback(async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select(`
          *,
          subjects:subject_id (
            id,
            name,
            code
          )
        `)
        .eq('student_id', profile.id)
        .order('class_date', { ascending: false });

      if (attendanceError) throw attendanceError;

      setAttendance(attendanceData || []);

      if (attendanceData && attendanceData.length > 0) {
        const subjectWise: AttendanceStats['subjectWise'] = {};
        let totalClasses = 0;
        let attendedClasses = 0;

        attendanceData.forEach((record: any) => {
          const subjectId = record.subject_id;
          const subjectName = record.subjects?.name || 'Unknown Subject';

          if (!subjectWise[subjectId]) {
            subjectWise[subjectId] = {
              subject: subjectName,
              total: 0,
              attended: 0,
              percentage: 0
            };
          }

          subjectWise[subjectId].total++;
          totalClasses++;

          if (record.is_present) {
            subjectWise[subjectId].attended++;
            attendedClasses++;
          }
        });

        Object.keys(subjectWise).forEach((subjectId) => {
          const subject = subjectWise[subjectId];
          subject.percentage = subject.total > 0 ? (subject.attended / subject.total) * 100 : 0;
        });

        const overallPercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

        setStats({
          totalClasses,
          attendedClasses,
          percentage: overallPercentage,
          subjectWise
        });
      } else {
        setStats({
          totalClasses: 0,
          attendedClasses: 0,
          percentage: 0,
          subjectWise: {}
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  }, [profile?.id, supabase]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Realtime subscription — fetchAttendance is now stable via useCallback
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel('attendance_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance',
          filter: `student_id=eq.${profile.id}`
        },
        () => {
          fetchAttendance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, fetchAttendance, supabase]);

  return {
    attendance,
    stats,
    loading,
    error,
    refetch: fetchAttendance
  };
}
