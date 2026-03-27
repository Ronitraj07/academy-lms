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
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Users, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { useAttendanceManagement } from '@/hooks/useAttendanceManagement'
import { BulkAttendanceForm, Student, SubjectWithStats } from '@/types'

interface BulkAttendanceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjectId: string
  subjects: SubjectWithStats[]
  onSubjectChange: (subjectId: string) => void
}

export function BulkAttendanceModal({ 
  open, 
  onOpenChange,
  subjectId,
  subjects,
  onSubjectChange
}: BulkAttendanceModalProps) {
  const { 
    getEnrolledStudents, 
    markBulkAttendance,
    isLoading 
  } = useAttendanceManagement()

  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([])
  const [attendanceData, setAttendanceData] = useState<BulkAttendanceForm>({
    subject_id: subjectId,
    date: new Date().toISOString().split('T')[0],
    notes: '',
    attendance_records: []
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('mark-attendance')
  const [error, setError] = useState<string | null>(null)

  // Load enrolled students when subject changes
  useEffect(() => {
    if (subjectId && open) {
      loadEnrolledStudents()
    }
  }, [subjectId, open])

  const loadEnrolledStudents = async () => {
    const result = await getEnrolledStudents(subjectId)
    if (result.data) {
      setEnrolledStudents(result.data)
      // Initialize attendance records with default 'present' status
      setAttendanceData(prev => ({
        ...prev,
        subject_id: subjectId,
        attendance_records: result.data!.map(student => ({
          student_id: student.id,
          status: 'present' as const,
          notes: ''
        }))
      }))
    } else if (result.error) {
      setError(result.error)
    }
  }

  // Filter students based on search
  const filteredStudents = enrolledStudents.filter(student =>
    student.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.student_id?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setAttendanceData(prev => ({
      ...prev,
      attendance_records: prev.attendance_records.map(record =>
        record.student_id === studentId ? { ...record, status } : record
      )
    }))
  }

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceData(prev => ({
      ...prev,
      attendance_records: prev.attendance_records.map(record =>
        record.student_id === studentId ? { ...record, notes } : record
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!attendanceData.subject_id) {
      setError('Please select a subject')
      return
    }

    if (!attendanceData.date) {
      setError('Please select a date')
      return
    }

    if (attendanceData.attendance_records.length === 0) {
      setError('No students found to mark attendance')
      return
    }

    const result = await markBulkAttendance(attendanceData)
    
    if (result.error) {
      setError(result.error)
    } else {
      setError(null)
      onOpenChange(false)
      // Reset form
      setAttendanceData({
        subject_id: subjectId,
        date: new Date().toISOString().split('T')[0],
        notes: '',
        attendance_records: []
      })
      setActiveTab('mark-attendance')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'excused':
        return <AlertTriangle className="h-4 w-4 text-blue-600" />
      default:
        return null
    }
  }

  const getStatusCounts = () => {
    const counts = { present: 0, absent: 0, late: 0, excused: 0 }
    attendanceData.attendance_records.forEach(record => {
      counts[record.status]++
    })
    return counts
  }

  const statusCounts = getStatusCounts()
  const selectedSubject = subjects.find(s => s.id === subjectId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Mark Attendance</DialogTitle>
          <DialogDescription>
            Mark attendance for enrolled students in the selected subject
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mark-attendance">Mark Attendance</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="mark-attendance" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Session Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select value={subjectId} onValueChange={onSubjectChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={attendanceData.date}
                    onChange={(e) => setAttendanceData(prev => ({ ...prev, date: e.target.value }))}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-notes">Session Notes</Label>
                <Textarea
                  id="session-notes"
                  placeholder="Add any notes about this session..."
                  value={attendanceData.notes}
                  onChange={(e) => setAttendanceData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                />
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Students List */}
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {enrolledStudents.length === 0 ? 'No enrolled students found.' : 'No students match your search.'}
                    </div>
                  ) : (
                    filteredStudents.map((student) => {
                      const attendanceRecord = attendanceData.attendance_records.find(r => r.student_id === student.id)
                      
                      return (
                        <Card key={student.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-medium">
                                  {student.profile?.full_name?.charAt(0) || 'S'}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">{student.profile?.full_name}</div>
                                <div className="text-sm text-muted-foreground">{student.student_id}</div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {(['present', 'late', 'absent', 'excused'] as const).map((status) => (
                                <Button
                                  key={status}
                                  type="button"
                                  variant={attendanceRecord?.status === status ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleStatusChange(student.id, status)}
                                  className="capitalize"
                                >
                                  {getStatusIcon(status)}
                                  <span className="ml-1">{status}</span>
                                </Button>
                              ))}
                            </div>
                          </div>

                          {attendanceRecord?.status === 'late' || attendanceRecord?.status === 'excused' ? (
                            <div className="mt-3">
                              <Input
                                placeholder="Add notes (optional)..."
                                value={attendanceRecord.notes || ''}
                                onChange={(e) => handleNotesChange(student.id, e.target.value)}
                                className="text-sm"
                              />
                            </div>
                          ) : null}
                        </Card>
                      )
                    })
                  )}
                </div>
              </ScrollArea>
            </form>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Attendance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{statusCounts.present}</div>
                    <div className="text-sm text-muted-foreground">Present</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{statusCounts.late}</div>
                    <div className="text-sm text-muted-foreground">Late</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{statusCounts.absent}</div>
                    <div className="text-sm text-muted-foreground">Absent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{statusCounts.excused}</div>
                    <div className="text-sm text-muted-foreground">Excused</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subject:</span>
                    <span className="font-medium">{selectedSubject?.name} ({selectedSubject?.code})</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Date:</span>
                    <span className="font-medium">{new Date(attendanceData.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Students:</span>
                    <span className="font-medium">{attendanceData.attendance_records.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Attendance Rate:</span>
                    <span className="font-medium">
                      {attendanceData.attendance_records.length > 0 
                        ? Math.round(((statusCounts.present + statusCounts.late) / attendanceData.attendance_records.length) * 100)
                        : 0
                      }%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || attendanceData.attendance_records.length === 0}
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              'Save Attendance'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}