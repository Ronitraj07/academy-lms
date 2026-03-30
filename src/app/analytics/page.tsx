'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, Users, BookOpen, Award, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AttendanceChart } from '@/components/admin/AttendanceChart';
import { useUserManagement } from '@/hooks/useUserManagement';

function StatCard({
  title, value, description, icon: Icon, loading, colorClass,
}: {
  title: string; value: number | string; description: string;
  icon: React.ComponentType<{ className?: string }>; loading?: boolean; colorClass: string;
}) {
  return (
    <Card className="card-hover card-elevated">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${colorClass}`} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse h-8 w-20 rounded bg-gray-200 dark:bg-gray-700 mb-1" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { stats, loading } = useUserManagement();

  const statCards = [
    { title: 'Total Users',    value: stats?.totalUsers    ?? 0, description: 'Active accounts',      icon: Users,    colorClass: 'text-blue-500'   },
    { title: 'Students',       value: stats?.studentCount  ?? 0, description: 'Enrolled students',    icon: Award,    colorClass: 'text-green-500'  },
    { title: 'Faculty',        value: stats?.facultyCount  ?? 0, description: 'Teaching staff',       icon: BookOpen, colorClass: 'text-purple-500' },
    { title: 'New This Month', value: stats?.newUsersThisMonth ?? 0, description: 'Recent sign-ups', icon: TrendingUp, colorClass: 'text-orange-500' },
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Analytics</h1>
          <p className="text-muted-foreground">Platform-wide attendance and engagement insights</p>
        </div>
        <Button variant="outline" className="gap-2 w-fit" disabled>
          <Download className="h-4 w-4" /> Export Report
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid-responsive">
        {statCards.map(s => (
          <StatCard key={s.title} {...s} loading={loading} />
        ))}
      </div>

      {/* Attendance Chart */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Attendance Overview
          </CardTitle>
          <CardDescription>Subject-wise attendance rates across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <AttendanceChart />
        </CardContent>
      </Card>
    </div>
  );
}
