export interface User {
  id: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  role?: 'student' | 'faculty' | 'admin';
}

export interface Student {
  id: string;
  user_id: string;
  student_id: string;
  enrollment_date: string;
  class_level?: string;
  guardian_contact?: string;
  profile?: Profile;
  user?: User;
}

export interface Faculty {
  id: string;
  user_id: string;
  employee_id: string;
  department?: string;
  hire_date: string;
  specialization?: string;
  profile?: Profile;
  user?: User;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  credits?: number;
  department?: string;
  created_by: string;
  faculty?: Faculty;
  created_at?: string;
}

export interface SubjectEnrollment {
  id: string;
  student_id: string;
  subject_id: string;
  faculty_id: string;
  enrolled_at: string;
  status: 'active' | 'inactive' | 'completed';
  student?: Student;
  subject?: Subject;
  faculty?: Faculty;
}

export interface Attendance {
  id: string;
  student_id: string;
  subject_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  marked_by: string;
  notes?: string;
  student?: Student;
  subject?: Subject;
  marked_by_user?: User;
}

export interface Timetable {
  id: string;
  subject_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  start_time: string;
  end_time: string;
  room?: string;
  faculty_id: string;
  subject?: Subject;
  faculty?: Faculty;
}

export interface Remark {
  id: string;
  student_id: string;
  subject_id?: string;
  faculty_id: string;
  content: string;
  type: 'academic' | 'behavioral' | 'general';
  date: string;
  student?: Student;
  subject?: Subject;
  faculty?: Faculty;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'attendance' | 'remark' | 'announcement' | 'system';
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, any>;
  created_at: string;
}

export interface Announcement {
  id: string;
  created_by: string;
  title: string;
  content: string;
  target_role?: 'student' | 'faculty' | 'admin';
  target_users?: string[];
  created_at: string;
  created_by_user?: User;
}

export interface FeedbackContact {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalStudents: number;
  totalFaculty: number;
  totalSubjects: number;
  totalAttendance: number;
  averageAttendance: number;
}

// Attendance Summary
export interface AttendanceSummary {
  subject_id: string;
  subject_name: string;
  total_classes: number;
  attended_classes: number;
  attendance_percentage: number;
}

// Chart Data
export interface ChartData {
  name: string;
  value: number;
  label?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
  role: 'student' | 'faculty' | 'admin';
}

export interface CreateUserForm {
  email: string;
  password: string;
  role: 'student' | 'faculty' | 'admin';
  full_name: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  // Student specific
  student_id?: string;
  class_level?: string;
  guardian_contact?: string;
  // Faculty specific
  employee_id?: string;
  department?: string;
  hire_date?: string;
  specialization?: string;
}

// Supabase types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id'>;
        Update: Partial<Omit<Profile, 'id'>>;
      };
      students: {
        Row: Student;
        Insert: Omit<Student, 'id'>;
        Update: Partial<Omit<Student, 'id'>>;
      };
      faculty: {
        Row: Faculty;
        Insert: Omit<Faculty, 'id'>;
        Update: Partial<Omit<Faculty, 'id'>>;
      };
      subjects: {
        Row: Subject;
        Insert: Omit<Subject, 'id' | 'created_at'>;
        Update: Partial<Omit<Subject, 'id'>>;
      };
      subject_enrollments: {
        Row: SubjectEnrollment;
        Insert: Omit<SubjectEnrollment, 'id'>;
        Update: Partial<Omit<SubjectEnrollment, 'id'>>;
      };
      attendance: {
        Row: Attendance;
        Insert: Omit<Attendance, 'id'>;
        Update: Partial<Omit<Attendance, 'id'>>;
      };
      timetable: {
        Row: Timetable;
        Insert: Omit<Timetable, 'id'>;
        Update: Partial<Omit<Timetable, 'id'>>;
      };
      remarks: {
        Row: Remark;
        Insert: Omit<Remark, 'id'>;
        Update: Partial<Omit<Remark, 'id'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id'>;
        Update: Partial<Omit<Notification, 'id'>>;
      };
      announcements: {
        Row: Announcement;
        Insert: Omit<Announcement, 'id'>;
        Update: Partial<Omit<Announcement, 'id'>>;
      };
      feedback_contact: {
        Row: FeedbackContact;
        Insert: Omit<FeedbackContact, 'id'>;
        Update: Partial<Omit<FeedbackContact, 'id'>>;
      };
    };
  };
}