'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AllStudentsData {
  id: string;
  student_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  attendance_percentage: number;
  total_classes: number;
  attended_classes: number;
  last_attendance: string | null;
}

export function useAllStudents() {
  const [students, setStudents] = useState<AllStudentsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAllStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          student_id,
          users!students_user_id_fkey(
            id,
            email,
            profiles(
              full_name,
              phone
            )
          )
        `)
        .order('student_id');

      if (error) throw error;

      // Transform the data to match our interface
      const transformedStudents: AllStudentsData[] = data?.map((student: any) => ({
        id: student.id,
        student_id: student.student_id,
        full_name: student.users?.profiles?.full_name || 'Unknown',
        email: student.users?.email || '',
        phone: student.users?.profiles?.phone || null,
        attendance_percentage: 0, // Will be calculated separately
        total_classes: 0,
        attended_classes: 0,
        last_attendance: null
      })) || [];

      setStudents(transformedStudents);

    } catch (err: any) {
      console.error('Error fetching all students:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to load students',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const enrollStudent = async (subjectId: string, studentId: string): Promise<boolean> => {
    try {
      if (!user?.id) return false;

      const { error } = await supabase
        .from('subject_enrollments')
        .insert({
          subject_id: subjectId,
          student_id: studentId,
          faculty_id: user.id,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Student enrolled successfully',
      });

      return true;
    } catch (err: any) {
      console.error('Error enrolling student:', err);
      toast({
        title: 'Error',
        description: 'Failed to enroll student',
        variant: 'destructive',
      });
      return false;
    }
  };

  const unenrollStudent = async (subjectId: string, studentId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('subject_enrollments')
        .delete()
        .eq('subject_id', subjectId)
        .eq('student_id', studentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Student removed from subject',
      });

      return true;
    } catch (err: any) {
      console.error('Error unenrolling student:', err);
      toast({
        title: 'Error',
        description: 'Failed to remove student',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchAllStudents();
    }
  }, [user?.id]);

  return {
    students,
    loading,
    error,
    refetch: fetchAllStudents,
    enrollStudent,
    unenrollStudent
  };
}