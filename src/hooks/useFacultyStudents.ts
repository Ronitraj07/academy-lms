'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Student {
  id: string;
  user_id: string;
  student_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  address: string | null;
  enrollment_date: string;
  status: 'active' | 'inactive' | 'graduated';
}

interface StudentWithAttendance extends Student {
  attendance_percentage: number;
  total_classes: number;
  attended_classes: number;
  last_attendance: string | null;
}

export function useFacultyStudents(subjectId?: string) {
  const { profile } = useAuth();
  const [students, setStudents] = useState<StudentWithAttendance[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]); // For enrollment management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchStudents = async () => {
    if (!profile?.id || !subjectId) {
      setStudents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch enrolled students for the subject
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('subject_enrollments')
        .select(`
          student_id,
          students:student_id (
            id,
            user_id,
            student_id,
            full_name,
            email,
            phone,
            date_of_birth,
            address,
            enrollment_date,
            status
          )
        `)
        .eq('subject_id', subjectId);

      if (enrollmentError) throw enrollmentError;

      const enrolledStudents = enrollments?.filter((e: any) => e.students).map((e: any) => e.students!) || [];
      const studentIds = enrolledStudents.map((s: any) => s.id);

      if (studentIds.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      // Fetch attendance data for these students in this subject
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('student_id, is_present, class_date')
        .eq('subject_id', subjectId)
        .in('student_id', studentIds);

      if (attendanceError) throw attendanceError;

      // Calculate attendance statistics for each student
      const studentsWithAttendance: StudentWithAttendance[] = enrolledStudents.map(student => {
        const studentAttendance = attendanceData?.filter((a: any) => a.student_id === student.id) || [];
        const totalClasses = studentAttendance.length;
        const attendedClasses = studentAttendance.filter((a: any) => a.is_present).length;
        const attendancePercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
        
        // Get last attendance date
        const lastAttendance = studentAttendance
          .sort((a: any, b: any) => new Date(b.class_date).getTime() - new Date(a.class_date).getTime())[0];

        return {
          ...student,
          attendance_percentage: attendancePercentage,
          total_classes: totalClasses,
          attended_classes: attendedClasses,
          last_attendance: (lastAttendance as any)?.class_date || null
        };
      });

      setStudents(studentsWithAttendance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('status', 'active')
        .order('full_name');

      if (error) throw error;
      setAllStudents(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch all students');
    }
  };

  const enrollStudent = async (studentId: string) => {
    if (!subjectId) return false;

    try {
      const { error } = await (supabase as any)
        .from('subject_enrollments')
        .insert({
          student_id: studentId,
          subject_id: subjectId,
          enrollment_date: new Date().toISOString()
        });

      if (error) throw error;

      await fetchStudents(); // Refresh the list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll student');
      return false;
    }
  };

  const unenrollStudent = async (studentId: string) => {
    if (!subjectId) return false;

    try {
      const { error } = await (supabase as any)
        .from('subject_enrollments')
        .delete()
        .eq('student_id', studentId)
        .eq('subject_id', subjectId);

      if (error) throw error;

      await fetchStudents(); // Refresh the list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unenroll student');
      return false;
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchAllStudents();
  }, [profile?.id, subjectId]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!subjectId) return;

    const channel = supabase
      .channel(`faculty_students_${subjectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subject_enrollments',
          filter: `subject_id=eq.${subjectId}`
        },
        () => {
          fetchStudents();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance',
          filter: `subject_id=eq.${subjectId}`
        },
        () => {
          fetchStudents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [subjectId]);

  return {
    students,
    allStudents,
    loading,
    error,
    enrollStudent,
    unenrollStudent,
    refetch: fetchStudents
  };
}