-- Academy LMS Seed Data
-- Mock data for testing the application
-- Execute this after creating the schema

-- Note: Replace these UUIDs with actual user IDs from auth.users after creating test users

-- Mock user IDs (these should be replaced with real auth.users IDs)
-- Admin user ID: 11111111-1111-1111-1111-111111111111
-- Faculty user ID: 22222222-2222-2222-2222-222222222222  
-- Student user ID: 33333333-3333-3333-3333-333333333333

-- Insert mock profiles
INSERT INTO profiles (user_id, full_name, role, phone, address) VALUES
('11111111-1111-1111-1111-111111111111', 'Admin User', 'admin', '+1234567890', '123 Admin St'),
('22222222-2222-2222-2222-222222222222', 'John Faculty', 'faculty', '+1234567891', '456 Faculty Ave'),
('33333333-3333-3333-3333-333333333333', 'Jane Student', 'student', '+1234567892', '789 Student Blvd')
ON CONFLICT (user_id) DO NOTHING;

-- Insert mock faculty
INSERT INTO faculty (user_id, employee_id, department, specialization) VALUES
('22222222-2222-2222-2222-222222222222', 'FAC001', 'Computer Science', 'Full Stack Development')
ON CONFLICT (user_id) DO NOTHING;

-- Insert mock students  
INSERT INTO students (user_id, student_id, class_level, guardian_contact) VALUES
('33333333-3333-3333-3333-333333333333', 'STU001', '1st Year', 'parent@example.com')
ON CONFLICT (user_id) DO NOTHING;

-- Insert mock subjects (after faculty is created)
INSERT INTO subjects (name, code, description, credits, department, created_by) 
SELECT 
    'Introduction to Programming',
    'CS101',
    'Basic programming concepts and fundamentals',
    3,
    'Computer Science',
    f.id
FROM faculty f 
WHERE f.employee_id = 'FAC001'
ON CONFLICT (code) DO NOTHING;

INSERT INTO subjects (name, code, description, credits, department, created_by)
SELECT 
    'Web Development',
    'CS201', 
    'Modern web development with HTML, CSS, and JavaScript',
    4,
    'Computer Science',
    f.id
FROM faculty f 
WHERE f.employee_id = 'FAC001'
ON CONFLICT (code) DO NOTHING;

-- Insert mock enrollments
INSERT INTO subject_enrollments (student_id, subject_id, faculty_id)
SELECT s.id, sub.id, f.id
FROM students s, subjects sub, faculty f
WHERE s.student_id = 'STU001' 
  AND sub.code IN ('CS101', 'CS201')
  AND f.employee_id = 'FAC001'
ON CONFLICT (student_id, subject_id) DO NOTHING;

-- Insert mock timetable
INSERT INTO timetable (subject_id, faculty_id, day_of_week, start_time, end_time, room)
SELECT sub.id, f.id, 1, '09:00', '10:30', 'Room 101'
FROM subjects sub, faculty f
WHERE sub.code = 'CS101' AND f.employee_id = 'FAC001'
ON CONFLICT (day_of_week, start_time, room) DO NOTHING;

INSERT INTO timetable (subject_id, faculty_id, day_of_week, start_time, end_time, room)
SELECT sub.id, f.id, 3, '11:00', '12:30', 'Room 102' 
FROM subjects sub, faculty f
WHERE sub.code = 'CS201' AND f.employee_id = 'FAC001'
ON CONFLICT (day_of_week, start_time, room) DO NOTHING;

-- Insert mock attendance (last 10 days)
INSERT INTO attendance (student_id, subject_id, date, status, marked_by)
SELECT s.id, sub.id, CURRENT_DATE - INTERVAL '1 day' * generate_series(1, 10), 
       CASE WHEN random() < 0.8 THEN 'present' ELSE 'absent' END,
       f.user_id
FROM students s, subjects sub, faculty f
WHERE s.student_id = 'STU001'
  AND sub.code IN ('CS101', 'CS201') 
  AND f.employee_id = 'FAC001'
ON CONFLICT (student_id, subject_id, date) DO NOTHING;

-- Insert mock remarks
INSERT INTO remarks (student_id, subject_id, faculty_id, content, type)
SELECT s.id, sub.id, f.id, 'Excellent participation in class discussions', 'academic'
FROM students s, subjects sub, faculty f
WHERE s.student_id = 'STU001'
  AND sub.code = 'CS101'
  AND f.employee_id = 'FAC001'
LIMIT 1;

-- Insert mock notifications
INSERT INTO notifications (user_id, type, title, message)
VALUES 
('33333333-3333-3333-3333-333333333333', 'attendance', 'Attendance Marked', 'Your attendance has been marked for CS101'),
('33333333-3333-3333-3333-333333333333', 'remark', 'New Remark Added', 'You have received a new remark for CS101'),
('33333333-3333-3333-3333-333333333333', 'announcement', 'Welcome!', 'Welcome to Academy LMS')
ON CONFLICT DO NOTHING;

-- Insert mock announcements
INSERT INTO announcements (created_by, title, content, target_role)
VALUES
('11111111-1111-1111-1111-111111111111', 'System Maintenance', 'The system will be under maintenance on Sunday from 2-4 AM', null),
('22222222-2222-2222-2222-222222222222', 'Assignment Deadline', 'Remember to submit your programming assignment by Friday', 'student')
ON CONFLICT DO NOTHING;