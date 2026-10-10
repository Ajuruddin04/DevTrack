export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  category?: string | null;
  isDaily: boolean;
  userId: number;
  projectId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';

export interface Project {
  id: number;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  techStack: string[];
  repoUrl?: string | null;
  liveUrl?: string | null;
  userId: number;
  totalTasks?: number;
  completedTasks?: number;
  progressPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

export type JobApplicationStatus =
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface JobApplication {
  id: number;
  company: string;
  role: string;
  location?: string | null;
  salary?: string | null;
  status: JobApplicationStatus;
  applicationDate: string;
  interviewDate?: string | null;
  notes?: string | null;
  jobUrl?: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export type SkillProficiency = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export interface Skill {
  id: number;
  name: string;
  category?: string | null;
  proficiency: SkillProficiency;
  progressPercentage: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  tasks: {
    total: number;
    completed: number;
    pending: number;
    dailyTasksCount: number;
  };
  projects: {
    total: number;
    inProgress: number;
    completed: number;
  };
  jobApplications: {
    total: number;
    applied: number;
    interviews: number;
    offers: number;
  };
  skills: {
    total: number;
    averageProgress: number;
  };
}
