'use client';

import { useState } from 'react';
import { Users, UserPlus, UserMinus, Search, Mail, Phone, GraduationCap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
  onEnrollStudent: (studentId: string) => Promise<boolean>;
  onUnenrollStudent: (studentId: string) => Promise<boolean>;
  onClose?: () => void;
}

export function StudentManagement({
  subjectId,
  subjectName,
  students,
  allStudents,
  loading,
  onEnrollStudent,
  onUnenrollStudent,
  onClose
}: StudentManagementProps) {
  const [activeTab, setActiveTab] = useState<'enrolled' | 'available'>('enrolled');
  const [searchQuery, setSearchQuery] = useState('');
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [unenrolling, setUnenrolling] = useState<string | null>(null);

  const handleEnroll = async (studentId: string) => {
    setEnrolling(studentId);
    const success = await onEnrollStudent(studentId);
    setEnrolling(null);
    
    if (success) {
      // Success feedback could be added here
    }
  };

  const handleUnenroll = async (studentId: string) => {
    setUnenrolling(studentId);
    const success = await onUnenrollStudent(studentId);
    setUnenrolling(null);
    
    if (success) {
      // Success feedback could be added here
    }
  };

  // Get available students (not enrolled in this subject)
  const enrolledStudentIds = new Set(students.map(s => s.id));
  const availableStudents = allStudents.filter(s => !enrolledStudentIds.has(s.id));

  // Filter students based on search
  const getFilteredStudents = (studentList: Student[]) => {
    return studentList.filter(student =>
      student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredEnrolledStudents = getFilteredStudents(students);
  const filteredAvailableStudents = getFilteredStudents(availableStudents);

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
    if (percentage >= 80) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
    if (percentage >= 70) return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30';
    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
  };

  const StudentCard = ({ 
    student, 
    isEnrolled, 
    actionLoading 
  }: { 
    student: Student; 
    isEnrolled: boolean; 
    actionLoading: boolean;
  }) => (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                {student.full_name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ID: {student.student_id}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Mail className="w-4 h-4" />
              <span>{student.email}</span>
            </div>
            
            {student.phone && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4" />
                <span>{student.phone}</span>
              </div>
            )}

            {isEnrolled && (
              <div className="flex items-center space-x-4 mt-3">
                <Badge className={getAttendanceColor(student.attendance_percentage)}>
                  {student.attendance_percentage.toFixed(1)}% Attendance
                </Badge>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {student.attended_classes}/{student.total_classes} classes
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="ml-4">
          {isEnrolled ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUnenroll(student.id)}
              disabled={actionLoading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {actionLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              ) : (
                <>
                  <UserMinus className="w-4 h-4 mr-1" />
                  Remove
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEnroll(student.id)}
              disabled={actionLoading}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              {actionLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-1" />
                  Enroll
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
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
            <Users className="w-5 h-5 text-blue-500" />
            <span>Manage Students</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{subjectName}</p>
        </div>
        {onClose && (
          <Button variant="ghost" onClick={onClose}>
            ×
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab('enrolled')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'enrolled'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Enrolled Students ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('available')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'available'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Available Students ({availableStudents.length})
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search students by name, ID, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activeTab === 'enrolled' ? (
          filteredEnrolledStudents.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {searchQuery ? 'No students found' : 'No students enrolled'}
              </h3>
              <p className="text-sm">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Start by enrolling students from the Available Students tab'
                }
              </p>
            </div>
          ) : (
            filteredEnrolledStudents.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                isEnrolled={true}
                actionLoading={unenrolling === student.id}
              />
            ))
          )
        ) : (
          filteredAvailableStudents.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <UserPlus className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {searchQuery ? 'No students found' : 'No available students'}
              </h3>
              <p className="text-sm">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'All active students are already enrolled in this subject'
                }
              </p>
            </div>
          ) : (
            filteredAvailableStudents.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                isEnrolled={false}
                actionLoading={enrolling === student.id}
              />
            ))
          )
        )}
      </div>
    </Card>
  );
}