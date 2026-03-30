'use client';

import { useState, useEffect } from 'react';
import { Check, X, UserCheck, UserX, Calendar, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAttendanceMarking } from '@/hooks/useAttendanceMarking';
import { useFacultyStudents } from '@/hooks/useFacultyStudents';
import { cn } from '@/lib/utils';

interface AttendanceMarkingProps {
  subjectId: string;
  subjectName: string;
  onClose?: () => void;
}

export function AttendanceMarking({ subjectId, subjectName, onClose }: AttendanceMarkingProps) {
  const { students, loading: studentsLoading } = useFacultyStudents(subjectId);
  const { markAttendance, loading: markingLoading } = useAttendanceMarking();

  const [classDate,      setClassDate]      = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({});
  const [searchQuery,    setSearchQuery]    = useState('');
  const [filterStatus,   setFilterStatus]   = useState<'all' | 'present' | 'absent'>('all');

  useEffect(() => {
    if (students.length > 0 && Object.keys(attendanceData).length === 0) {
      const initial: Record<string, boolean> = {};
      students.forEach(s => { initial[s.id] = true; });
      setAttendanceData(initial);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students]);

  const toggleAttendance = (id: string) =>
    setAttendanceData(prev => ({ ...prev, [id]: !prev[id] }));

  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'present' && attendanceData[s.id]) ||
      (filterStatus === 'absent'  && !attendanceData[s.id]);
    return matchesSearch && matchesFilter;
  });

  const setAll = (value: boolean) => {
    const patch: Record<string, boolean> = {};
    filteredStudents.forEach(s => { patch[s.id] = value; });
    setAttendanceData(prev => ({ ...prev, ...patch }));
  };

  const handleSubmit = async () => {
    const entries = students.map(s => ({
      studentId:   s.id,
      studentName: s.full_name,
      isPresent:   attendanceData[s.id] ?? true,
    }));
    const ok = await markAttendance({ subjectId, classDate, entries });
    if (ok && onClose) onClose();
  };

  const presentCount = Object.values(attendanceData).filter(Boolean).length;
  const absentCount  = students.length - presentCount;

  if (studentsLoading) {
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
            <UserCheck className="w-5 h-5 text-green-500" />
            Mark Attendance
          </h2>
          <p className="text-muted-foreground mt-1">
            {subjectName} &mdash; {new Date(classDate).toLocaleDateString()}
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Date + Search + Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="space-y-1.5">
          <label htmlFor="classDate" className="text-sm font-medium">Class Date</label>
          <Input
            id="classDate"
            type="date"
            value={classDate}
            onChange={e => setClassDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="att-search" className="text-sm font-medium">Search Students</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
            <Input
              id="att-search"
              type="text"
              placeholder="Search by name or ID"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="att-filter" className="text-sm font-medium">Filter Status</label>
          <select
            id="att-filter"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as 'all' | 'present' | 'absent')}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Students</option>
            <option value="present">Present Only</option>
            <option value="absent">Absent Only</option>
          </select>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-muted rounded-lg">
        <p className="text-sm">
          <span className="font-semibold text-green-600 dark:text-green-400">{presentCount} Present</span>
          <span className="text-muted-foreground mx-2">&bull;</span>
          <span className="font-semibold text-red-600 dark:text-red-400">{absentCount} Absent</span>
        </p>
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={() => setAll(true)}>
            <UserCheck className="w-4 h-4 mr-1" />Mark All Present
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAll(false)}>
            <UserX className="w-4 h-4 mr-1" />Mark All Absent
          </Button>
        </div>
      </div>

      {/* Student List */}
      <div className="space-y-2 mb-6 max-h-96 overflow-y-auto scrollbar-modern">
        {filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-muted-foreground">
            <UserCheck className="w-12 h-12 mb-4 opacity-40" />
            <p>No students found matching your criteria</p>
          </div>
        ) : (
          filteredStudents.map(student => {
            const isPresent = attendanceData[student.id] ?? true;
            return (
              <div
                key={student.id}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && toggleAttendance(student.id)}
                onClick={() => toggleAttendance(student.id)}
                className={cn(
                  'flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md',
                  isPresent
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50  dark:bg-red-900/20  border-red-200  dark:border-red-800',
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center',
                    isPresent ? 'bg-green-500' : 'bg-red-500',
                  )}>
                    {isPresent
                      ? <Check className="w-4 h-4 text-white" />
                      : <X     className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{student.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      ID: {student.student_id} &bull; {student.email}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={cn(
                    'text-sm font-medium',
                    isPresent ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
                  )}>
                    {isPresent ? 'Present' : 'Absent'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {student.attendance_percentage.toFixed(1)}% overall
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3">
        {onClose && <Button variant="outline" onClick={onClose}>Cancel</Button>}
        <Button
          onClick={handleSubmit}
          disabled={markingLoading || students.length === 0}
          className="gap-2"
        >
          {markingLoading
            ? <><div className="loading-spinner w-4 h-4" />Saving&hellip;</>
            : <><Calendar className="w-4 h-4" />Save Attendance</>}
        </Button>
      </div>
    </Card>
  );
}
