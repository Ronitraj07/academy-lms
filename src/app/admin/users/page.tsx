'use client';

import { useState } from 'react';
import { Users, UserPlus, Filter, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { UserCreationForm } from '@/components/admin/UserCreationForm';
import { UserEditModal } from '@/components/admin/UserEditModal';
import { useUserManagement } from '@/hooks/useUserManagement';
import type { UserWithProfile } from '@/types';

export default function UsersPage() {
  const { stats, loading } = useUserManagement();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithProfile | null>(null);

  const statsCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      description: 'All active users',
      icon: Users,
      trend: `+${stats?.newUsersThisMonth || 0} this month`,
    },
    {
      title: 'Students',
      value: stats?.studentCount || 0,
      description: 'Enrolled students',
      icon: UserPlus,
      trend: 'Active enrollments',
    },
    {
      title: 'Faculty',
      value: stats?.facultyCount || 0,
      description: 'Teaching staff',
      icon: Filter,
      trend: 'Teaching positions',
    },
    {
      title: 'Admins',
      value: stats?.adminCount || 0,
      description: 'System administrators',
      icon: TrendingUp,
      trend: 'With full access',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage all system users, roles, and permissions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stat.value.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            View, edit, and manage all system users. Click on a user to edit their information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserManagementTable
            onCreateUser={() => setShowCreateForm(true)}
            onEditUser={setEditingUser}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <UserCreationForm
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
      />

      <UserEditModal
        user={editingUser}
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
      />
    </div>
  );
}