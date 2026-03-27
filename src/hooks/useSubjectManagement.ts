"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Subject, 
  SubjectEnrollment, 
  CreateSubjectForm, 
  UpdateSubjectForm, 
  SubjectStats, 
  SubjectWithStats, 
  EnrollmentForm,
  UserWithProfile 
} from '@/types'

export function useSubjectManagement() {
  const [subjects, setSubjects] = useState<SubjectWithStats[]>([])
  const [enrollments, setEnrollments] = useState<SubjectEnrollment[]>([])
  const [stats, setStats] = useState<SubjectStats>({
    total_subjects: 0,
    active_subjects: 0,
    students_enrolled: 0,
    recent_enrollments: [],
    subjects_by_department: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Demo mode detection
  const isDemoMode = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')

  // Demo data
  const demoSubjects: SubjectWithStats[] = [
    {
      id: '1',
      name: 'Mathematics',
      code: 'MATH101',
      description: 'Introduction to Calculus and Algebra',
      credits: 4,
      department: 'Mathematics',
      created_by: '2', // Faculty user ID
      created_at: '2024-01-15T00:00:00.000Z',
      enrolled_students: 25,
      average_attendance: 87.5,
      faculty: {
        id: '2',
        user_id: '2',
        employee_id: 'FAC001',
        department: 'Mathematics',
        hire_date: '2023-01-01',
        specialization: 'Applied Mathematics'
      }
    },
    {
      id: '2',
      name: 'Physics',
      code: 'PHY101',
      description: 'Classical Mechanics and Thermodynamics',
      credits: 4,
      department: 'Physics',
      created_by: '2',
      created_at: '2024-01-15T00:00:00.000Z',
      enrolled_students: 18,
      average_attendance: 92.3,
      faculty: {
        id: '2',
        user_id: '2',
        employee_id: 'FAC001',
        department: 'Physics',
        hire_date: '2023-01-01',
        specialization: 'Theoretical Physics'
      }
    },
    {
      id: '3',
      name: 'Chemistry',
      code: 'CHEM101',
      description: 'Organic and Inorganic Chemistry',
      credits: 3,
      department: 'Chemistry',
      created_by: '2',
      created_at: '2024-01-15T00:00:00.000Z',
      enrolled_students: 22,
      average_attendance: 85.1,
      faculty: {
        id: '2',
        user_id: '2',
        employee_id: 'FAC001',
        department: 'Chemistry',
        hire_date: '2023-01-01',
        specialization: 'Analytical Chemistry'
      }
    }
  ]

  const demoEnrollments: SubjectEnrollment[] = [
    {
      id: '1',
      student_id: '1',
      subject_id: '1',
      faculty_id: '2',
      enrolled_at: '2024-02-01T00:00:00.000Z',
      status: 'active'
    },
    {
      id: '2',
      student_id: '1',
      subject_id: '2',
      faculty_id: '2',
      enrolled_at: '2024-02-01T00:00:00.000Z',
      status: 'active'
    }
  ]

  // Calculate demo stats
  useEffect(() => {
    if (isDemoMode) {
      const departments = demoSubjects.reduce((acc: any, subject) => {
        const dept = acc.find((d: any) => d.department === subject.department)
        if (dept) {
          dept.count += 1
        } else {
          acc.push({ department: subject.department, count: 1 })
        }
        return acc
      }, [])

      const totalEnrollments = demoSubjects.reduce((sum, subject) => sum + (subject.enrolled_students || 0), 0)

      setStats({
        total_subjects: demoSubjects.length,
        active_subjects: demoSubjects.filter(s => (s.enrolled_students || 0) > 0).length,
        students_enrolled: totalEnrollments,
        recent_enrollments: demoEnrollments,
        subjects_by_department: departments
      })

      setSubjects(demoSubjects)
      setEnrollments(demoEnrollments)
    }
  }, [isDemoMode])

  // Fetch subjects
  const fetchSubjects = async (department?: string, facultyId?: string) => {
    if (isDemoMode) {
      let filteredSubjects = [...demoSubjects]
      if (department) {
        filteredSubjects = filteredSubjects.filter(s => s.department === department)
      }
      if (facultyId) {
        filteredSubjects = filteredSubjects.filter(s => s.created_by === facultyId)
      }
      setSubjects(filteredSubjects)
      return { data: filteredSubjects, error: null }
    }

    setIsLoading(true)
    setError(null)

    try {
      let query = (supabase as any)
        .from('subjects')
        .select(`
          *,
          faculty:created_by(
            id,
            user_id,
            employee_id,
            department,
            hire_date,
            specialization,
            profile:profiles(full_name)
          )
        `)

      if (department) {
        query = query.eq('department', department)
      }
      if (facultyId) {
        query = query.eq('created_by', facultyId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      // Get enrollment counts for each subject
      const subjectsWithStats = await Promise.all(
        (data || []).map(async (subject: any) => {
          const { count } = await (supabase as any)
            .from('subject_enrollments')
            .select('id', { count: 'exact' })
            .eq('subject_id', subject.id)
            .eq('status', 'active')

          return {
            ...subject,
            enrolled_students: count || 0
          }
        })
      )

      setSubjects(subjectsWithStats)
      return { data: subjectsWithStats, error: null }

    } catch (error: any) {
      setError(error.message)
      return { data: null, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Create subject
  const createSubject = async (subjectData: CreateSubjectForm) => {
    if (isDemoMode) {
      const newSubject: SubjectWithStats = {
        id: Date.now().toString(),
        name: subjectData.name,
        code: subjectData.code,
        description: subjectData.description,
        credits: subjectData.credits,
        department: subjectData.department,
        created_by: subjectData.faculty_id || '2',
        created_at: new Date().toISOString(),
        enrolled_students: 0
      }
      
      const updatedSubjects = [...subjects, newSubject]
      setSubjects(updatedSubjects)
      
      // Update stats
      setStats(prev => ({
        ...prev,
        total_subjects: prev.total_subjects + 1,
        subjects_by_department: prev.subjects_by_department.map(dept => 
          dept.department === subjectData.department 
            ? { ...dept, count: dept.count + 1 }
            : dept
        ).concat(
          prev.subjects_by_department.find(dept => dept.department === subjectData.department) 
            ? [] 
            : [{ department: subjectData.department, count: 1 }]
        )
      }))

      return { data: newSubject, error: null }
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await (supabase as any)
        .from('subjects')
        .insert([{
          name: subjectData.name,
          code: subjectData.code,
          description: subjectData.description,
          credits: subjectData.credits,
          department: subjectData.department,
          created_by: subjectData.faculty_id
        }])
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      await fetchSubjects()
      return { data, error: null }

    } catch (error: any) {
      setError(error.message)
      return { data: null, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Update subject
  const updateSubject = async (subjectId: string, updates: UpdateSubjectForm) => {
    if (isDemoMode) {
      const updatedSubjects = subjects.map(subject =>
        subject.id === subjectId ? { ...subject, ...updates } : subject
      )
      setSubjects(updatedSubjects)
      return { data: updatedSubjects.find(s => s.id === subjectId), error: null }
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await (supabase as any)
        .from('subjects')
        .update(updates)
        .eq('id', subjectId)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      await fetchSubjects()
      return { data, error: null }

    } catch (error: any) {
      setError(error.message)
      return { data: null, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Delete subject
  const deleteSubject = async (subjectId: string) => {
    if (isDemoMode) {
      const filteredSubjects = subjects.filter(subject => subject.id !== subjectId)
      setSubjects(filteredSubjects)
      setStats(prev => ({ ...prev, total_subjects: prev.total_subjects - 1 }))
      return { error: null }
    }

    setIsLoading(true)
    setError(null)

    try {
      // Check if there are active enrollments
      const { data: enrollmentCheck } = await (supabase as any)
        .from('subject_enrollments')
        .select('id')
        .eq('subject_id', subjectId)
        .eq('status', 'active')
        .limit(1)

      if (enrollmentCheck && enrollmentCheck.length > 0) {
        throw new Error('Cannot delete subject with active enrollments')
      }

      const { error } = await (supabase as any)
        .from('subjects')
        .delete()
        .eq('id', subjectId)

      if (error) {
        throw new Error(error.message)
      }

      await fetchSubjects()
      return { error: null }

    } catch (error: any) {
      setError(error.message)
      return { error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Enroll students
  const enrollStudents = async (enrollmentData: EnrollmentForm) => {
    if (isDemoMode) {
      const newEnrollments = enrollmentData.student_ids.map(studentId => ({
        id: Date.now().toString() + studentId,
        student_id: studentId,
        subject_id: enrollmentData.subject_id,
        faculty_id: enrollmentData.faculty_id,
        enrolled_at: new Date().toISOString(),
        status: 'active' as const
      }))
      
      setEnrollments(prev => [...prev, ...newEnrollments])
      
      // Update subject enrollment count
      setSubjects(prev => prev.map(subject =>
        subject.id === enrollmentData.subject_id 
          ? { ...subject, enrolled_students: (subject.enrolled_students || 0) + enrollmentData.student_ids.length }
          : subject
      ))
      
      return { data: newEnrollments, error: null }
    }

    setIsLoading(true)
    setError(null)

    try {
      const enrollmentRecords = enrollmentData.student_ids.map(studentId => ({
        student_id: studentId,
        subject_id: enrollmentData.subject_id,
        faculty_id: enrollmentData.faculty_id,
        enrolled_at: new Date().toISOString(),
        status: 'active'
      }))

      const { data, error } = await (supabase as any)
        .from('subject_enrollments')
        .insert(enrollmentRecords)
        .select()

      if (error) {
        throw new Error(error.message)
      }

      await fetchSubjects()
      return { data, error: null }

    } catch (error: any) {
      setError(error.message)
      return { data: null, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Remove enrollment
  const removeEnrollment = async (enrollmentId: string) => {
    if (isDemoMode) {
      const enrollment = enrollments.find(e => e.id === enrollmentId)
      if (enrollment) {
        setEnrollments(prev => prev.filter(e => e.id !== enrollmentId))
        setSubjects(prev => prev.map(subject =>
          subject.id === enrollment.subject_id 
            ? { ...subject, enrolled_students: Math.max(0, (subject.enrolled_students || 0) - 1) }
            : subject
        ))
      }
      return { error: null }
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error } = await (supabase as any)
        .from('subject_enrollments')
        .update({ status: 'inactive' })
        .eq('id', enrollmentId)

      if (error) {
        throw new Error(error.message)
      }

      await fetchSubjects()
      return { error: null }

    } catch (error: any) {
      setError(error.message)
      return { error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Get enrollments for a subject
  const getSubjectEnrollments = async (subjectId: string) => {
    if (isDemoMode) {
      const subjectEnrollments = demoEnrollments.filter(e => e.subject_id === subjectId)
      return { data: subjectEnrollments, error: null }
    }

    try {
      const { data, error } = await (supabase as any)
        .from('subject_enrollments')
        .select(`
          *,
          student:students(
            id,
            user_id,
            student_id,
            profile:profiles(full_name)
          ),
          faculty:faculty(
            id,
            user_id,
            employee_id,
            profile:profiles(full_name)
          )
        `)
        .eq('subject_id', subjectId)
        .eq('status', 'active')

      if (error) {
        throw new Error(error.message)
      }

      return { data, error: null }

    } catch (error: any) {
      return { data: null, error: error.message }
    }
  }

  // Get available students (not enrolled in subject)
  const getAvailableStudents = async (subjectId: string): Promise<{ data: UserWithProfile[] | null; error: string | null }> => {
    if (isDemoMode) {
      // Demo available students
      const availableStudents: UserWithProfile[] = [
        {
          id: '3',
          email: 'john.doe@academy.test',
          role: 'student',
          full_name: 'John Doe',
          created_at: '2024-01-01T00:00:00.000Z',
          profile: {
            id: '3',
            user_id: '3',
            full_name: 'John Doe'
          },
          student: {
            id: '3',
            user_id: '3',
            student_id: 'STU003',
            enrollment_date: '2024-01-01',
            class_level: 'Grade 10'
          }
        },
        {
          id: '4',
          email: 'jane.smith@academy.test',
          role: 'student',
          full_name: 'Jane Smith',
          created_at: '2024-01-01T00:00:00.000Z',
          profile: {
            id: '4',
            user_id: '4',
            full_name: 'Jane Smith'
          },
          student: {
            id: '4',
            user_id: '4',
            student_id: 'STU004',
            enrollment_date: '2024-01-01',
            class_level: 'Grade 10'
          }
        }
      ]
      return { data: availableStudents, error: null }
    }

    try {
      // Get all students who are not enrolled in this subject
      const { data, error } = await (supabase as any)
        .from('students')
        .select(`
          id,
          user_id,
          student_id,
          profile:profiles!inner(
            id,
            user_id,
            full_name
          )
        `)
        .not('id', 'in', `(
          SELECT student_id 
          FROM subject_enrollments 
          WHERE subject_id = '${subjectId}' 
          AND status = 'active'
        )`)

      if (error) {
        throw new Error(error.message)
      }

      const students: UserWithProfile[] = (data || []).map((student: any) => ({
        id: student.user_id,
        email: '',
        role: 'student' as const,
        full_name: student.profile?.full_name || '',
        profile: student.profile,
        student: student
      }))

      return { data: students, error: null }

    } catch (error: any) {
      return { data: null, error: error.message }
    }
  }

  return {
    subjects,
    enrollments,
    stats,
    isLoading,
    error,
    fetchSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    enrollStudents,
    removeEnrollment,
    getSubjectEnrollments,
    getAvailableStudents
  }
}