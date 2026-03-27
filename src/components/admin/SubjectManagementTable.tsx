"use client"

import { useState, useEffect } from 'react'
import { Search, Plus, Users, BookOpen, Filter, MoreHorizontal, Edit2, Trash2, UserPlus } from 'lucide-react'
import { useSubjectManagement } from '@/hooks/useSubjectManagement'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CreateSubjectModal } from './CreateSubjectModal'
import { EditSubjectModal } from './EditSubjectModal'
import { EnrollStudentsModal } from './EnrollStudentsModal'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { SubjectWithStats } from '@/types'

interface SubjectManagementTableProps {
  userRole?: 'admin' | 'faculty' | 'student'
  facultyId?: string
}

export function SubjectManagementTable({ userRole = 'admin', facultyId }: SubjectManagementTableProps) {
  const {
    subjects,
    stats,
    isLoading,
    error,
    fetchSubjects,
    deleteSubject
  } = useSubjectManagement()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<SubjectWithStats | null>(null)

  // Filter subjects based on search and department
  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = !searchQuery || 
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.department?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDepartment = !selectedDepartment || subject.department === selectedDepartment
    
    return matchesSearch && matchesDepartment
  })

  // Get unique departments
  const departments = Array.from(new Set(subjects.map(s => s.department).filter(Boolean))) as string[]

  // Fetch subjects on component mount
  useEffect(() => {
    fetchSubjects(selectedDepartment, userRole === 'faculty' ? facultyId : undefined)
  }, [selectedDepartment, userRole, facultyId])

  const handleDeleteSubject = async (subject: SubjectWithStats) => {
    setSelectedSubject(subject)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!selectedSubject) return

    const result = await deleteSubject(selectedSubject.id)
    if (!result.error) {
      setShowDeleteDialog(false)
      setSelectedSubject(null)
    }
  }

  const handleEditSubject = (subject: SubjectWithStats) => {
    setSelectedSubject(subject)
    setShowEditModal(true)
  }

  const handleEnrollStudents = (subject: SubjectWithStats) => {
    setSelectedSubject(subject)
    setShowEnrollModal(true)
  }

  const canManageSubject = (subject: SubjectWithStats) => {
    return userRole === 'admin' || (userRole === 'faculty' && subject.created_by === facultyId)
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_subjects}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active_subjects} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.students_enrolled}</div>
            <p className="text-xs text-muted-foreground">
              Across all subjects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.subjects_by_department.length}</div>
            <p className="text-xs text-muted-foreground">
              Different departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Enrollment</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total_subjects > 0 ? Math.round(stats.students_enrolled / stats.total_subjects) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Students per subject
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(userRole === 'admin' || userRole === 'faculty') && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Subject
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

      {/* Subjects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Management</CardTitle>
          <CardDescription>
            Manage subjects, enrollments, and track student progress
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
                  <TableHead>Subject</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Enrolled</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No subjects found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{subject.name}</div>
                          {subject.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {subject.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{subject.code}</Badge>
                      </TableCell>
                      <TableCell>{subject.department}</TableCell>
                      <TableCell>{subject.credits}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{subject.enrolled_students || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {subject.faculty?.profile?.full_name || subject.faculty?.employee_id || 'Not assigned'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={(subject.enrolled_students || 0) > 0 ? "default" : "secondary"}
                        >
                          {(subject.enrolled_students || 0) > 0 ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            
                            {canManageSubject(subject) && (
                              <>
                                <DropdownMenuItem onClick={() => handleEditSubject(subject)}>
                                  <Edit2 className="mr-2 h-4 w-4" />
                                  Edit Subject
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem onClick={() => handleEnrollStudents(subject)}>
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  Manage Enrollment
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteSubject(subject)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Subject
                                </DropdownMenuItem>
                              </>
                            )}
                            
                            {userRole === 'student' && (
                              <DropdownMenuItem disabled>
                                <BookOpen className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateSubjectModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
        facultyId={userRole === 'faculty' ? facultyId : undefined}
      />
      
      {selectedSubject && (
        <>
          <EditSubjectModal 
            open={showEditModal}
            onOpenChange={setShowEditModal}
            subject={selectedSubject}
          />
          
          <EnrollStudentsModal 
            open={showEnrollModal}
            onOpenChange={setShowEnrollModal}
            subject={selectedSubject}
          />
        </>
      )}

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Subject"
        description={`Are you sure you want to delete "${selectedSubject?.name}"? This action cannot be undone and will remove all associated data.`}
        onConfirm={confirmDelete}
      />
    </div>
  )
}