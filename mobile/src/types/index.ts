// ============================================
// Enums
// ============================================

export type TaskStatus = 'TODO' | 'DOING' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type ProjectRole = 'ADMIN' | 'MEMBER';

// ============================================
// User
// ============================================

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface UserSimple {
  id: number;
  name: string;
  email: string;
}

// ============================================
// Project
// ============================================

export interface ProjectMember {
  id: number;
  user_id: number;
  project_id: number;
  role: ProjectRole;
  user: UserSimple;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  owner_id: number;
  owner: UserSimple;
  members: ProjectMember[];
  created_at: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
}

// ============================================
// Task
// ============================================

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  project_id: number;
  assigned_to: number | null;
  assignee?: UserSimple | null;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  priority?: TaskPriority;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  priority?: TaskPriority;
}

export interface TaskStatusUpdate {
  status: TaskStatus;
}

export interface TaskAssignmentUpdate {
  assigned_to: number | null;
}

// ============================================
// Task History
// ============================================

export type ActionType = 'STATUS_CHANGE' | 'ASSIGNMENT_CHANGE' | 'CREATED' | 'UPDATED';

export interface TaskHistory {
  id: number;
  task_id: number;
  action_type: ActionType;
  old_value: string | null;
  new_value: string | null;
  changed_by: number;
  changer: UserSimple;
  changed_at: string;
}

// ============================================
// Auth
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// ============================================
// API Response (Paginated)
// ============================================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// ============================================
// UI Helpers
// ============================================

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'A Fazer',
  DOING: 'Em Progresso',
  DONE: 'Concluído',
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  TODO: '#6b7280',
  DOING: '#2563eb',
  DONE: '#16a34a',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  LOW: '#6b7280',
  MEDIUM: '#eab308',
  HIGH: '#ef4444',
};

export const ROLE_LABELS: Record<ProjectRole, string> = {
  ADMIN: 'Administrador',
  MEMBER: 'Membro',
};
