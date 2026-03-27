"use client"

import { useState, useEffect } from 'react'
import { Calendar, Users, TrendingUp, Clock, Plus, Filter, Download } from 'lucide-react'
import { useAttendanceManagement } from '@/hooks/useAttendanceManagement'
import { useSubjectManagement } from '@/hooks/useSubjectManagement'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BulkAttendanceModal } from './BulkAttendanceModal'
import { AttendanceChart } from './AttendanceChart'
import { AttendanceSession } from '@/types'

interface AttendanceManagementTableProps {
  userRole?: 'admin' | 'faculty' | 'student'
  facultyId?: string
}

export function AttendanceManagementTable({ userRole = 'admin', facultyId }: AttendanceManagementTableProps) {
  const {
    attendanceSessions,
    stats,
    isLoading,
    error,
    fetchAttendanceSessions,
    deleteAttendanceSession
  } = useAttendanceManagement()

  const {
    subjects,
    fetchSubjects
  } = useSubjectManagement()

  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null)

  // Fetch data on component mount
  useEffect(() => {
    fetchSubjects(undefined, userRole === 'faculty' ? facultyId : undefined)
    fetchAttendanceSessions()
  }, [userRole, facultyId])

  // Filter sessions by selected subject
  const filteredSessions = selectedSubject 
    ? attendanceSessions.filter(session => session.subject_id === selectedSubject)
    : attendanceSessions

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId)
    if (subjectId) {
      fetchAttendanceSessions(subjectId)
    } else {
      fetchAttendanceSessions()
    }
  }

  const handleMarkAttendance = () => {
    if (!selectedSubject) {
      alert('Please select a subject first')
      return
    }
    setShowBulkModal(true)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'present':
        return 'default'
      case 'late':
        return 'secondary'
      case 'absent':
        return 'destructive'
      case 'excused':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const calculateAttendancePercentage = (session: AttendanceSession) => {
    if (session.total_students === 0) return 0
    return Math.round(((session.present_count + session.late_count) / session.total_students) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_classes}</div>
            <p className="text-xs text-muted-foreground">
              {selectedSubject ? 'For selected subject' : 'All subjects'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.average_attendance)}%</div>
            <p className="text-xs text-muted-foreground">
              Across all sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_students}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recent_sessions.length}</div>
            <p className="text-xs text-muted-foreground">
              Last 5 sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={selectedSubject} onValueChange={handleSubjectChange}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select subject..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>

          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {(userRole === 'admin' || userRole === 'faculty') && (
          <Button onClick={handleMarkAttendance}>
            <Plus className="mr-2 h-4 w-4" />
            Mark Attendance
          </Button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Attendance Chart */}
      {stats.attendance_trend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
            <CardDescription>Daily attendance percentage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <AttendanceChart data={stats.attendance_trend} />
          </CardContent>
        </Card>
      )}

      {/* Attendance Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Sessions</CardTitle>
          <CardDescription>
            Recent attendance sessions and statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Total Students</TableHead>
                  <TableHead>Present</TableHead>
                  <TableHead>Absent</TableHead>
                  <TableHead>Late</TableHead>
                  <TableHead>Attendance %</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No attendance sessions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSessions.map((session) => {
                    const subject = subjects.find(s => s.id === session.subject_id)
                    const attendancePercentage = calculateAttendancePercentage(session)
                    
                    return (
                      <TableRow key={session.id}>
                        <TableCell>
                          {new Date(session.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{subject?.name || 'Unknown'}</div>
                            <div className="text-sm text-muted-foreground">{subject?.code}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{session.total_students}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            {session.present_count}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">
                            {session.absent_count}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {session.late_count}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium">{attendancePercentage}%</div>
                            <div 
                              className={`h-2 w-12 rounded-full ${
                                attendancePercentage >= 90 ? 'bg-green-500' :
                                attendancePercentage >= 75 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm text-muted-foreground">
                            {session.notes || 'No notes'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            {(userRole === 'admin' || userRole === 'faculty') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteAttendanceSession(session.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <BulkAttendanceModal 
        open={showBulkModal}
        onOpenChange={setShowBulkModal}
        subjectId={selectedSubject}
        subjects={subjects}
        onSubjectChange={setSelectedSubject}
      />
    </div>
  )
}