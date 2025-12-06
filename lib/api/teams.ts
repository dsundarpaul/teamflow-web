import { apiClient } from "./client";
import type {
  Team,
  CreateTeamRequest,
  UpdateTeamRequest,
  FindAllTeamsParams,
  TeamsListResponse,
  AddMemberRequest,
  UpdateMemberRoleRequest,
  TeamMember,
} from "@/src/hooks/api/teams/teams.api-types";

export const teamsApi = {
  create: async (data: CreateTeamRequest): Promise<Team> => {
    const response = await apiClient.post<Team>("/teams", data);
    return response.data;
  },
  findAll: async (params?: FindAllTeamsParams): Promise<TeamsListResponse> => {
    const query = params ? new URLSearchParams(params as any).toString() : "";
    const response = await apiClient.get<TeamsListResponse>(
      `/teams${query ? `?${query}` : ""}`
    );
    return response.data;
  },
  findById: async (id: string): Promise<Team> => {
    const response = await apiClient.get<Team>(`/teams/${id}`);
    return response.data;
  },
  update: async (id: string, data: UpdateTeamRequest): Promise<Team> => {
    const response = await apiClient.put<Team>(`/teams/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/teams/${id}`);
    return response.data;
  },
  addMember: async (
    teamId: string,
    data: AddMemberRequest
  ): Promise<TeamMember> => {
    const response = await apiClient.post<TeamMember>(
      `/teams/${teamId}/members`,
      data
    );
    return response.data;
  },
  removeMember: async (
    teamId: string,
    userId: string
  ): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/teams/${teamId}/members/${userId}`
    );
    return response.data;
  },
  updateMemberRole: async (
    teamId: string,
    userId: string,
    data: UpdateMemberRoleRequest
  ): Promise<TeamMember> => {
    const response = await apiClient.patch<TeamMember>(
      `/teams/${teamId}/members/${userId}/role`,
      data
    );
    return response.data;
  },
  leaveTeam: async (teamId: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      `/teams/${teamId}/leave`
    );
    return response.data;
  },
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

