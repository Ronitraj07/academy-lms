'use client';

import { BookOpen, Users, TrendingUp, Calendar, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

interface SubjectOverviewProps {
  subjects: Subject[];
  loading: boolean;
  onCreateSubject?: () => void;
  onViewSubject?: (subject: Subject) => void;
}

export function SubjectOverview({ subjects, loading, onCreateSubject, onViewSubject }: SubjectOverviewProps) {
  const getAttendanceColor = (pct: number) => {
    if (pct >= 90) return 'text-green-600 dark:text-green-400';
    if (pct >= 80) return 'text-yellow-600 dark:text-yellow-400';
    if (pct >= 70) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getAttendanceBgColor = (pct: number) => {
    if (pct >= 90) return 'bg-green-50  dark:bg-green-900/30  border-green-200  dark:border-green-800';
    if (pct >= 80) return 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800';
    if (pct >= 70) return 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800';
    return             'bg-red-50    dark:bg-red-900/30    border-red-200    dark:border-red-800';
  };

  const getProgressColor = (pct: number) => {
    if (pct >= 90) return 'bg-green-500';
    if (pct >= 80) return 'bg-yellow-500';
    if (pct >= 70) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <BookOpen className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold">My Subjects</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold">My Subjects</h2>
        </div>
        {onCreateSubject && (
          <Button onClick={onCreateSubject} className="gap-2">
            <Plus className="w-4 h-4" />Create Subject
          </Button>
        )}
      </div>

      {subjects.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground mb-2">No subjects assigned</h3>
          <p className="text-sm mb-4">
            You haven&apos;t been assigned any subjects yet, or you can create a new one.
          </p>
          {onCreateSubject && (
            <Button variant="outline" onClick={onCreateSubject}>
              <Plus className="w-4 h-4 mr-2" />Create Your First Subject
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subject => (
            <div
              key={subject.id}
              className={cn(
                'p-6 rounded-lg border cursor-pointer transition-all hover:shadow-lg',
                getAttendanceBgColor(subject.average_attendance),
              )}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onViewSubject?.(subject)}
              onClick={() => onViewSubject?.(subject)}
            >
              {/* Subject header */}
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg text-foreground line-clamp-1">
                    {subject.name}
                  </h3>
                  <span className="text-xs font-medium px-2 py-1 bg-white/70 dark:bg-black/20 rounded">
                    {subject.code}
                  </span>
                </div>
                {subject.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{subject.description}</p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded">
                  <Users className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                  <p className="text-lg font-bold text-foreground">{subject.enrollment_count}</p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
                <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded">
                  <Calendar className="w-4 h-4 mx-auto mb-1 text-purple-500" />
                  <p className="text-lg font-bold text-foreground">{subject.recent_classes}</p>
                  <p className="text-xs text-muted-foreground">Classes</p>
                </div>
              </div>

              {/* Attendance bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground/80">Avg. Attendance</span>
                  <span className={cn('text-sm font-bold', getAttendanceColor(subject.average_attendance))}>
                    {subject.average_attendance.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2">
                  <div
                    className={cn('h-2 rounded-full transition-all duration-500', getProgressColor(subject.average_attendance))}
                    style={{ width: `${Math.min(subject.average_attendance, 100)}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{subject.credits} Credits</span>
                </div>
                <span className="font-medium">{subject.semester}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
