"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  AttendanceRecord,
  AttendanceSession,
  BulkAttendanceForm,
  AttendanceStats,
  StudentAttendanceSummary,
  SubjectWithStats,
  Student
} from '@/types'

export function useAttendanceManagement(subjectId?: string) {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([])
  const [stats, setStats] = useState<AttendanceStats>({
    total_classes: 0,
    total_students: 0,
    average_attendance: 0,
    recent_sessions: [],
    attendance_trend: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Demo mode detection
  const isDemoMode = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')

  // Demo data
  const demoSessions: AttendanceSession[] = [
    {
      id: '1',
      subject_id: '1',
      date: '2024-03-26',
      created_by: '2',
      notes: 'Regular class session',
      total_students: 25,
      present_count: 22,
      absent_count: 2,
      late_count: 1,
      excused_count: 0
    },
    {
      id: '2',
      subject_id: '1',
      date: '2024-03-25',
      created_by: '2',
      notes: 'Quiz session',
      total_students: 25,
      present_count: 24,
      absent_count: 1,
      late_count: 0,
      excused_count: 0
    },
    {
      id: '3',
      subject_id: '2',
      date: '2024-03-26',
      created_by: '2',
      notes: 'Lab session',
      total_students: 18,
      present_count: 16,
      absent_count: 1,
      late_count: 1,
      excused_count: 0
    }
  ]

  const demoAttendanceRecords: AttendanceRecord[] = [
    {
      id: '1',
      student_id: '1',
      subject_id: '1',
      date: '2024-03-26',
      status: 'present',
      marked_by: '2',
      notes: ''
    },
    {
      id: '2',
      student_id: '1',
      subject_id: '1',
      date: '2024-03-25',
      status: 'present',
      marked_by: '2',
      notes: ''
    },
    {
      id: '3',
      student_id: '1',
      subject_id: '2',
      date: '2024-03-26',
      status: 'late',
      marked_by: '2',
      notes: 'Arrived 15 minutes late'
    }
  ]

  // Calculate demo stats
  useEffect(() => {
    if (isDemoMode) {
      const filteredSessions = subjectId 
        ? demoSessions.filter(s => s.subject_id === subjectId)
        : demoSessions

      const totalClasses = filteredSessions.length
      const totalStudentSlots = filteredSessions.reduce((sum, session) => sum + session.total_students, 0)
      const totalPresent = filteredSessions.reduce((sum, session) => sum + session.present_count + session.late_count, 0)
      const averageAttendance = totalStudentSlots > 0 ? (totalPresent / totalStudentSlots) * 100 : 0

      const trend = filteredSessions.slice(-7).map(session => ({
        date: session.date,
        percentage: session.total_students > 0 
          ? ((session.present_count + session.late_count) / session.total_students) * 100 
          : 0
      }))

      setStats({
        total_classes: totalClasses,
        total_students: filteredSessions[0]?.total_students || 0,
        average_attendance: averageAttendance,
        recent_sessions: filteredSessions.slice(-5),
        attendance_trend: trend
      })

      setAttendanceSessions(filteredSessions)
      setAttendanceRecords(subjectId 
        ? demoAttendanceRecords.filter(r => r.subject_id === subjectId)
        : demoAttendanceRecords
      )
    }
  }, [isDemoMode, subjectId])

  // Get enrolled students for a subject
  const getEnrolledStudents = async (subjectId: string): Promise<{ data: Student[] | null; error: string | null }> => {
    if (isDemoMode) {
      // Demo enrolled students
      const demoStudents: Student[] = [
        {
          id: '1',
          user_id: '1',
          student_id: 'STU001',
          enrollment_date: '2024-01-01',
          class_level: 'Grade 10',
          profile: {
            id: '1',
            user_id: '1',
            full_name: 'Student Demo'
          }
        },
        {
          id: '3',
          user_id: '3',
          student_id: 'STU003',
          enrollment_date: '2024-01-01',
          class_level: 'Grade 10',
          profile: {
            id: '3',
            user_id: '3',
            full_name: 'John Doe'
          }
        },
        {
          id: '4',
          user_id: '4',
          student_id: 'STU004',
          enrollment_date: '2024-01-01',
          class_level: 'Grade 10',
          profile: {
            id: '4',
            user_id: '4',
            full_name: 'Jane Smith'
          }
        }
      ]
      return { data: demoStudents, error: null }
    }

    try {
      const { data, error } = await (supabase as any)
        .from('subject_enrollments')
        .select(`
          student:students!inner(
            id,
            user_id,
            student_id,
            enrollment_date,
            class_level,
            profile:profiles!inner(
              id,
              user_id,
              full_name
            )
          )
        `)
        .eq('subject_id', subjectId)
        .eq('status', 'active')

      if (error) {
        throw new Error(error.message)
      }

      const students = (data || []).map((item: any) => item.student)
      return { data: students, error: null }

    } catch (error: any) {
      return { data: null, error: error.message }
    }
  }

  // Mark bulk attendance
  const markBulkAttendance = async (attendanceData: BulkAttendanceForm) => {
    if (isDemoMode) {
      const newSession: AttendanceSession = {
        id: Date.now().toString(),
        subject_id: attendanceData.subject_id,
        date: attendanceData.date,
        created_by: '2', // Current faculty ID in demo
        notes: attendanceData.notes || '',
        total_students: attendanceData.attendance_records.length,
        present_count: attendanceData.attendance_records.filter(r => r.status === 'present').length,
        absent_count: attendanceData.attendance_records.filter(r => r.status === 'absent').length,
        late_count: attendanceData.attendance_records.filter(r => r.status === 'late').length,
        excused_count: attendanceData.attendance_records.filter(r => r.status === 'excused').length
      }

      const newRecords: AttendanceRecord[] = attendanceData.attendance_records.map(record => ({
        id: `${Date.now()}_${record.student_id}`,
        student_id: record.student_id,
        subject_id: attendanceData.subject_id,
        date: attendanceData.date,
        status: record.status,
        marked_by: '2',
        notes: record.notes || ''
      }))

      // Update local state
      setAttendanceSessions(prev => [newSession, ...prev])
      setAttendanceRecords(prev => [...newRecords, ...prev])

      return { data: { session: newSession, records: newRecords }, error: null }
    }

    setIsLoading(true)
    setError(null)

    try {
      // First create the attendance session
      const { data: sessionData, error: sessionError } = await (supabase as any)
        .from('attendance_sessions')
        .insert({
          subject_id: attendanceData.subject_id,
          date: attendanceData.date,
          created_by: '2', // Should be current user ID
          notes: attendanceData.notes,
          total_students: attendanceData.attendance_records.length,
          present_count: attendanceData.attendance_records.filter(r => r.status === 'present').length,
          absent_count: attendanceData.attendance_records.filter(r => r.status === 'absent').length,
          late_count: attendanceData.attendance_records.filter(r => r.status === 'late').length,
          excused_count: attendanceData.attendance_records.filter(r => r.status === 'excused').length
        })
        .select()
        .single()

      if (sessionError) {
        throw new Error(sessionError.message)
      }

      // Then create individual attendance records
      const attendanceRecords = attendanceData.attendance_records.map(record => ({
        student_id: record.student_id,
        subject_id: attendanceData.subject_id,
        date: attendanceData.date,
        status: record.status,
        marked_by: '2', // Should be current user ID
        notes: record.notes || ''
      }))

      const { data: recordsData, error: recordsError } = await (supabase as any)
        .from('attendance')
        .insert(attendanceRecords)
        .select()

      if (recordsError) {
        throw new Error(recordsError.message)
      }

      // Refresh data
      await fetchAttendanceSessions()
      await fetchAttendanceRecords()

      return { data: { session: sessionData, records: recordsData }, error: null }

    } catch (error: any) {
      setError(error.message)
      return { data: null, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch attendance sessions
  const fetchAttendanceSessions = async (subject_id?: string) => {
    if (isDemoMode) {
      const filteredSessions = subject_id 
        ? demoSessions.filter(s => s.subject_id === subject_id)
        : demoSessions
      setAttendanceSessions(filteredSessions)
      return { data: filteredSessions, error: null }
    }

    setIsLoading(true)
    try {
      let query = (supabase as any)
        .from('attendance_sessions')
        .select('*')
        .order('date', { ascending: false })

      if (subject_id) {
        query = query.eq('subject_id', subject_id)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(error.message)
      }

      setAttendanceSessions(data || [])
      return { data: data || [], error: null }

    } catch (error: any) {
      setError(error.message)
      return { data: null, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch attendance records
  const fetchAttendanceRecords = async (subject_id?: string, date?: string) => {
    if (isDemoMode) {
      let filteredRecords = [...demoAttendanceRecords]
      if (subject_id) {
        filteredRecords = filteredRecords.filter(r => r.subject_id === subject_id)
      }
      if (date) {
        filteredRecords = filteredRecords.filter(r => r.date === date)
      }
      setAttendanceRecords(filteredRecords)
      return { data: filteredRecords, error: null }
    }

    setIsLoading(true)
    try {
      let query = (supabase as any)
        .from('attendance')
        .select(`
          *,
          student:students!inner(
            id,
            user_id,
            student_id,
            profile:profiles!inner(full_name)
          ),
          subject:subjects!inner(name, code)
        `)
        .order('date', { ascending: false })

      if (subject_id) {
        query = query.eq('subject_id', subject_id)
      }
      if (date) {
        query = query.eq('date', date)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(error.message)
      }

      setAttendanceRecords(data || [])
      return { data: data || [], error: null }

    } catch (error: any) {
      setError(error.message)
      return { data: null, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Get student attendance summary
  const getStudentAttendanceSummary = async (subject_id: string): Promise<{ data: StudentAttendanceSummary[] | null; error: string | null }> => {
    if (isDemoMode) {
      const summary: StudentAttendanceSummary[] = [
        {
          student_id: '1',
          student_name: 'Student Demo',
          total_classes: 2,
          attended_classes: 2,
          attendance_percentage: 100,
          recent_status: 'present'
        },
        {
          student_id: '3',
          student_name: 'John Doe',
          total_classes: 2,
          attended_classes: 1,
          attendance_percentage: 50,
          recent_status: 'absent'
        },
        {
          student_id: '4',
          student_name: 'Jane Smith',
          total_classes: 2,
          attended_classes: 2,
          attendance_percentage: 100,
          recent_status: 'present'
        }
      ]
      return { data: summary, error: null }
    }

    try {
      const { data, error } = await (supabase as any)
        .rpc('get_student_attendance_summary', {
          p_subject_id: subject_id
        })

      if (error) {
        throw new Error(error.message)
      }

      return { data: data || [], error: null }

    } catch (error: any) {
      return { data: null, error: error.message }
    }
  }

  // Update attendance record
  const updateAttendanceRecord = async (recordId: string, updates: Partial<AttendanceRecord>) => {
    if (isDemoMode) {
      setAttendanceRecords(prev => 
        prev.map(record => 
          record.id === recordId ? { ...record, ...updates } : record
        )
      )
      return { error: null }
    }

    setIsLoading(true)
    try {
      const { error } = await (supabase as any)
        .from('attendance')
        .update(updates)
        .eq('id', recordId)

      if (error) {
        throw new Error(error.message)
      }

      await fetchAttendanceRecords()
      return { error: null }

    } catch (error: any) {
      setError(error.message)
      return { error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Delete attendance session
  const deleteAttendanceSession = async (sessionId: string) => {
    if (isDemoMode) {
      setAttendanceSessions(prev => prev.filter(session => session.id !== sessionId))
      setAttendanceRecords(prev => prev.filter(record => 
        !demoSessions.find(s => s.id === sessionId)?.date || record.date !== demoSessions.find(s => s.id === sessionId)?.date
      ))
      return { error: null }
    }

    setIsLoading(true)
    try {
      const { error } = await (supabase as any)
        .from('attendance_sessions')
        .delete()
        .eq('id', sessionId)

      if (error) {
        throw new Error(error.message)
      }

      await fetchAttendanceSessions()
      await fetchAttendanceRecords()
      return { error: null }

    } catch (error: any) {
      setError(error.message)
      return { error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    attendanceRecords,
    attendanceSessions,
    stats,
    isLoading,
    error,
    getEnrolledStudents,
    markBulkAttendance,
    fetchAttendanceSessions,
    fetchAttendanceRecords,
    getStudentAttendanceSummary,
    updateAttendanceRecord,
    deleteAttendanceSession
  }
}