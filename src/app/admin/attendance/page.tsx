import { AttendanceManagementTable } from '@/components/admin/AttendanceManagementTable'

export default function AdminAttendancePage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
          <p className="text-muted-foreground">
            Track and manage student attendance across all subjects
          </p>
        </div>
      </div>

      <AttendanceManagementTable userRole="admin" />
    </div>
  )
}