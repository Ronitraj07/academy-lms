'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserCreationForm } from '@/components/admin/UserCreationForm';
import { useUserManagement } from '@/hooks/useUserManagement';
import {
  Users,
  GraduationCap,
  BookOpen,
  BarChart3,
  Settings,
  Shield,
  TrendingUp,
  AlertTriangle,
  UserPlus,
  FileText,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

function SkeletonText({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded', className)} />;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { stats, loading } = useUserManagement();
  const [showCreateUser, setShowCreateUser] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient">System Administration</h1>
            <p className="text-muted-foreground">
              Monitor system performance, manage users, and oversee academy operations.
            </p>
          </div>
          <div className="flex gap-3">
            <Button className="flex items-center gap-2" onClick={() => setShowCreateUser(true)}>
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={() => router.push('/admin/settings')}>
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Grid — 3 cols max so cards are always readable */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <SkeletonText className="h-8 w-16 mb-1" />
              ) : (
                <div className="text-2xl font-bold">{(stats?.studentCount || 0).toLocaleString()}</div>
              )}
              <p className="text-xs text-muted-foreground">
                +{stats?.newUsersThisMonth || 0} new this month
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faculty Members</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <SkeletonText className="h-8 w-16 mb-1" />
              ) : (
                <div className="text-2xl font-bold">{(stats?.facultyCount || 0).toLocaleString()}</div>
              )}
              <p className="text-xs text-muted-foreground">Active teaching staff</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Shield className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <SkeletonText className="h-8 w-16 mb-1" />
              ) : (
                <div className="text-2xl font-bold">{(stats?.totalUsers || 0).toLocaleString()}</div>
              )}
              <p className="text-xs text-muted-foreground">All system users</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Department Performance */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                System Overview
              </CardTitle>
              <CardDescription>Department performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { dept: 'Computer Science', students: 342, faculty: 23, attendance: 89 },
                { dept: 'Mathematics',      students: 298, faculty: 19, attendance: 87 },
                { dept: 'Physics',          students: 245, faculty: 16, attendance: 85 },
                { dept: 'Chemistry',        students: 189, faculty: 14, attendance: 91 },
                { dept: 'English',          students: 173, faculty: 15, attendance: 88 },
              ].map(item => (
                <div key={item.dept} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{item.dept}</p>
                    <p className="text-xs text-muted-foreground">{item.students} students · {item.faculty} faculty</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{item.attendance}%</p>
                    <p className="text-xs text-muted-foreground">Attendance</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Create User',       icon: UserPlus,  action: () => setShowCreateUser(true) },
                { label: 'Manage Users',      icon: Users,     action: () => router.push('/admin/users') },
                { label: 'Manage Subjects',   icon: BookOpen,  action: () => router.push('/admin/subjects') },
                { label: 'Attendance System', icon: BarChart3, action: () => router.push('/admin/attendance') },
                { label: 'Generate Reports',  icon: BarChart3, action: () => {} },
                { label: 'View Feedback',     icon: FileText,  action: () => {} },
                { label: 'System Settings',   icon: Settings,  action: () => router.push('/admin/settings') },
              ].map(({ label, icon: Icon, action }) => (
                <Button key={label} className="w-full justify-start" variant="outline" onClick={action}>
                  <Icon className="h-4 w-4 mr-2" />{label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Activity & Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest system activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { color: 'bg-green-500',  title: 'New faculty member registered',    desc: 'Dr. Sarah Wilson joined Computer Science', time: '2 hours ago' },
                { color: 'bg-blue-500',   title: 'Bulk student enrollment completed', desc: '45 students enrolled in CS201',          time: '5 hours ago' },
                { color: 'bg-yellow-500', title: 'System maintenance scheduled',     desc: 'Database optimization at 2 AM Sunday',   time: '1 day ago' },
                { color: 'bg-purple-500', title: 'New feedback received',             desc: '3 new suggestions from faculty',         time: '2 days ago' },
                { color: 'bg-red-500',    title: 'Low attendance alert',             desc: 'Physics 201 below 70% threshold',        time: '3 days ago' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className={cn('w-2 h-2 rounded-full mt-2 shrink-0', item.color)} />
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                System Health
              </CardTitle>
              <CardDescription>Performance metrics and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                { label: 'Server Performance', badge: 'Excellent', badgeClass: 'bg-green-100 text-green-800', pct: 94, barClass: 'bg-green-500', sub: 'CPU: 12% · Memory: 67% · Storage: 45%' },
                { label: 'Database Performance', badge: 'Good', badgeClass: 'bg-yellow-100 text-yellow-800', pct: 78, barClass: 'bg-yellow-500', sub: 'Queries/sec: 1.2K · Avg Response: 45ms' },
              ].map(item => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.label}</span>
                    <Badge className={item.badgeClass}>{item.badge}</Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className={cn('h-2 rounded-full', item.barClass)} style={{ width: `${item.pct}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
              ))}
              <div className="grid grid-cols-3 gap-4 text-center pt-1">
                {[{ val: '324', label: 'Online Now', cls: 'text-blue-600' }, { val: '1,247', label: 'Daily Active', cls: 'text-green-600' }, { val: '98.5%', label: 'Uptime', cls: 'text-purple-600' }].map(i => (
                  <div key={i.label}>
                    <p className={cn('text-lg font-bold', i.cls)}>{i.val}</p>
                    <p className="text-xs text-muted-foreground">{i.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Recent Issues & Alerts
            </CardTitle>
            <CardDescription>System issues requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <Badge variant="destructive" className="text-xs">High Priority</Badge>
                </div>
                <h4 className="font-medium text-red-900 dark:text-red-100 text-sm">Database Connection Issues</h4>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">Intermittent connection timeouts affecting attendance marking</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">Reported 2 hours ago</p>
              </div>
              <div className="p-4 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <Badge className="text-xs bg-yellow-200 text-yellow-800">Medium Priority</Badge>
                </div>
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100 text-sm">Storage Space Warning</h4>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">File storage at 85% capacity, cleanup recommended</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">Reported 1 day ago</p>
              </div>
              <div className="p-4 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                  <Badge variant="outline" className="text-xs">Low Priority</Badge>
                </div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm">Feature Request</h4>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Faculty requesting bulk grade import functionality</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Submitted 3 days ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <UserCreationForm open={showCreateUser} onClose={() => setShowCreateUser(false)} />
    </DashboardLayout>
  );
}
