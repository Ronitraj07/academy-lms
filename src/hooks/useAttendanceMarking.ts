'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AttendanceEntry {
  studentId: string;
  studentName: string;
  isPresent: boolean;
}

interface AttendanceSession {
  subjectId: string;
  classDate: string;
  entries: AttendanceEntry[];
}

export function useAttendanceMarking() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const markAttendance = async (session: AttendanceSession) => {
    if (!profile?.id) return false;

    try {
      setLoading(true);
      setError(null);

      // Prepare attendance records
      const attendanceRecords = session.entries.map(entry => ({
        subject_id: session.subjectId,
        student_id: entry.studentId,
        class_date: session.classDate,
        is_present: entry.isPresent,
        marked_by: profile.id,
        created_at: new Date().toISOString()
      }));

      // Check if attendance already exists for this date and subject
      const { data: existingAttendance, error: checkError } = await supabase
        .from('attendance')
        .select('id, student_id')
        .eq('subject_id', session.subjectId)
        .eq('class_date', session.classDate);

      if (checkError) throw checkError;

      if (existingAttendance && existingAttendance.length > 0) {
        // Update existing attendance
        const updatePromises = session.entries.map(entry => {
          const existing = existingAttendance.find((a: any) => a.student_id === entry.studentId);
          
          if (existing) {
            // Update existing record
            return (supabase as any)
              .from('attendance')
              .update({
                is_present: entry.isPresent,
                marked_by: profile.id,
                updated_at: new Date().toISOString()
              })
              .eq('id', (existing as any).id);
          } else {
            // Insert new record for students not previously marked
            return (supabase as any)
              .from('attendance')
              .insert({
                subject_id: session.subjectId,
                student_id: entry.studentId,
                class_date: session.classDate,
                is_present: entry.isPresent,
                marked_by: profile.id
              });
          }
        });

        const results = await Promise.all(updatePromises);
        const errors = results.filter(result => result.error);
        
        if (errors.length > 0) {
          throw new Error(`Failed to update attendance for some students`);
        }
      } else {
        // Insert new attendance records
        const { error: insertError } = await (supabase as any)
          .from('attendance')
          .insert(attendanceRecords);

        if (insertError) throw insertError;
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark attendance');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceForDate = async (subjectId: string, date: string) => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          student_id,
          is_present,
          students:student_id (
            id,
            full_name
          )
        `)
        .eq('subject_id', subjectId)
        .eq('class_date', date);

      if (error) throw error;

      return data?.map((record: any) => ({
        studentId: record.student_id,
        studentName: record.students?.full_name || 'Unknown',
        isPresent: record.is_present
      })) || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance');
      return [];
    }
  };

  const bulkMarkAttendance = async (
    subjectId: string, 
    classDate: string, 
    studentIds: string[], 
    markAsPresent: boolean = true
  ) => {
    if (!profile?.id) return false;

    try {
      setLoading(true);

      const attendanceRecords = studentIds.map(studentId => ({
        subject_id: subjectId,
        student_id: studentId,
        class_date: classDate,
        is_present: markAsPresent,
        marked_by: profile.id
      }));

      const { error } = await (supabase as any)
        .from('attendance')
        .upsert(attendanceRecords, {
          onConflict: 'subject_id,student_id,class_date',
          ignoreDuplicates: false
        });

      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk mark attendance');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    markAttendance,
    getAttendanceForDate,
    bulkMarkAttendance,
    loading,
    error
  };
}