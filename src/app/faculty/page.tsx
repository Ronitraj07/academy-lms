'use client';

import { useState } from 'react';
import { Calendar, BookOpen, Users, TrendingUp, Clock, Plus, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

// #16 — Form state for the create-subject modal
interface CreateSubjectForm {
  name: string;
  code: string;
  description: string;
  credits: number;
  semester: string;
}

function QuickStats({ subjectsCount, totalStudents, averageAttendance, totalClasses }: {
  subjectsCount: number; totalStudents: number; averageAttendance: number; totalClasses: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="p-6">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" /></div>
          <div className="ml-4"><h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{subjectsCount}</h3><p className="text-gray-600 dark:text-gray-400">Subjects</p></div>
        </div>
      </Card>
      <Card className="p-6">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg"><Users className="w-6 h-6 text-green-600 dark:text-green-400" /></div>
          <div className="ml-4"><h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalStudents}</h3><p className="text-gray-600 dark:text-gray-400">Students</p></div>
        </div>
      </Card>
      <Card className="p-6">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"><TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" /></div>
          <div className="ml-4"><h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{averageAttendance.toFixed(1)}%</h3><p className="text-gray-600 dark:text-gray-400">Avg Attendance</p></div>
        </div>
      </Card>
      <Card className="p-6">
        <div className="flex items-center">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg"><Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" /></div>
          <div className="ml-4"><h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalClasses}</h3><p className="text-gray-600 dark:text-gray-400">Total Classes</p></div>
        </div>
      </Card>
    </div>
  );
}

type ViewType = 'overview' | 'attendance' | 'students' | 'notifications';

function ViewToggle({ activeView, onViewChange }: { activeView: ViewType; onViewChange: (view: ViewType) => void }) {
  const views = [
    { id: 'overview' as const, label: 'Overview', icon: BookOpen },
    { id: 'attendance' as const, label: 'Attendance', icon: Calendar },
    { id: 'students' as const, label: 'Students', icon: Users },
    { id: 'notifications' as const, label: 'Notifications', icon: TrendingUp },
  ];
  return (
    <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
      {views.map(({ id, label, icon: Icon }) => (
        <button key={id} onClick={() => onViewChange(id)} aria-label={`Switch to ${label} view`} aria-pressed={activeView === id}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeView === id ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}>
          <Icon className="w-4 h-4" /><span>{label}</span>
        </button>
      ))}
    </div>
  );
}

export default function FacultyPage() {
  const { subjects, loading: subjectsLoading, createSubject } = useFacultySubjects();
  const { students: allStudents, enrollStudent, unenrollStudent } = useAllStudents();

  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // #16 — modal state instead of hardcoded dummy data
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreateSubjectForm>({
    name: '', code: '', description: '', credits: 3, semester: ''
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const totalStudents = subjects.reduce((acc, subject) => acc + subject.enrollment_count, 0);
  const averageAttendance = subjects.length > 0
    ? subjects.reduce((acc, subject) => acc + subject.average_attendance, 0) / subjects.length
    : 0;
  const totalClasses = subjects.reduce((acc, subject) => acc + subject.recent_classes, 0);

  const handleViewSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setActiveView('attendance');
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.code.trim() || !createForm.semester.trim()) {
      setCreateError('Name, code, and semester are required.');
      return;
    }
    setCreating(true);
    setCreateError(null);
    const success = await createSubject({
      name: createForm.name.trim(),
      code: createForm.code.trim(),
      description: createForm.description.trim() || null,
      credits: createForm.credits,
      semester: createForm.semester.trim(),
    });
    setCreating(false);
    if (success) {
      setShowCreateModal(false);
      setCreateForm({ name: '', code: '', description: '', credits: 3, semester: '' });
    } else {
      setCreateError('Failed to create subject. Please try again.');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Faculty Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your subjects, students, and attendance</p>
        </div>
        {activeView === 'overview' && (
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" /><span>Create Subject</span>
          </Button>
        )}
      </div>

      {/* #16 — Create Subject Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Create New Subject</h2>
              <button onClick={() => setShowCreateModal(false)} aria-label="Close modal"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject Name *</label>
                <Input value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Introduction to Computer Science" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject Code *</label>
                <Input value={createForm.code} onChange={e => setCreateForm(f => ({ ...f, code: e.target.value }))} placeholder="e.g. CS101" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester *</label>
                <Input value={createForm.semester} onChange={e => setCreateForm(f => ({ ...f, semester: e.target.value }))} placeholder="e.g. Fall 2026" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Credits</label>
                <Input type="number" min={1} max={10} value={createForm.credits} onChange={e => setCreateForm(f => ({ ...f, credits: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <Input value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
              </div>
              {createError && <p className="text-sm text-red-500">{createError}</p>}
              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create Subject'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <QuickStats subjectsCount={subjects.length} totalStudents={totalStudents} averageAttendance={averageAttendance} totalClasses={totalClasses} />
      <ViewToggle activeView={activeView} onViewChange={setActiveView} />

      {activeView === 'overview' && (
        <SubjectOverview subjects={subjects} loading={subjectsLoading} onCreateSubject={() => setShowCreateModal(true)} onViewSubject={handleViewSubject} />
      )}

      {activeView === 'attendance' && (
        selectedSubject ? (
          <AttendanceMarking subjectId={selectedSubject.id} subjectName={selectedSubject.name} onClose={() => { setSelectedSubject(null); setActiveView('overview'); }} />
        ) : (
          <Card className="p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Select a Subject</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Choose a subject from the overview to mark attendance</p>
            <Button onClick={() => setActiveView('overview')}>Go to Overview</Button>
          </Card>
        )
      )}

      {activeView === 'students' && (
        selectedSubject ? (
          <StudentManagement
            subjectId={selectedSubject.id}
            subjectName={selectedSubject.name}
            students={[]}
            allStudents={allStudents}
            loading={false}
            onEnrollStudent={(studentId) => enrollStudent(selectedSubject.id, studentId)}
            onUnenrollStudent={(studentId) => unenrollStudent(selectedSubject.id, studentId)}
            onClose={() => { setSelectedSubject(null); setActiveView('overview'); }}
          />
        ) : (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Select a Subject</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Choose a subject from the overview to manage students</p>
            <Button onClick={() => setActiveView('overview')}>Go to Overview</Button>
          </Card>
        )
      )}

      {activeView === 'notifications' && <NotificationCenter />}

      {selectedSubject && (
        <Card className="p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">{selectedSubject.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{selectedSubject.code} • {selectedSubject.enrollment_count} students</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setActiveView('attendance')} className={activeView === 'attendance' ? 'bg-blue-50 border-blue-200' : ''}>
                <Calendar className="w-4 h-4 mr-1" />Attendance
              </Button>
              <Button variant="outline" size="sm" onClick={() => setActiveView('students')} className={activeView === 'students' ? 'bg-blue-50 border-blue-200' : ''}>
                <Users className="w-4 h-4 mr-1" />Students
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
