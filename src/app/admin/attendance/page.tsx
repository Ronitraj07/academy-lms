'use client';

import { AttendanceManagementTable } from '@/components/admin/AttendanceManagementTable';

export default function AdminAttendancePage() {
  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Attendance Management</h1>
        <p className="text-muted-foreground">
          Track and manage student attendance across all subjects
        </p>
      </div>

      <AttendanceManagementTable userRole="admin" />
    </div>
  );
}
