-- Academy LMS Row Level Security Policies
-- Execute these after creating the schema to enable RBAC security

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE remarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_contact ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS user_role AS $$
DECLARE
    user_role_result user_role;
BEGIN
    SELECT role INTO user_role_result
    FROM profiles 
    WHERE user_id = user_uuid;
    
    RETURN COALESCE(user_role_result, 'student'::user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage all profiles" ON profiles
    FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Faculty can view student profiles" ON profiles
    FOR SELECT USING (
        get_user_role(auth.uid()) = 'faculty' AND 
        role = 'student'
    );

-- Students policies
CREATE POLICY "Students can view own record" ON students
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Faculty can view enrolled students" ON students
    FOR SELECT USING (
        get_user_role(auth.uid()) = 'faculty' AND
        id IN (
            SELECT student_id 
            FROM subject_enrollments se
            INNER JOIN faculty f ON se.faculty_id = f.id
            WHERE f.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all students" ON students
    FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Faculty policies  
CREATE POLICY "Faculty can view own record" ON faculty
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can view assigned faculty" ON faculty
    FOR SELECT USING (
        get_user_role(auth.uid()) = 'student' AND
        id IN (
            SELECT faculty_id 
            FROM subject_enrollments se
            INNER JOIN students s ON se.student_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all faculty" ON faculty
    FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Subjects policies
CREATE POLICY "Faculty can manage own subjects" ON subjects
    FOR ALL USING (
        get_user_role(auth.uid()) = 'faculty' AND
        created_by IN (
            SELECT id FROM faculty WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Students can view enrolled subjects" ON subjects
    FOR SELECT USING (
        get_user_role(auth.uid()) = 'student' AND
        id IN (
            SELECT subject_id 
            FROM subject_enrollments se
            INNER JOIN students s ON se.student_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all subjects" ON subjects
    FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Subject enrollments policies
CREATE POLICY "Faculty can manage enrollments for their subjects" ON subject_enrollments
    FOR ALL USING (
        get_user_role(auth.uid()) = 'faculty' AND
        faculty_id IN (
            SELECT id FROM faculty WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Students can view own enrollments" ON subject_enrollments
    FOR SELECT USING (
        get_user_role(auth.uid()) = 'student' AND
        student_id IN (
            SELECT id FROM students WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all enrollments" ON subject_enrollments
    FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Attendance policies
CREATE POLICY "Faculty can manage attendance for their subjects" ON attendance
    FOR ALL USING (
        get_user_role(auth.uid()) = 'faculty' AND
        subject_id IN (
            SELECT subject_id 
            FROM subject_enrollments se
            INNER JOIN faculty f ON se.faculty_id = f.id
            WHERE f.user_id = auth.uid()
        )
    );

CREATE POLICY "Students can view own attendance" ON attendance
    FOR SELECT USING (
        get_user_role(auth.uid()) = 'student' AND
        student_id IN (
            SELECT id FROM students WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all attendance" ON attendance
    FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Timetable policies
CREATE POLICY "Faculty can manage timetable for their subjects" ON timetable
    FOR ALL USING (
        get_user_role(auth.uid()) = 'faculty' AND
        faculty_id IN (
            SELECT id FROM faculty WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Students can view timetable for enrolled subjects" ON timetable
    FOR SELECT USING (
        get_user_role(auth.uid()) = 'student' AND
        subject_id IN (
            SELECT subject_id 
            FROM subject_enrollments se
            INNER JOIN students s ON se.student_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all timetables" ON timetable
    FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Remarks policies
CREATE POLICY "Faculty can manage remarks for their students" ON remarks
    FOR ALL USING (
        get_user_role(auth.uid()) = 'faculty' AND
        faculty_id IN (
            SELECT id FROM faculty WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Students can view own remarks" ON remarks
    FOR SELECT USING (
        get_user_role(auth.uid()) = 'student' AND
        student_id IN (
            SELECT id FROM students WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all remarks" ON remarks
    FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Notifications policies
CREATE POLICY "Users can manage own notifications" ON notifications
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notifications" ON notifications
    FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Announcements policies
CREATE POLICY "Users can view targeted announcements" ON announcements
    FOR SELECT USING (
        is_active = true AND (
            target_role IS NULL OR
            target_role = get_user_role(auth.uid()) OR
            auth.uid() = ANY(target_users)
        )
    );

CREATE POLICY "Faculty can create announcements" ON announcements
    FOR INSERT WITH CHECK (
        get_user_role(auth.uid()) = 'faculty' AND
        auth.uid() = created_by
    );

CREATE POLICY "Admins can manage all announcements" ON announcements
    FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Feedback contact policies
CREATE POLICY "Admins can manage all feedback" ON feedback_contact
    FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;