'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TimetableEntry {
  id: string;
  subject_id: string;
  faculty_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string;
  created_at: string;
  subjects: {
    id: string;
    name: string;
    code: string;
  };
  faculty: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface DaySchedule {
  day: string;
  date: string;
  entries: TimetableEntry[];
}

export function useTimetable() {
  const { profile } = useAuth();
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // #13 — stable client reference
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const fetchTimetable = useCallback(async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);

      const { data: enrollments, error: enrollmentError } = await supabase
        .from('subject_enrollments')
        .select('subject_id')
        .eq('student_id', profile.id);

      if (enrollmentError) throw enrollmentError;

      const subjectIds = enrollments?.map((e: any) => e.subject_id) || [];

      if (subjectIds.length === 0) {
        setTimetable([]);
        setWeekSchedule([]);
        setTodaySchedule([]);
        setLoading(false);
        return;
      }

      const { data: timetableData, error: timetableError } = await supabase
        .from('timetable')
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
        .in('subject_id', subjectIds)
        .order('day_of_week')
        .order('start_time');

      if (timetableError) throw timetableError;

      setTimetable(timetableData || []);

      const schedule: DaySchedule[] = [];
      const today = new Date();
      const currentDay = today.getDay();

      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - currentDay + i);

        const dayEntries = (timetableData || []).filter((entry: any) => entry.day_of_week === i);

        schedule.push({
          day: days[i],
          date: date.toISOString().split('T')[0],
          entries: dayEntries
        });
      }

      setWeekSchedule(schedule);

      const todaysEntries = (timetableData || []).filter((entry: any) => entry.day_of_week === currentDay);
      setTodaySchedule(todaysEntries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch timetable');
    } finally {
      setLoading(false);
    }
  }, [profile?.id, supabase]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  // #19 — scoped filter: only triggers for subjects this student is enrolled in
  // We attach per-subject channels after timetable loads to avoid a broadcast storm
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel(`timetable_updates_${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'timetable'
        },
        () => {
          fetchTimetable();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, fetchTimetable, supabase]);

  const getCurrentClass = () => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const currentDay = now.getDay();

    return todaySchedule.find(entry => {
      return entry.day_of_week === currentDay &&
             entry.start_time <= currentTime &&
             entry.end_time >= currentTime;
    });
  };

  const getNextClass = () => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const currentDay = now.getDay();

    const todayNext = todaySchedule.find(entry => {
      return entry.day_of_week === currentDay && entry.start_time > currentTime;
    });

    if (todayNext) return todayNext;

    for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
      const targetDay = (currentDay + dayOffset) % 7;
      const dayEntries = timetable.filter(entry => entry.day_of_week === targetDay);

      if (dayEntries.length > 0) {
        return dayEntries[0];
      }
    }

    return undefined;
  };

  return {
    timetable,
    weekSchedule,
    todaySchedule,
    loading,
    error,
    getCurrentClass,
    getNextClass,
    refetch: fetchTimetable
  };
}
