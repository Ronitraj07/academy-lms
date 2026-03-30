'use client';

import Link from 'next/link';
import { useAttendance } from '@/hooks/useAttendance';
import { useTimetable } from '@/hooks/useTimetable';
import { useRemarks } from '@/hooks/useRemarks';
import { useNotifications } from '@/hooks/useNotifications';
import { QuickStats } from '@/components/student/QuickStats';
import { TodayClasses } from '@/components/student/TodayClasses';
import { AttendanceOverview } from '@/components/student/AttendanceOverview';
import { RecentRemarks } from '@/components/student/RecentRemarks';
import { Calendar, ClipboardCheck, BookOpen, MessageSquare } from 'lucide-react';

export default function StudentDashboard() {
  const { stats: attendanceStats, loading: attendanceLoading } = useAttendance();
  const { todaySchedule, getCurrentClass, getNextClass, loading: timetableLoading } = useTimetable();
  const { remarks, loading: remarksLoading } = useRemarks();
  const { unreadCount } = useNotifications();

  const currentClass = getCurrentClass();
  const nextClass = getNextClass();

  const enrolledSubjects = attendanceStats?.subjectWise
    ? Object.keys(attendanceStats.subjectWise).length
    : 0;

  // #15 — hrefs corrected to match actual Next.js route structure under /student/
  const quickActions = [
    {
      label: 'View Timetable',
      description: 'Full schedule',
      href: '/student/timetable',
      icon: Calendar,
      ariaLabel: 'View full timetable'
    },
    {
      label: 'Check Attendance',
      description: 'Detailed view',
      href: '/student/attendance',
      icon: ClipboardCheck,
      ariaLabel: 'Check detailed attendance'
    },
    {
      label: 'View Subjects',
      description: 'Course details',
      href: '/student/subjects',
      icon: BookOpen,
      ariaLabel: 'View all enrolled subjects'
    },
    {
      label: 'All Remarks',
      description: 'Feedback history',
      href: '/student/remarks',
      icon: MessageSquare,
      ariaLabel: 'View all remarks and feedback'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Student Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here&apos;s an overview of your academic progress.
        </p>
      </div>

      {/* Quick Stats */}
      <QuickStats
        enrolledSubjects={enrolledSubjects}
        totalClasses={attendanceStats?.totalClasses || 0}
        attendancePercentage={attendanceStats?.percentage || 0}
        unreadNotifications={unreadCount}
        loading={attendanceLoading}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <TodayClasses
            classes={todaySchedule}
            currentClass={currentClass}
            nextClass={nextClass}
            loading={timetableLoading}
          />

          <AttendanceOverview
            stats={attendanceStats}
            loading={attendanceLoading}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <RecentRemarks
            remarks={remarks}
            loading={remarksLoading}
          />

          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map(({ label, description, href, icon: Icon, ariaLabel }) => (
                <Link
                  key={href}
                  href={href}
                  aria-label={ariaLabel}
                  className="p-3 text-left rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-primary/40 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {label}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {description}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
