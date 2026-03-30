'use client';

import { useState } from 'react';
import { Users, UserPlus, UserMinus, Search, Mail, Phone, GraduationCap, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Student {
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

interface StudentManagementProps {
  subjectId: string;
  subjectName: string;
  students: Student[];
  allStudents: Student[];
  loading: boolean;
  onEnrollStudent:   (studentId: string) => Promise<boolean>;
  onUnenrollStudent: (studentId: string) => Promise<boolean>;
  onClose?: () => void;
}

function getAttendanceColor(pct: number) {
  if (pct >= 90) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
  if (pct >= 80) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
  if (pct >= 70) return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30';
  return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
}

function StudentCard({
  student,
  isEnrolled,
  actionLoading,
  onAction,
}: {
  student: Student;
  isEnrolled: boolean;
  actionLoading: boolean;
  onAction: (id: string) => void;
}) {
  return (
    <div className="p-4 border border-border rounded-lg hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">{student.full_name}</h4>
              <p className="text-sm text-muted-foreground">ID: {student.student_id}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4 shrink-0" />
              <span className="truncate">{student.email}</span>
            </div>
            {student.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0" />
                <span>{student.phone}</span>
              </div>
            )}
            {isEnrolled && (
              <div className="flex items-center gap-3 mt-2">
                <Badge className={getAttendanceColor(student.attendance_percentage)}>
                  {student.attendance_percentage.toFixed(1)}% Attendance
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {student.attended_classes}/{student.total_classes} classes
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="ml-4 shrink-0">
          {isEnrolled ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction(student.id)}
              disabled={actionLoading}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
            >
              {actionLoading
                ? <div className="loading-spinner w-4 h-4" />
                : <><UserMinus className="w-4 h-4" />Remove</>}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction(student.id)}
              disabled={actionLoading}
              className="text-green-600 hover:text-green-700 hover:bg-green-500/10 gap-1"
            >
              {actionLoading
                ? <div className="loading-spinner w-4 h-4" />
                : <><UserPlus className="w-4 h-4" />Enroll</>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function StudentManagement({
  subjectId: _subjectId,
  subjectName,
  students,
  allStudents,
  loading,
  onEnrollStudent,
  onUnenrollStudent,
  onClose,
}: StudentManagementProps) {
  const [activeTab,   setActiveTab]   = useState<'enrolled' | 'available'>('enrolled');
  const [searchQuery, setSearchQuery] = useState('');
  const [enrolling,   setEnrolling]   = useState<string | null>(null);
  const [unenrolling, setUnenrolling] = useState<string | null>(null);

  const handleEnroll = async (id: string) => {
    setEnrolling(id);
    await onEnrollStudent(id);
    setEnrolling(null);
  };

  const handleUnenroll = async (id: string) => {
    setUnenrolling(id);
    await onUnenrollStudent(id);
    setUnenrolling(null);
  };

  const enrolledIds       = new Set(students.map(s => s.id));
  const availableStudents = allStudents.filter(s => !enrolledIds.has(s.id));

  const filterStudents = (list: Student[]) =>
    list.filter(s =>
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  const filteredEnrolled  = filterStudents(students);
  const filteredAvailable = filterStudents(availableStudents);
  const displayList       = activeTab === 'enrolled' ? filteredEnrolled : filteredAvailable;

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Manage Students
          </h2>
          <p className="text-muted-foreground mt-1">{subjectName}</p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-muted rounded-lg p-1 mb-6">
        {(['enrolled', 'available'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors',
              activeTab === tab
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab === 'enrolled'
              ? `Enrolled Students (${students.length})`
              : `Available Students (${availableStudents.length})`}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search students by name, ID, or email…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-modern">
        {displayList.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-muted-foreground">
            {activeTab === 'enrolled'
              ? <Users    className="w-16 h-16 mb-4 opacity-40" />
              : <UserPlus className="w-16 h-16 mb-4 opacity-40" />}
            <h3 className="text-lg font-medium text-foreground mb-1">
              {searchQuery
                ? 'No students found'
                : activeTab === 'enrolled' ? 'No students enrolled' : 'No available students'}
            </h3>
            <p className="text-sm text-center max-w-xs">
              {searchQuery
                ? 'Try adjusting your search terms'
                : activeTab === 'enrolled'
                  ? 'Start by enrolling students from the Available Students tab'
                  : 'All active students are already enrolled in this subject'}
            </p>
          </div>
        ) : (
          displayList.map(student => (
            <StudentCard
              key={student.id}
              student={student}
              isEnrolled={activeTab === 'enrolled'}
              actionLoading={
                activeTab === 'enrolled'
                  ? unenrolling === student.id
                  : enrolling   === student.id
              }
              onAction={activeTab === 'enrolled' ? handleUnenroll : handleEnroll}
            />
          ))
        )}
      </div>
    </Card>
  );
}
