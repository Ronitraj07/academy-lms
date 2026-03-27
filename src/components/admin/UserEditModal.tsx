'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUserManagement } from '@/hooks/useUserManagement';
import type { UserWithProfile, UpdateUserForm } from '@/types';

interface UserEditModalProps {
  user: UserWithProfile | null;
  open: boolean;
  onClose: () => void;
}

export function UserEditModal({ user, open, onClose }: UserEditModalProps) {
  const { updateUser, changeUserRole } = useUserManagement();
  const [loading, setLoading] = useState(false);
  const [showRoleChangeConfirm, setShowRoleChangeConfirm] = useState(false);
  const [newRole, setNewRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [formData, setFormData] = useState<UpdateUserForm>({
    full_name: '',
    phone: '',
    address: '',
    date_of_birth: '',
    status: 'active',
  });

  // Initialize form when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.profile?.full_name || '',
        phone: user.profile?.phone || '',
        address: user.profile?.address || '',
        date_of_birth: user.profile?.date_of_birth || '',
        status: user.status || 'active',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const success = await updateUser(user.id, formData);
    setLoading(false);

    if (success) {
      onClose();
    }
  };

  const handleRoleChange = (role: string) => {
    if (!user || role === user.role) return;
    
    setNewRole(role as 'student' | 'faculty' | 'admin');
    setShowRoleChangeConfirm(true);
  };

  const confirmRoleChange = async () => {
    if (!user) return;

    setLoading(true);
    const success = await changeUserRole(user.id, newRole);
    setLoading(false);
    
    if (success) {
      setShowRoleChangeConfirm(false);
      onClose();
    } else {
      setShowRoleChangeConfirm(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. Role changes require confirmation.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Overview */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name || 'User'}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-semibold text-primary">
                    {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold">{user.full_name || 'Unnamed User'}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  ID: {user.id} • Created: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            {/* Role Management */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold">Role & Status</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={user.role} onValueChange={handleRoleChange}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address"
                />
              </div>
            </div>

            {/* Role-specific Information Display */}
            {(user.role === 'student' && user.student) && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-semibold">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Student ID</Label>
                    <p>{user.student.student_id || 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Class Level</Label>
                    <p>{user.student.class_level || 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Enrollment Date</Label>
                    <p>{new Date(user.student.enrollment_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Guardian Contact</Label>
                    <p>{user.student.guardian_contact || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            )}

            {(user.role === 'faculty' && user.faculty) && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-semibold">Faculty Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Employee ID</Label>
                    <p>{user.faculty.employee_id || 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Department</Label>
                    <p>{user.faculty.department || 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Hire Date</Label>
                    <p>{new Date(user.faculty.hire_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Specialization</Label>
                    <p>{user.faculty.specialization || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Role Change Confirmation */}
      <AlertDialog open={showRoleChangeConfirm} onOpenChange={setShowRoleChangeConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to change {user.full_name || user.email}'s role from{' '}
                <strong>{user.role}</strong> to <strong>{newRole}</strong>?
              </p>
              <p className="text-sm text-muted-foreground">
                This will update their permissions and may affect their access to certain features.
                Role-specific data will be updated accordingly.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange} disabled={loading}>
              {loading ? 'Changing...' : 'Confirm Change'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}