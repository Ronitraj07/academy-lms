'use client';

import { BookOpen, Users, Calendar, Bell, TrendingUp, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface QuickStatsProps {
  enrolledSubjects: number;
  totalClasses: number;
  attendancePercentage: number;
  unreadNotifications: number;
  loading: boolean;
}

export function QuickStats({ 
  enrolledSubjects, 
  totalClasses, 
  attendancePercentage, 
  unreadNotifications, 
  loading 
}: QuickStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Enrolled Subjects',
      value: enrolledSubjects,
      icon: BookOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
      description: 'Active subjects'
    },
    {
      title: 'Total Classes',
      value: totalClasses,
      icon: Calendar,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/30',
      description: 'Classes attended'
    },
    {
      title: 'Attendance Rate',
      value: `${attendancePercentage.toFixed(1)}%`,
      icon: TrendingUp,
      color: attendancePercentage >= 90 
        ? 'text-green-500' 
        : attendancePercentage >= 80 
        ? 'text-yellow-500' 
        : 'text-red-500',
      bgColor: attendancePercentage >= 90 
        ? 'bg-green-50 dark:bg-green-900/30' 
        : attendancePercentage >= 80 
        ? 'bg-yellow-50 dark:bg-yellow-900/30' 
        : 'bg-red-50 dark:bg-red-900/30',
      description: 'Overall performance'
    },
    {
      title: 'Notifications',
      value: unreadNotifications,
      icon: Bell,
      color: unreadNotifications > 0 ? 'text-orange-500' : 'text-gray-500',
      bgColor: unreadNotifications > 0 
        ? 'bg-orange-50 dark:bg-orange-900/30' 
        : 'bg-gray-50 dark:bg-gray-900/30',
      description: 'Unread messages'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.description}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <IconComponent className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>

            {/* Progress indicator for attendance */}
            {stat.title === 'Attendance Rate' && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      attendancePercentage >= 90 
                        ? 'bg-green-500' 
                        : attendancePercentage >= 80 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(attendancePercentage, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Notification indicator */}
            {stat.title === 'Notifications' && unreadNotifications > 0 && (
              <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                • You have new messages
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}