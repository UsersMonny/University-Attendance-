export type UserRole = 'admin' | 'head' | 'hr_assistant' | 'class_moderator' | 'teacher' | 'staff';

export type UserStatus = 'active' | 'inactive' | 'banned' | 'pending' | 'suspended';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Department {
  id: number;
  name: string;
  short_name: string;
  created_at: string;
  updated_at: string;
}

export interface Major {
  id: number;
  name: string;
  short_name: string;
  department_id: number;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: number;
  name: string;
  major_id: number;
  year: number;
  semester: number;
  academic_year: string;
  group: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  credits: number;
  created_at: string;
  updated_at: string;
}

export interface Semester {
  id: number;
  name: string;
  code: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  unique_id: string;
  name: string;
  email: string | null;
  password: string;
  role: UserRole;
  department_id: number | null;
  class_id: number | null;
  work_type: string | null;
  schedule: string | null;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: number;
  user_id: number;
  date: string;
  status: AttendanceStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: number;
  user_id: number;
  from_date: string;
  to_date: string;
  reason: string;
  status: LeaveStatus;
  reviewer_id: number | null;
  reviewed_at: string | null;
  comments: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
