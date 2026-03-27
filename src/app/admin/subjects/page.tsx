import { SubjectManagementTable } from '@/components/admin/SubjectManagementTable'

export default function AdminSubjectsPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subject Management</h1>
          <p className="text-muted-foreground">
            Manage subjects, enrollments, and curriculum
          </p>
        </div>
      </div>

      <SubjectManagementTable userRole="admin" />
    </div>
  )
}