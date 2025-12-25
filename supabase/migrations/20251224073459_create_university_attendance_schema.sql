/*
  # University Attendance System - Database Schema
  
  1. New Tables
    - `departments` - University departments (ITE, DSE, etc.)
      - `id` (serial, primary key)
      - `name` (text, unique)
      - `short_name` (text, unique)
      - `created_at`, `updated_at` (timestamptz)
    
    - `majors` - Academic majors linked to departments
      - `id` (serial, primary key)
      - `name`, `short_name` (text)
      - `department_id` (int, foreign key to departments)
      - `created_at`, `updated_at` (timestamptz)
    
    - `classes` - Academic classes
      - `id` (serial, primary key)
      - `name` (text)
      - `major_id` (int, foreign key to majors)
      - `year`, `semester` (int)
      - `academic_year`, `group` (text)
      - `is_active` (boolean)
      - `created_at`, `updated_at` (timestamptz)
    
    - `subjects` - Course subjects
      - `id` (serial, primary key)
      - `name`, `code` (text)
      - `credits` (int)
      - `created_at`, `updated_at` (timestamptz)
    
    - `semesters` - Academic semesters
      - `id` (serial, primary key)
      - `name`, `code` (text)
      - `start_date`, `end_date` (date)
      - `is_active` (boolean)
      - `created_at`, `updated_at` (timestamptz)
    
    - `users` - System users (all roles)
      - `id` (serial, primary key)
      - `unique_id` (text, unique - e.g., ADMIN001)
      - `name`, `email`, `password` (text)
      - `role` (text - head, admin, hr_assistant, class_moderator, teacher, staff)
      - `department_id`, `class_id` (int, nullable)
      - `work_type`, `schedule` (text, nullable)
      - `status` (text - active, inactive, banned, pending, suspended)
      - `created_at`, `updated_at` (timestamptz)
    
    - `attendance` - Daily attendance records
      - `id` (serial, primary key)
      - `user_id` (int, foreign key to users)
      - `date` (date)
      - `status` (text - present, absent, late, excused)
      - `notes` (text, nullable)
      - `created_at`, `updated_at` (timestamptz)
      - Unique constraint on (user_id, date)
    
    - `schedules` - Class schedules
      - `id` (serial, primary key)
      - `class_id`, `subject_id` (int, foreign keys)
      - `room`, `day_of_week` (text)
      - `start_time`, `end_time` (time)
      - `academic_year` (text)
      - `semester` (int)
      - `created_at`, `updated_at` (timestamptz)
    
    - `class_moderators` - Moderator assignments
      - `id` (serial, primary key)
      - `class_id`, `user_id`, `semester_id` (int, foreign keys)
      - `is_primary` (boolean)
      - `created_at` (timestamptz)
    
    - `class_subjects` - Subject assignments to classes
      - `id` (serial, primary key)
      - `class_id`, `subject_id`, `semester_id` (int, foreign keys)
      - `created_at` (timestamptz)
    
    - `leave_requests` - Leave request management
      - `id` (serial, primary key)
      - `user_id` (int, foreign key to users)
      - `from_date`, `to_date` (date)
      - `reason` (text)
      - `status` (text - pending, approved, rejected, cancelled)
      - `reviewer_id` (int, nullable, foreign key to users)
      - `reviewed_at` (timestamptz, nullable)
      - `comments` (text, nullable)
      - `created_at`, `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on roles
  
  3. Important Notes
    - All timestamps use timestamptz for timezone support
    - Foreign keys use CASCADE or SET NULL appropriately
    - Indexes added for frequently queried columns
    - Unique constraints ensure data integrity
*/

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    short_name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Majors table
CREATE TABLE IF NOT EXISTS majors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    department_id INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS major_dept_idx ON majors(department_id);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    major_id INT NOT NULL,
    year INT NOT NULL,
    semester INT NOT NULL,
    academic_year TEXT NOT NULL,
    "group" TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS class_major_idx ON classes(major_id);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    credits INT DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Semesters table
CREATE TABLE IF NOT EXISTS semesters (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    unique_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('head', 'admin', 'hr_assistant', 'hr_backup', 'class_moderator', 'moderator', 'teacher', 'staff')),
    department_id INT,
    class_id INT,
    work_type TEXT,
    schedule TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned', 'pending', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS unique_id_idx ON users(unique_id);
CREATE INDEX IF NOT EXISTS user_dept_idx ON users(department_id);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS attendance_user_idx ON attendance(user_id);
CREATE INDEX IF NOT EXISTS attendance_date_idx ON attendance(date);

-- Schedules table
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    room TEXT,
    day_of_week TEXT CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    start_time TIME,
    end_time TIME,
    academic_year TEXT,
    semester INT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- Class Moderators table
CREATE TABLE IF NOT EXISTS class_moderators (
    id SERIAL PRIMARY KEY,
    class_id INT NOT NULL,
    user_id INT NOT NULL,
    semester_id INT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS mod_class_idx ON class_moderators(class_id);
CREATE INDEX IF NOT EXISTS mod_user_idx ON class_moderators(user_id);
CREATE INDEX IF NOT EXISTS mod_semester_idx ON class_moderators(semester_id);

-- Class Subjects table
CREATE TABLE IF NOT EXISTS class_subjects (
    id SERIAL PRIMARY KEY,
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    semester_id INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS class_subject_idx ON class_subjects(class_id, subject_id);
CREATE INDEX IF NOT EXISTS cs_semester_idx ON class_subjects(semester_id);

-- Leave Requests table
CREATE TABLE IF NOT EXISTS leave_requests (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    reviewer_id INT,
    reviewed_at TIMESTAMPTZ,
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS leave_user_idx ON leave_requests(user_id);
CREATE INDEX IF NOT EXISTS leave_status_idx ON leave_requests(status);

-- Enable RLS on all tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE majors ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow all authenticated users to read data
-- (Note: In production, you'd want more granular policies based on roles)
CREATE POLICY "Allow authenticated read access" ON departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON majors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON semesters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON class_moderators FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON class_subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON leave_requests FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert/update/delete (role-based logic will be in app layer)
CREATE POLICY "Allow authenticated write access" ON departments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated write access" ON majors FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated write access" ON classes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated write access" ON subjects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated write access" ON semesters FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated write access" ON users FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated write access" ON attendance FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated write access" ON schedules FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated write access" ON class_moderators FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated write access" ON class_subjects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated write access" ON leave_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);