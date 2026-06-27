export type Role = 'ADMIN' | 'MENTOR' | 'INTERN';
export type UserStatus = 'INVITED' | 'ONBOARDING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CONVERTED' | 'REMOVED';
export type ContentType = 'VIDEO' | 'TEXT' | 'PDF' | 'CODE' | 'NOTEBOOK';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: UserStatus;
  avatarUrl: string | null;
  forcePasswordChange: boolean;
  batchId: string | null;
  primaryMentorId: string | null;
  createdAt: string;
}

export interface Batch {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  _count?: { users: number };
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  weekNumber: number;
  order: number;
  _count?: { modules: number };
  modules?: Module[];
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  order: number;
  estimatedDuration: number | null;
  prerequisiteModuleId: string | null;
  _count?: { lessons: number };
  lessons?: Lesson[];
  course?: { id: string; title: string; weekNumber: number };
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  contentType: ContentType;
  content: string | null;
  fileUrl: string | null;
  duration: number | null;
  order: number;
}

export interface InternAccess {
  id: string;
  internId: string;
  entityType: 'MODULE' | 'LESSON' | 'FILE';
  entityId: string;
  locked: boolean;
  unlockedAt: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
