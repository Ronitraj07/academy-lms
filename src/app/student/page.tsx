'use client';

import { useAttendance } from '@/hooks/useAttendance';
import { useTimetable } from '@/hooks/useTimetable';
import { useRemarks } from '@/hooks/useRemarks';
import { useNotifications } from '@/hooks/useNotifications';
import { QuickStats } from '@/components/student/QuickStats';
import { TodayClasses } from '@/components/student/TodayClasses';
import { AttendanceOverview } from '@/components/student/AttendanceOverview';
import { RecentRemarks } from '@/components/student/RecentRemarks';

export default function StudentDashboard() {
  // Fetch all student data
  const { stats: attendanceStats, loading: attendanceLoading } = useAttendance();
  const { todaySchedule, getCurrentClass, getNextClass, loading: timetableLoading } = useTimetable();
  const { remarks, loading: remarksLoading } = useRemarks();
  const { unreadCount } = useNotifications();

  const currentClass = getCurrentClass();
  const nextClass = getNextClass();

  // Calculate enrollment count (assuming it's the number of subjects in stats)
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
              <button className="p-3 text-left rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  View Timetable
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Full schedule
                </div>
              </button>
              
              <button className="p-3 text-left rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Check Attendance
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Detailed view
                </div>
              </button>
              
              <button className="p-3 text-left rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  View Subjects
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Course details
                </div>
              </button>
              
              <button className="p-3 text-left rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  All Remarks
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Feedback history
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}