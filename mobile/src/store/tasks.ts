import { create } from 'zustand';
import { api, ApiError } from '../lib/api';
import { 
  Task, 
  TaskCreate, 
  TaskUpdate, 
  TaskStatus, 
  TaskHistory,
  PaginatedResponse 
} from '../types';

interface TaskFilters {
  status?: TaskStatus;
  priority?: string;
  assigned_to?: number;
}

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  taskHistory: TaskHistory[];
  filters: TaskFilters;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadTasks: (projectId: number) => Promise<void>;
  loadTask: (taskId: number) => Promise<void>;
  loadTaskHistory: (taskId: number) => Promise<void>;
  createTask: (projectId: number, data: TaskCreate) => Promise<Task>;
  updateTask: (taskId: number, data: TaskUpdate) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  changeStatus: (taskId: number, status: TaskStatus) => Promise<void>;
  assignTask: (taskId: number, userId: number | null) => Promise<void>;
  setFilters: (filters: TaskFilters) => void;
  clearFilters: () => void;
  clearError: () => void;
  clearCurrentTask: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  currentTask: null,
  taskHistory: [],
  filters: {},
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),
  clearCurrentTask: () => set({ currentTask: null, taskHistory: [] }),
  clearFilters: () => set({ filters: {} }),
  setFilters: (filters: TaskFilters) => set({ filters }),

  loadTasks: async (projectId: number) => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const params = new URLSearchParams({ size: '100' });
      
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.assigned_to) params.append('assigned_to', filters.assigned_to.toString());
      
      const response = await api.get<PaginatedResponse<Task>>(
        `/projects/${projectId}/tasks?${params.toString()}`
      );
      set({ tasks: response.data.items });
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.detail });
    } finally {
      set({ isLoading: false });
    }
  },

  loadTask: async (taskId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Task>(`/tasks/${taskId}`);
      set({ currentTask: response.data });
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.detail });
    } finally {
      set({ isLoading: false });
    }
  },

  loadTaskHistory: async (taskId: number) => {
    try {
      const response = await api.get<TaskHistory[]>(`/tasks/${taskId}/history`);
      set({ taskHistory: response.data });
    } catch (error) {
      const apiError = error as ApiError;
      console.warn('Erro ao carregar histórico:', apiError.detail);
    }
  },

  createTask: async (projectId: number, data: TaskCreate) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<Task>(`/projects/${projectId}/tasks`, data);
      const newTask = response.data;
      set((state) => ({ 
        tasks: [...state.tasks, newTask] 
      }));
      return newTask;
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.detail });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTask: async (taskId: number, data: TaskUpdate) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch<Task>(`/tasks/${taskId}`, data);
      const updatedTask = response.data;
      set((state) => ({
        tasks: state.tasks.map((t) => 
          t.id === taskId ? updatedTask : t
        ),
        currentTask: state.currentTask?.id === taskId 
          ? updatedTask 
          : state.currentTask,
      }));
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.detail });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTask: async (taskId: number) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/tasks/${taskId}`);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId),
        currentTask: state.currentTask?.id === taskId 
          ? null 
          : state.currentTask,
      }));
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.detail });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  changeStatus: async (taskId: number, status: TaskStatus) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch<Task>(`/tasks/${taskId}/status`, { status });
      const updatedTask = response.data;
      set((state) => ({
        tasks: state.tasks.map((t) => 
          t.id === taskId ? updatedTask : t
        ),
        currentTask: state.currentTask?.id === taskId 
          ? updatedTask 
          : state.currentTask,
      }));
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.detail });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  assignTask: async (taskId: number, userId: number | null) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch<Task>(`/tasks/${taskId}/assignment`, { 
        assigned_to: userId 
      });
      const updatedTask = response.data;
      set((state) => ({
        tasks: state.tasks.map((t) => 
          t.id === taskId ? updatedTask : t
        ),
        currentTask: state.currentTask?.id === taskId 
          ? updatedTask 
          : state.currentTask,
      }));
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.detail });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
