'use client';

import { useState } from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { UserCreationForm } from '@/components/admin/UserCreationForm';
import { UserEditModal } from '@/components/admin/UserEditModal';
import { useUserManagement } from '@/hooks/useUserManagement';
import type { UserWithProfile } from '@/types';

export default function AdminFacultyPage() {
  const { stats, loading } = useUserManagement();
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithProfile | null>(null);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Faculty</h1>
          <p className="text-muted-foreground">
            {loading ? 'Loading…' : `${stats?.facultyCount ?? 0} faculty members`}
          </p>
        </div>
        <UserCreationForm open={showCreate} onClose={() => setShowCreate(false)} />
      </div>

      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            All Faculty
          </CardTitle>
          <CardDescription>View, edit, or remove faculty accounts</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <UserManagementTable
              onEditUser={setEditingUser}
              onCreateUser={() => setShowCreate(true)}
            />
          </div>
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
