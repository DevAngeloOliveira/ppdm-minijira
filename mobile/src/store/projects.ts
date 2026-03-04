import { create } from 'zustand';
import { api, ApiError } from '../lib/api';
import { Project, ProjectCreate, ProjectUpdate, PaginatedResponse, ProjectRole } from '../types';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadProjects: () => Promise<void>;
  loadProject: (id: number) => Promise<void>;
  createProject: (data: ProjectCreate) => Promise<Project>;
  updateProject: (id: number, data: ProjectUpdate) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  addMember: (projectId: number, userId: number, role: ProjectRole) => Promise<void>;
  removeMember: (projectId: number, userId: number) => Promise<void>;
  clearError: () => void;
  clearCurrentProject: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),
  clearCurrentProject: () => set({ currentProject: null }),

  loadProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<PaginatedResponse<Project>>('/projects?size=100');
      set({ projects: response.data.items });
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.detail });
    } finally {
      set({ isLoading: false });
    }
  },

  loadProject: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Project>(`/projects/${id}`);
      set({ currentProject: response.data });
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.detail });
    } finally {
      set({ isLoading: false });
    }
  },

  createProject: async (data: ProjectCreate) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<Project>('/projects', data);
      const newProject = response.data;
      set((state) => ({ 
        projects: [...state.projects, newProject] 
      }));
      return newProject;
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.detail });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProject: async (id: number, data: ProjectUpdate) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch<Project>(`/projects/${id}`, data);
      const updatedProject = response.data;
      set((state) => ({
        projects: state.projects.map((p) => 
          p.id === id ? updatedProject : p
        ),
        currentProject: state.currentProject?.id === id 
          ? updatedProject 
          : state.currentProject,
      }));
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.detail });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteProject: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/projects/${id}`);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject: state.currentProject?.id === id 
          ? null 
          : state.currentProject,
      }));
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.detail });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  addMember: async (projectId: number, userId: number, role: ProjectRole) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/projects/${projectId}/members`, { user_id: userId, role });
      // Recarregar projeto para obter membros atualizados
      await get().loadProject(projectId);
      await get().loadProjects();
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.detail });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  removeMember: async (projectId: number, userId: number) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/projects/${projectId}/members/${userId}`);
      // Recarregar projeto para obter membros atualizados
      await get().loadProject(projectId);
      await get().loadProjects();
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.detail });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
