'use client';

import { TrendingUp, BookOpen, Calendar, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AttendanceStats {
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  subjectWise: {
    [subjectId: string]: {
      subject: string;
      total: number;
      attended: number;
      percentage: number;
    };
  };
}

interface AttendanceOverviewProps {
  stats: AttendanceStats | null;
  loading: boolean;
}

export function AttendanceOverview({ stats, loading }: AttendanceOverviewProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <h2 className="text-xl font-semibold">Attendance Overview</h2>
        </div>
        <div className="space-y-4 animate-pulse">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <h2 className="text-xl font-semibold">Attendance Overview</h2>
        </div>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No attendance data available</p>
          <p className="text-sm mt-1">Attendance will appear once classes begin</p>
        </div>
      </Card>
    );
  }

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 dark:text-green-400';
    if (percentage >= 80) return 'text-yellow-600 dark:text-yellow-400';
    if (percentage >= 70) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 80) return 'bg-yellow-500';
    if (percentage >= 70) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-2 mb-6">
        <TrendingUp className="w-5 h-5 text-green-500" />
        <h2 className="text-xl font-semibold">Attendance Overview</h2>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalClasses}
          </p>
          <p className="text-sm text-blue-600/80 dark:text-blue-400/80">Total Classes</p>
        </div>

        <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
          <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.attendedClasses}
          </p>
          <p className="text-sm text-green-600/80 dark:text-green-400/80">Attended</p>
        </div>

        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
          <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className={`text-2xl font-bold ${getPercentageColor(stats.percentage)}`}>
            {stats.percentage.toFixed(1)}%
          </p>
          <p className="text-sm text-purple-600/80 dark:text-purple-400/80">Overall</p>
        </div>
      </div>

      {/* Subject-wise Breakdown */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Subject-wise Attendance</h3>
        
        {Object.keys(stats.subjectWise).length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No subject data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(stats.subjectWise).map(([subjectId, subject]) => (
              <div key={subjectId} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{subject.subject}</h4>
                  <span className={`font-semibold ${getPercentageColor(subject.percentage)}`}>
                    {subject.percentage.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>{subject.attended} / {subject.total} classes attended</span>
                  <span>{subject.total - subject.attended} missed</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(subject.percentage)}`}
                    style={{ width: `${Math.min(subject.percentage, 100)}%` }}
                  />
                </div>

                {/* Attendance Status */}
                <div className="mt-2 text-xs">
                  {subject.percentage >= 90 && (
                    <span className="text-green-600 dark:text-green-400">✅ Excellent attendance</span>
                  )}
                  {subject.percentage >= 80 && subject.percentage < 90 && (
                    <span className="text-yellow-600 dark:text-yellow-400">⚠️ Good attendance</span>
                  )}
                  {subject.percentage >= 70 && subject.percentage < 80 && (
                    <span className="text-orange-600 dark:text-orange-400">⚠️ Needs improvement</span>
                  )}
                  {subject.percentage < 70 && (
                    <span className="text-red-600 dark:text-red-400">❌ Below requirement</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}