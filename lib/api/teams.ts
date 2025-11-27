import { apiClient } from "./client";

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
}

export const teamsApi = {
  listTeams: async (): Promise<Team[]> => {
    const response = await apiClient.get<Team[]>("/teams");
    return response.data;
  },
  getTeam: async (teamId: string): Promise<Team> => {
    const response = await apiClient.get<Team>(`/teams/${teamId}`);
    return response.data;
  },
  createTeam: async (data: CreateTeamRequest): Promise<Team> => {
    const response = await apiClient.post<Team>("/teams", data);
    return response.data;
  },
};

