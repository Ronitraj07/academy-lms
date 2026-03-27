'use client';

import { useState } from 'react';
import { Users, UserPlus, Filter, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { UserCreationForm } from '@/components/admin/UserCreationForm';
import { UserEditModal } from '@/components/admin/UserEditModal';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useUserManagement } from '@/hooks/useUserManagement';
import type { UserWithProfile } from '@/types';

function UsersPageContent() {
  const { stats, loading } = useUserManagement();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithProfile | null>(null);

  const handleCreateUser = () => {
    setShowCreateForm(true);
  };

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
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">User Management</h1>
          <p className="text-muted-foreground">
            Manage students, faculty, and administrators across the system
          </p>
        </div>
        <UserCreationForm
          open={showCreateForm}
          onClose={() => setShowCreateForm(false)}
        />
      </div>

      <div className="grid-responsive">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="card-hover card-elevated">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                  {stat.trend}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            View and manage all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <UserManagementTable 
            onEditUser={setEditingUser} 
            onCreateUser={handleCreateUser}
          />
        </CardContent>
      </Card>

      {editingUser && (
        <UserEditModal
          user={editingUser}
          open={true}
          onClose={() => setEditingUser(null)}
        />
      )}
    </div>
  );
}

export default function UsersPage() {
  return (
    <DashboardLayout>
      <UsersPageContent />
    </DashboardLayout>
  );
}