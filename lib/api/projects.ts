import { apiClient } from "./client";

export interface Project {
  id: string;
  name: string;
  description?: string;
  teamId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  teamId: string;
}

export const projectsApi = {
  listProjects: async (teamId: string): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>(`/teams/${teamId}/projects`);
    return response.data;
  },
  getProject: async (projectId: string): Promise<Project> => {
    const response = await apiClient.get<Project>(`/projects/${projectId}`);
    return response.data;
  },
  createProject: async (data: CreateProjectRequest): Promise<Project> => {
    const response = await apiClient.post<Project>("/projects", data);
    return response.data;
  },
};

