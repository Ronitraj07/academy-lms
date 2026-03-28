'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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

export default function AdminDashboard() {
  const router = useRouter();
  const { stats, loading } = useUserManagement();
  const [showCreateUser, setShowCreateUser] = useState(false);

  const handleNavigateToUsers = () => {
    router.push('/admin/users');
  };

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              System Administration
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor system performance, manage users, and oversee academy operations.
            </p>
          </div>
          <div className="flex space-x-3">
            <Button className="flex items-center space-x-2" onClick={() => setShowCreateUser(true)}>
              <UserPlus className="h-4 w-4" />
              <span>Add User</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Button>
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : (stats?.studentCount || 0).toLocaleString()}
              </div>
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
              <div className="text-2xl font-bold">
                {loading ? '...' : (stats?.facultyCount || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Active teaching staff</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Shield className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : (stats?.totalUsers || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">All system users</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">99.9%</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87.5%</div>
              <p className="text-xs text-muted-foreground">+2.3% from last term</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">3 high priority</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Overview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <span>System Overview</span>
              </CardTitle>
              <CardDescription>Key system metrics and performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Department Performance */}
              <div>
                <h4 className="font-medium mb-3">Department Performance</h4>
                <div className="space-y-3">
                  {[
                    { dept: 'Computer Science', students: 342, faculty: 23, attendance: 89 },
                    { dept: 'Mathematics', students: 298, faculty: 19, attendance: 87 },
                    { dept: 'Physics', students: 245, faculty: 16, attendance: 85 },
                    { dept: 'Chemistry', students: 189, faculty: 14, attendance: 91 },
                    { dept: 'English', students: 173, faculty: 15, attendance: 88 }
                  ].map((item) => (
                    <div key={item.dept} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <h5 className="font-medium">{item.dept}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.students} students • {item.faculty} faculty
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{item.attendance}%</p>
                        <p className="text-xs text-gray-500">Attendance</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Admin Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => setShowCreateUser(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create User
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleNavigateToUsers}
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push('/admin/subjects')}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Manage Subjects
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => router.push('/admin/attendance')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Attendance System
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Reports
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                View Feedback
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                System Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent User Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>Latest system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New faculty member registered</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Dr. Sarah Wilson joined Computer Science</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Bulk student enrollment completed</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">45 students enrolled in CS201</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">5 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">System maintenance scheduled</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Database optimization at 2 AM Sunday</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">1 day ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="h-2 w-2 bg-purple-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New feedback received</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">3 new suggestions from faculty</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">2 days ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="h-2 w-2 bg-red-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Low attendance alert</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Physics 201 below 70% threshold</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>System Health</span>
              </CardTitle>
              <CardDescription>Performance metrics and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Server Performance</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">Excellent</Badge>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>CPU: 12%</span>
                  <span>Memory: 67%</span>
                  <span>Storage: 45%</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database Performance</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Good</Badge>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Queries/sec: 1.2K</span>
                  <span>Avg Response: 45ms</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">User Activity</span>
                  <Badge variant="default" className="bg-blue-100 text-blue-800">Active</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">324</p>
                    <p className="text-xs text-gray-500">Online Now</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">1,247</p>
                    <p className="text-xs text-gray-500">Daily Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-600">98.5%</p>
                    <p className="text-xs text-gray-500">Uptime</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Recent Issues & Alerts</span>
            </CardTitle>
            <CardDescription>System issues requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <Badge variant="destructive" className="text-xs">High Priority</Badge>
                </div>
                <h4 className="font-medium text-red-900 dark:text-red-100">Database Connection Issues</h4>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Intermittent connection timeouts affecting attendance marking
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">Reported 2 hours ago</p>
              </div>

              <div className="p-4 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <Badge variant="secondary" className="text-xs bg-yellow-200 text-yellow-800">Medium Priority</Badge>
                </div>
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Storage Space Warning</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  File storage at 85% capacity, cleanup recommended
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">Reported 1 day ago</p>
              </div>

              <div className="p-4 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                  <Badge variant="outline" className="text-xs">Low Priority</Badge>
                </div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">Feature Request</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Faculty requesting bulk grade import functionality
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Submitted 3 days ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <UserCreationForm
        open={showCreateUser}
        onClose={() => setShowCreateUser(false)}
      />
    </DashboardLayout>
  );
}