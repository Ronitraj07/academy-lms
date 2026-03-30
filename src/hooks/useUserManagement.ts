'use client';

import { useState, useEffect, useRef } from 'react';
// #17 — use the real per-request client, not the mock singleton from lib/supabase.ts
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { UserWithProfile, CreateUserForm, UpdateUserForm, AdminStats } from '@/types';

export function useUserManagement() {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);

  // #13 — stable client reference
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const fetchAllUsers = async (filter?: { role?: string; status?: string; search?: string }) => {
    try {
      setLoading(true);
      setError(null);

      let query = (supabase as any)
        .from('profiles')
        .select(`
          id,
          user_id,
          full_name,
          avatar_url,
          phone,
          address,
          date_of_birth,
          role,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (filter?.role) {
        query = query.eq('role', filter.role);
      }

      if (filter?.search) {
        query = query.or(`full_name.ilike.%${filter.search}%,user_id.ilike.%${filter.search}%`);
      }

      const { data: profilesData, error: profilesError } = await query;

      if (profilesError) throw profilesError;

      const usersWithProfile: UserWithProfile[] = (profilesData || []).map((p: any) => ({
        id: p.user_id,
        email: `${p.user_id}@academy.test`,
        role: p.role,
        full_name: p.full_name,
        avatar_url: p.avatar_url,
        created_at: p.created_at,
        updated_at: p.updated_at,
        profile: p,
        status: 'active',
      }));

      setUsers(usersWithProfile);
      return usersWithProfile;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch users';
      setError(errorMessage);
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: CreateUserForm): Promise<boolean> => {
    try {
      const userId = `demo-${userData.role}-${Date.now()}`;

      const { error: profileError } = await (supabase as any)
        .from('profiles')
        .insert({
          user_id: userId,
          full_name: userData.full_name,
          phone: userData.phone,
          address: userData.address,
          date_of_birth: userData.date_of_birth,
          role: userData.role,
        });

      if (profileError) throw profileError;

      if (userData.role === 'student') {
        const { error: studentError } = await (supabase as any)
          .from('students')
          .insert({
            user_id: userId,
            student_id: userData.student_id || `STU${Date.now()}`,
            enrollment_date: new Date().toISOString(),
            class_level: userData.class_level,
            guardian_contact: userData.guardian_contact,
          });
        if (studentError) throw studentError;
      }

      if (userData.role === 'faculty') {
        const { error: facultyError } = await (supabase as any)
          .from('faculty')
          .insert({
            user_id: userId,
            employee_id: userData.employee_id || `FAC${Date.now()}`,
            department: userData.department,
            hire_date: userData.hire_date || new Date().toISOString(),
            specialization: userData.specialization,
          });
        if (facultyError) throw facultyError;
      }

      toast({
        title: 'Success',
        description: `${userData.role.charAt(0).toUpperCase() + userData.role.slice(1)} created successfully`
      });

      await fetchAllUsers();
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create user';
      setError(errorMessage);
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
      return false;
    }
  };

  const updateUser = async (userId: string, updates: UpdateUserForm): Promise<boolean> => {
    try {
      const { error: profileError } = await (supabase as any)
        .from('profiles')
        .update({
          full_name: updates.full_name,
          phone: updates.phone,
          address: updates.address,
          date_of_birth: updates.date_of_birth,
        })
        .eq('user_id', userId);

      if (profileError) throw profileError;

      if (updates.department || updates.specialization) {
        const { error: facultyError } = await (supabase as any)
          .from('faculty')
          .update({ department: updates.department, specialization: updates.specialization })
          .eq('user_id', userId);
        if (facultyError) throw facultyError;
      }

      if (updates.class_level || updates.guardian_contact) {
        const { error: studentError } = await (supabase as any)
          .from('students')
          .update({ class_level: updates.class_level, guardian_contact: updates.guardian_contact })
          .eq('user_id', userId);
        if (studentError) throw studentError;
      }

      toast({ title: 'Success', description: 'User updated successfully' });
      await fetchAllUsers();
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update user';
      setError(errorMessage);
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
      return false;
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      const { error: profileError } = await (supabase as any)
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) throw profileError;

      toast({ title: 'Success', description: 'User deleted successfully' });
      await fetchAllUsers();
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete user';
      setError(errorMessage);
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
      return false;
    }
  };

  const changeUserRole = async (userId: string, newRole: 'student' | 'faculty' | 'admin'): Promise<boolean> => {
    try {
      const targetUser = users.find(u => u.id === userId);
      if (!targetUser) throw new Error('User not found');

      const oldRole = targetUser.role;

      const { error: roleError } = await (supabase as any)
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (roleError) throw roleError;

      if (oldRole === 'student' && newRole !== 'student') {
        await (supabase as any).from('students').delete().eq('user_id', userId);
      }

      if (oldRole === 'faculty' && newRole !== 'faculty') {
        await (supabase as any).from('faculty').delete().eq('user_id', userId);
      }

      if (newRole === 'student' && oldRole !== 'student') {
        await (supabase as any).from('students').insert({
          user_id: userId,
          student_id: `STU${Date.now()}`,
          enrollment_date: new Date().toISOString(),
        });
      }

      if (newRole === 'faculty' && oldRole !== 'faculty') {
        await (supabase as any).from('faculty').insert({
          user_id: userId,
          employee_id: `FAC${Date.now()}`,
          hire_date: new Date().toISOString(),
        });
      }

      toast({ title: 'Success', description: `User role changed from ${oldRole} to ${newRole}` });
      await fetchAllUsers();
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to change user role';
      setError(errorMessage);
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
      return false;
    }
  };

  const fetchUserStats = async (): Promise<AdminStats | null> => {
    try {
      const { data: profilesData, error: profilesError } = await (supabase as any)
        .from('profiles')
        .select('role, created_at');

      if (profilesError) throw profilesError;

      const profiles = profilesData || [];
      const now = new Date();
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

      const computedStats: AdminStats = {
        totalUsers: profiles.length,
        studentCount: profiles.filter((p: any) => p.role === 'student').length,
        facultyCount: profiles.filter((p: any) => p.role === 'faculty').length,
        adminCount: profiles.filter((p: any) => p.role === 'admin').length,
        activeUsers: profiles.length,
        newUsersThisMonth: profiles.filter((p: any) =>
          new Date(p.created_at) >= oneMonthAgo
        ).length,
      };

      setStats(computedStats);
      return computedStats;
    } catch (err: any) {
      console.error('Failed to fetch user stats:', err);
      return null;
    }
  };

  const searchUsers = async (query: string) => {
    return fetchAllUsers({ search: query });
  };

  const createInitialDemoUsers = async () => {
    try {
      const { data: existingProfiles, error: checkError } = await (supabase as any)
        .from('profiles')
        .select('id')
        .limit(1);

      if (checkError) throw checkError;
      if (existingProfiles && existingProfiles.length > 0) return;

      console.log('🔄 Creating initial demo users...');

      await (supabase as any).from('profiles').insert({ user_id: 'demo-admin-1', full_name: 'Admin User', phone: '+1234567890', address: '123 Academy Admin St', role: 'admin' });
      await (supabase as any).from('profiles').insert({ user_id: 'demo-faculty-1', full_name: 'Dr. John Smith', phone: '+1234567891', address: '456 Faculty Avenue', role: 'faculty' });
      await (supabase as any).from('faculty').insert({ user_id: 'demo-faculty-1', employee_id: 'FAC001', department: 'Computer Science', hire_date: '2023-01-15', specialization: 'Full Stack Development' });

      const demoStudents = [
        { user_id: 'demo-student-1', full_name: 'Alice Johnson', phone: '+1234567892', address: '789 Student Boulevard', student_id: 'STU001', class_level: 'Year 1', guardian_contact: 'alice.parent@academy.test' },
        { user_id: 'demo-student-2', full_name: 'Bob Wilson', phone: '+1234567893', address: '101 Student Lane', student_id: 'STU002', class_level: 'Year 2', guardian_contact: 'bob.parent@academy.test' },
        { user_id: 'demo-student-3', full_name: 'Carol Davis', phone: '+1234567894', address: '202 Student Court', student_id: 'STU003', class_level: 'Year 1', guardian_contact: 'carol.parent@academy.test' },
      ];

      for (const student of demoStudents) {
        await (supabase as any).from('profiles').insert({ user_id: student.user_id, full_name: student.full_name, phone: student.phone, address: student.address, role: 'student' });
        await (supabase as any).from('students').insert({ user_id: student.user_id, student_id: student.student_id, enrollment_date: new Date().toISOString(), class_level: student.class_level, guardian_contact: student.guardian_contact });
      }

      console.log('✅ Demo users created successfully');
    } catch (err: any) {
      console.error('Failed to create demo users:', err);
    }
  };

  useEffect(() => {
    if (profile?.role === 'admin') {
      createInitialDemoUsers().then(() => {
        fetchAllUsers();
        fetchUserStats();
      });
    }
  }, [profile?.role]);

  return {
    users,
    loading,
    error,
    stats,
    fetchAllUsers,
    createUser,
    updateUser,
    deleteUser,
    changeUserRole,
    fetchUserStats,
    searchUsers,
  };
}
