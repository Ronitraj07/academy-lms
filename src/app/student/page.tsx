'use client';

import Link from 'next/link';
import { Calendar, TrendingUp, BookOpen, MessageSquare } from 'lucide-react';
import { useAttendance } from '@/hooks/useAttendance';
import { useTimetable } from '@/hooks/useTimetable';
import { useRemarks } from '@/hooks/useRemarks';
import { useNotifications } from '@/hooks/useNotifications';
import { QuickStats } from '@/components/student/QuickStats';
import { TodayClasses } from '@/components/student/TodayClasses';
import { AttendanceOverview } from '@/components/student/AttendanceOverview';
import { RecentRemarks } from '@/components/student/RecentRemarks';

const quickActions = [
  {
    label: 'View Timetable',
    description: 'Full schedule',
    href: '/timetable',
    icon: Calendar,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    label: 'Check Attendance',
    description: 'Detailed view',
    href: '/attendance',
    icon: TrendingUp,
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
  {
    label: 'View Subjects',
    description: 'Course details',
    href: '/subjects',
    icon: BookOpen,
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    label: 'All Remarks',
    description: 'Feedback history',
    href: '/remarks',
    icon: MessageSquare,
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
  },
];

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
              {quickActions.map(({ label, description, href, icon: Icon, color, bg }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="p-3 text-left rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 group block"
                >
                  <div className={`inline-flex p-2 rounded-lg ${bg} mb-2 transition-transform duration-200 group-hover:scale-110`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
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
