'use client';

import { BookOpen } from 'lucide-react';
import { SubjectManagementTable } from '@/components/admin/SubjectManagementTable';

export default function AdminSubjectsPage() {
  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Subject Management</h1>
        <p className="text-muted-foreground">
          Manage subjects, enrollments, and curriculum across all semesters
        </p>
      </div>

      <SubjectManagementTable userRole="admin" />
    </div>
  );
}
