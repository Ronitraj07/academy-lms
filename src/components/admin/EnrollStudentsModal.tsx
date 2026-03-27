"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Users, UserMinus } from 'lucide-react'
import { useSubjectManagement } from '@/hooks/useSubjectManagement'
import { SubjectWithStats, SubjectEnrollment, UserWithProfile } from '@/types'

interface EnrollStudentsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject: SubjectWithStats
}

export function EnrollStudentsModal({ 
  open, 
  onOpenChange,
  subject 
}: EnrollStudentsModalProps) {
  const { 
    enrollStudents, 
    removeEnrollment, 
    getSubjectEnrollments, 
    getAvailableStudents,
    isLoading 
  } = useSubjectManagement()

  const [currentEnrollments, setCurrentEnrollments] = useState<SubjectEnrollment[]>([])
  const [availableStudents, setAvailableStudents] = useState<UserWithProfile[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('enroll')
  const [error, setError] = useState<string | null>(null)

  // Fetch enrollment data when modal opens
  useEffect(() => {
    if (open) {
      loadEnrollmentData()
    }
  }, [open])

  const loadEnrollmentData = async () => {
    // Load current enrollments
    const enrollmentResult = await getSubjectEnrollments(subject.id)
    if (enrollmentResult.data) {
      setCurrentEnrollments(enrollmentResult.data)
    }

    // Load available students
    const studentsResult = await getAvailableStudents(subject.id)
    if (studentsResult.data) {
      setAvailableStudents(studentsResult.data)
    }
  }

  // Filter available students based on search
  const filteredAvailableStudents = availableStudents.filter(student =>
    student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.student?.student_id?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Filter current enrollments based on search
  const filteredCurrentEnrollments = currentEnrollments.filter(enrollment =>
    enrollment.student?.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    enrollment.student?.student_id?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleEnrollSelected = async () => {
    if (selectedStudents.length === 0) {
      setError('Please select at least one student to enroll')
      return
    }

    const result = await enrollStudents({
      student_ids: selectedStudents,
      subject_id: subject.id,
      faculty_id: subject.created_by
    })

    if (result.error) {
      setError(result.error)
    } else {
      // Refresh data
      await loadEnrollmentData()
      setSelectedStudents([])
      setError(null)
      setActiveTab('current') // Switch to current enrollments tab
    }
  }

  const handleRemoveEnrollment = async (enrollmentId: string) => {
    const result = await removeEnrollment(enrollmentId)
    
    if (result.error) {
      setError(result.error)
    } else {
      // Refresh data
      await loadEnrollmentData()
      setError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Manage Student Enrollment</DialogTitle>
          <DialogDescription>
            Enroll or remove students from "{subject.name}" ({subject.code})
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="enroll">Enroll Students</TabsTrigger>
            <TabsTrigger value="current">Current Enrollments</TabsTrigger>
          </TabsList>

          <TabsContent value="enroll" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Available Students
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  {selectedStudents.length > 0 && (
                    <Badge variant="secondary">
                      {selectedStudents.length} selected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {filteredAvailableStudents.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                          {searchQuery ? 'No students found matching your search.' : 'No available students to enroll.'}
                        </p>
                      ) : (
                        filteredAvailableStudents.map((student) => (
                          <div 
                            key={student.id} 
                            className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                            onClick={() => handleSelectStudent(student.id)}
                          >
                            <Checkbox
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => handleSelectStudent(student.id)}
                            />
                            <div className="flex-1">
                              <div className="font-medium">{student.full_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {student.student?.student_id} • {student.email}
                                {student.student?.class_level && ` • ${student.student.class_level}`}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="current" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Currently Enrolled ({currentEnrollments.length})
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search enrolled students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {filteredCurrentEnrollments.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        {searchQuery ? 'No enrolled students found matching your search.' : 'No students currently enrolled.'}
                      </p>
                    ) : (
                      filteredCurrentEnrollments.map((enrollment) => (
                        <div 
                          key={enrollment.id} 
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div className="flex-1">
                            <div className="font-medium">
                              {enrollment.student?.profile?.full_name || 'Unknown Student'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {enrollment.student?.student_id}
                              <span className="mx-2">•</span>
                              Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                              <span className="mx-2">•</span>
                              <Badge variant="outline" className="text-xs">
                                {enrollment.status}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveEnrollment(enrollment.id)}
                            disabled={isLoading}
                            className="text-destructive hover:text-destructive"
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Close
          </Button>
          {activeTab === 'enroll' && (
            <Button 
              onClick={handleEnrollSelected}
              disabled={isLoading || selectedStudents.length === 0}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  Enrolling...
                </>
              ) : (
                `Enroll ${selectedStudents.length} Student${selectedStudents.length !== 1 ? 's' : ''}`
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}