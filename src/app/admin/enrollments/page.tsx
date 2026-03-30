'use client';

import { ClipboardList } from 'lucide-react';
import { SubjectManagementTable } from '@/components/admin/SubjectManagementTable';

export default function AdminEnrollmentsPage() {
  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Enrollments</h1>
        <p className="text-muted-foreground">
          Manage student–subject enrollments across all semesters
        </p>
      </div>

      {/*
        SubjectManagementTable already handles enroll/unenroll via EnrollStudentsModal.
        We reuse it here with the admin role so the Enroll button is visible.
      */}
      <SubjectManagementTable userRole="admin" />
    </div>
  );
}
