'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Subject {
  id: string;
  name: string;
  code: string;
  description: string | null;
  credits: number;
  semester: string;
  created_at: string;
}

interface SubjectWithEnrollment extends Subject {
  enrollment_count: number;
  recent_classes: number;
  average_attendance: number;
}

export function useFacultySubjects() {
  const { profile } = useAuth();
  const [subjects, setSubjects] = useState<SubjectWithEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchSubjects = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);

      // Fetch subjects taught by this faculty
      const { data: facultySubjects, error: subjectsError } = await supabase
        .from('faculty_subject_assignments')
        .select(`
          subject_id,
          subjects:subject_id (
            id,
            name,
            code,
            description,
            credits,
            semester,
            created_at
          )
        `)
        .eq('faculty_id', profile.id);

      if (subjectsError) throw subjectsError;

      // Get subject IDs
      const subjectIds = facultySubjects?.map((fs: any) => fs.subject_id) || [];
      
      if (subjectIds.length === 0) {
        setSubjects([]);
        setLoading(false);
        return;
      }

      // Fetch enrollment counts
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('subject_enrollments')
        .select('subject_id')
        .in('subject_id', subjectIds);

      if (enrollmentError) throw enrollmentError;

      // Count enrollments per subject
      const enrollmentCounts: Record<string, number> = {};
      enrollmentData?.forEach((enrollment: any) => {
        enrollmentCounts[enrollment.subject_id] = (enrollmentCounts[enrollment.subject_id] || 0) + 1;
      });

      // Fetch recent attendance data (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('subject_id, is_present, class_date')
        .in('subject_id', subjectIds)
        .gte('class_date', sevenDaysAgo.toISOString().split('T')[0]);

      if (attendanceError) throw attendanceError;

      // Calculate statistics per subject
      const subjectStats: Record<string, { recentClasses: number; averageAttendance: number }> = {};
      
      subjectIds.forEach(subjectId => {
        const subjectAttendance = attendanceData?.filter((a: any) => a.subject_id === subjectId) || [];
        const classDates = [...new Set(subjectAttendance.map((a: any) => a.class_date))];
        const totalStudents = subjectAttendance.length;
        const presentStudents = subjectAttendance.filter((a: any) => a.is_present).length;

        subjectStats[subjectId] = {
          recentClasses: classDates.length,
          averageAttendance: totalStudents > 0 ? (presentStudents / totalStudents) * 100 : 0
        };
      });

      // Combine all data
      const enrichedSubjects: SubjectWithEnrollment[] = facultySubjects
        ?.filter((fs: any) => fs.subjects)
        .map((fs: any) => ({
          ...fs.subjects!,
          enrollment_count: enrollmentCounts[fs.subject_id] || 0,
          recent_classes: subjectStats[fs.subject_id]?.recentClasses || 0,
          average_attendance: subjectStats[fs.subject_id]?.averageAttendance || 0
        })) || [];

      setSubjects(enrichedSubjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [profile?.id]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel('faculty_subjects')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subject_enrollments'
        },
        () => {
          fetchSubjects();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance'
        },
        () => {
          fetchSubjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const createSubject = async (subjectData: Omit<Subject, 'id' | 'created_at'>) => {
    try {
      // Create the subject
      const { data: newSubject, error: subjectError } = await supabase
        .from('subjects')
        .insert(subjectData as any)
        .select()
        .single();

      if (subjectError) throw subjectError;

      // Assign the faculty to the subject
      const { error: assignmentError } = await supabase
        .from('faculty_subject_assignments')
        .insert({
          faculty_id: profile!.id,
          subject_id: (newSubject as any).id
        } as any);

      if (assignmentError) throw assignmentError;

      // Refresh the subjects list
      await fetchSubjects();
      return newSubject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subject');
      return null;
    }
  };

  return {
    subjects,
    loading,
    error,
    refetch: fetchSubjects,
    createSubject
  };
}