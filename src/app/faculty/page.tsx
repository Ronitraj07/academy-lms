'use client';

import { useState } from 'react';
import { Calendar, BookOpen, Users, TrendingUp, Clock, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFacultySubjects } from '@/hooks/useFacultySubjects';
import { useAllStudents } from '@/hooks/useAllStudents';
import { SubjectOverview } from '@/components/faculty/SubjectOverview';
import { AttendanceMarking } from '@/components/faculty/AttendanceMarking';
import { StudentManagement } from '@/components/faculty/StudentManagement';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

interface Subject {
  id: string;
  name: string;
  code: string;
  description: string | null;
  credits: number;
  semester: string;
  enrollment_count: number;
  recent_classes: number;
  average_attendance: number;
}

export default function FacultyPage() {
  const { subjects, loading: subjectsLoading, createSubject } = useFacultySubjects();
  const { students: allStudents, enrollStudent, unenrollStudent } = useAllStudents();
  
  const [activeView, setActiveView] = useState<'overview' | 'attendance' | 'students' | 'notifications'>('overview');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // Calculate quick stats
  const totalStudents = subjects.reduce((acc, subject) => acc + subject.enrollment_count, 0);
  const averageAttendance = subjects.length > 0 
    ? subjects.reduce((acc, subject) => acc + subject.average_attendance, 0) / subjects.length
    : 0;
  const totalClasses = subjects.reduce((acc, subject) => acc + subject.recent_classes, 0);

  const QuickStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="p-6">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="ml-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {subjects.length}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Subjects</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="ml-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {totalStudents}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Students</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="ml-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {averageAttendance.toFixed(1)}%
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Avg Attendance</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="ml-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {totalClasses}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Total Classes</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const ViewToggle = () => (
    <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
      {[
        { id: 'overview', label: 'Overview', icon: BookOpen },
        { id: 'attendance', label: 'Attendance', icon: Calendar },
        { id: 'students', label: 'Students', icon: Users },
        { id: 'notifications', label: 'Notifications', icon: TrendingUp },
      ].map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setActiveView(id as any)}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeView === id
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          <Icon className="w-4 h-4" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );

  const handleViewSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setActiveView('attendance');
  };

  const handleCreateSubject = async () => {
    // This would typically open a modal or form
    // For now, we'll create a sample subject
    const success = await createSubject({
      name: 'New Subject',
      code: 'NS101',
      description: 'A new subject to get started',
      credits: 3,
      semester: 'Fall 2024'
    });
    
    if (success) {
      // Subject created successfully
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Faculty Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your subjects, students, and attendance
          </p>
        </div>

        {activeView === 'overview' && (
          <Button onClick={handleCreateSubject} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Create Subject</span>
          </Button>
        )}
      </div>

      <QuickStats />
      <ViewToggle />

      {/* Main Content */}
      {activeView === 'overview' && (
        <SubjectOverview
          subjects={subjects}
          loading={subjectsLoading}
          onCreateSubject={handleCreateSubject}
          onViewSubject={handleViewSubject}
        />
      )}

      {activeView === 'attendance' && (
        selectedSubject ? (
          <AttendanceMarking
            subjectId={selectedSubject.id}
            subjectName={selectedSubject.name}
            onClose={() => {
              setSelectedSubject(null);
              setActiveView('overview');
            }}
          />
        ) : (
          <Card className="p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Select a Subject
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Choose a subject from the overview to mark attendance
            </p>
            <Button onClick={() => setActiveView('overview')}>
              Go to Overview
            </Button>
          </Card>
        )
      )}

      {activeView === 'students' && (
        selectedSubject ? (
          <StudentManagement
            subjectId={selectedSubject.id}
            subjectName={selectedSubject.name}
            students={[]} // This would come from useFacultyStudents hook
            allStudents={allStudents}
            loading={false}
            onEnrollStudent={(studentId) => enrollStudent(selectedSubject.id, studentId)}
            onUnenrollStudent={(studentId) => unenrollStudent(selectedSubject.id, studentId)}
            onClose={() => {
              setSelectedSubject(null);
              setActiveView('overview');
            }}
          />
        ) : (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Select a Subject
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Choose a subject from the overview to manage students
            </p>
            <Button onClick={() => setActiveView('overview')}>
              Go to Overview
            </Button>
          </Card>
        )
      )}

      {activeView === 'notifications' && (
        <NotificationCenter />
      )}

      {/* Quick Actions for Selected Subject */}
      {selectedSubject && (
        <Card className="p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                {selectedSubject.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedSubject.code} • {selectedSubject.enrollment_count} students
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveView('attendance')}
                className={activeView === 'attendance' ? 'bg-blue-50 border-blue-200' : ''}
              >
                <Calendar className="w-4 h-4 mr-1" />
                Attendance
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveView('students')}
                className={activeView === 'students' ? 'bg-blue-50 border-blue-200' : ''}
              >
                <Users className="w-4 h-4 mr-1" />
                Students
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}