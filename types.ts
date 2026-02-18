export enum Role {
  ADMIN = 'ADMIN',
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

export interface Batch {
  id: string;
  name: string;
  instructorId: string;
  studentIds: string[];
  startDate: string;
  endDate: string;
}

export interface Assignment {
  id: string;
  batchId: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string; // Text content or link
  submittedAt: string;
  grade?: number;
  feedback?: string;
  status: 'PENDING' | 'GRADED';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}
