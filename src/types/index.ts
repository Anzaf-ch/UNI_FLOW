export type UserRole = 'admin' | 'teacher' | 'student';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  departmentId?: string;
  bio?: string;
  facebookUrl?: string;
  phone?: string;
  createdAt?: string;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  subject: string;
  status: 'active' | 'on_leave' | 'inactive';
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  credits: number;
  teacherId: string;
  semester: number;
}

export interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  score: number;
  maxScore: number;
  coefficient: number;
  term: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  method: 'cash' | 'mobile_money' | 'card';
  status: 'completed';
  type: 'income' | 'expense';
  category: 'tuition' | 'salary' | 'bonus' | 'other';
  studentInfo?: {
    name: string;
    matricule: string;
    filiere: string;
    paymentType: 'monthly' | 'trimester' | 'annual' | 'other';
  };
  staffInfo?: {
    name: string;
    position: string;
    baseSalary: number;
    bonus: number;
    deductions: number;
    notes?: string;
  };
  createdAt: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  matricule: string;
  classe: string;
  filiere: string;
  birthDate?: string;
  birthPlace?: string;
  address?: string;
  status: 'active' | 'suspended' | 'graduated';
  createdAt: string;
}

export interface ScheduleSlot {
  id: string;
  courseId?: string;
  subject: string;
  teacherName: string;
  filiere: string;
  classe: string;
  dayOfWeek: number; // 0-6
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  roomId: string;
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  file: string; // base64 or blob URL
  fileName: string;
  type: 'pdf' | 'doc' | 'docx';
  createdAt: string;
  size: number;
  favorite?: boolean;
}

export interface Annotation {
  id: string;
  bookId: string;
  type: 'highlight' | 'underline';
  text: string;
  color?: string;
  createdAt: string;
  selector?: string;
  index?: number;
}

export interface Chapter {
  id: string;
  title: string;
  elementId?: string;
  pageNumber?: number;
}
