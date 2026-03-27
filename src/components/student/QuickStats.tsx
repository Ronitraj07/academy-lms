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
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-cyan-500',
      description: 'Active subjects'
    },
    {
      title: 'Total Classes',
      value: totalClasses,
      icon: Calendar,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/30',
      gradientFrom: 'from-green-500',
      gradientTo: 'to-emerald-500',
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
      gradientFrom: attendancePercentage >= 90
        ? 'from-green-500'
        : attendancePercentage >= 80
        ? 'from-yellow-500'
        : 'from-red-500',
      gradientTo: attendancePercentage >= 90
        ? 'to-teal-500'
        : attendancePercentage >= 80
        ? 'to-orange-500'
        : 'to-pink-500',
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
      gradientFrom: unreadNotifications > 0 ? 'from-orange-500' : 'from-gray-500',
      gradientTo: unreadNotifications > 0 ? 'to-red-500' : 'to-gray-600',
      description: 'Unread messages'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card
            key={index}
            className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group fade-in border-0 shadow-lg"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Gradient background overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradientFrom} ${stat.gradientTo} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

            {/* Animated border gradient */}
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                 style={{
                   background: `linear-gradient(135deg, ${stat.color.replace('text-', 'rgb(var(--')}) 0%, transparent 100%)`,
                   padding: '2px',
                   WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                   WebkitMaskComposite: 'xor',
                   maskComposite: 'exclude'
                 }}>
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-transform duration-300 group-hover:scale-110">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.description}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor} transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-md`}>
                <IconComponent className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>

            {/* Progress indicator for attendance */}
            {stat.title === 'Attendance Rate' && (
              <div className="mt-4 relative z-10">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 bg-gradient-to-r ${stat.gradientFrom} ${stat.gradientTo}`}
                    style={{ width: `${Math.min(attendancePercentage, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Notification indicator */}
            {stat.title === 'Notifications' && unreadNotifications > 0 && (
              <div className="mt-3 flex items-center space-x-2 relative z-10">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                  You have new messages
                </span>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}