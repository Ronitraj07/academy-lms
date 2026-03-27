'use client';

import { useState, useEffect } from 'react';
import { Check, X, UserCheck, UserX, Calendar, Search, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAttendanceMarking } from '@/hooks/useAttendanceMarking';
import { useFacultyStudents } from '@/hooks/useFacultyStudents';

interface AttendanceMarkingProps {
  subjectId: string;
  subjectName: string;
  onClose?: () => void;
}

export function AttendanceMarking({ subjectId, subjectName, onClose }: AttendanceMarkingProps) {
  const { students, loading: studentsLoading } = useFacultyStudents(subjectId);
  const { markAttendance, bulkMarkAttendance, loading: markingLoading } = useAttendanceMarking();
  
  const [classDate, setClassDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'present' | 'absent'>('all');

  // Initialize attendance data when students load
  useEffect(() => {
    if (students.length > 0 && Object.keys(attendanceData).length === 0) {
      const initialData: Record<string, boolean> = {};
      students.forEach(student => {
        initialData[student.id] = true; // Default to present
      });
      setAttendanceData(initialData);
    }
  }, [students]);

  const toggleAttendance = (studentId: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const markAllPresent = () => {
    const newData: Record<string, boolean> = {};
    filteredStudents.forEach(student => {
      newData[student.id] = true;
    });
    setAttendanceData(prev => ({ ...prev, ...newData }));
  };

  const markAllAbsent = () => {
    const newData: Record<string, boolean> = {};
    filteredStudents.forEach(student => {
      newData[student.id] = false;
    });
    setAttendanceData(prev => ({ ...prev, ...newData }));
  };

  const handleSubmit = async () => {
    const entries = students.map(student => ({
      studentId: student.id,
      studentName: student.full_name,
      isPresent: attendanceData[student.id] ?? true
    }));

    const success = await markAttendance({
      subjectId,
      classDate,
      entries
    });

    if (success && onClose) {
      onClose();
    }
  };

  // Filter students based on search and filter
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.student_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'present' && attendanceData[student.id]) ||
                         (filterStatus === 'absent' && !attendanceData[student.id]);
    
    return matchesSearch && matchesFilter;
  });

  const presentCount = Object.values(attendanceData).filter(Boolean).length;
  const absentCount = students.length - presentCount;

  if (studentsLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-green-500" />
            <span>Mark Attendance</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {subjectName} - {new Date(classDate).toLocaleDateString()}
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Date and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div>
          <label htmlFor="classDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Class Date
          </label>
          <Input
            id="classDate"
            type="date"
            value={classDate}
            onChange={(e) => setClassDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search Students
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="search"
              type="text"
              placeholder="Search by name or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <label htmlFor="filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter Status
          </label>
          <select
            id="filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Students</option>
            <option value="present">Present Only</option>
            <option value="absent">Absent Only</option>
          </select>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <span className="font-medium text-green-600 dark:text-green-400">{presentCount} Present</span>
            <span className="text-gray-500 mx-2">•</span>
            <span className="font-medium text-red-600 dark:text-red-400">{absentCount} Absent</span>
          </div>
        </div>

        <div className="flex space-x-2 ml-auto">
          <Button variant="outline" size="sm" onClick={markAllPresent}>
            <UserCheck className="w-4 h-4 mr-1" />
            Mark All Present
          </Button>
          <Button variant="outline" size="sm" onClick={markAllAbsent}>
            <UserX className="w-4 h-4 mr-1" />
            Mark All Absent
          </Button>
        </div>
      </div>

      {/* Student List */}
      <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No students found matching your criteria</p>
          </div>
        ) : (
          filteredStudents.map((student) => {
            const isPresent = attendanceData[student.id] ?? true;
            
            return (
              <div
                key={student.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                  isPresent 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
                onClick={() => toggleAttendance(student.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isPresent ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {isPresent ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <X className="w-4 h-4 text-white" />
                    )}
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {student.full_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ID: {student.student_id} • {student.email}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    isPresent ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {isPresent ? 'Present' : 'Absent'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {student.attendance_percentage.toFixed(1)}% overall
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={markingLoading || students.length === 0}
          className="flex items-center space-x-2"
        >
          {markingLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4" />
              <span>Save Attendance</span>
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}