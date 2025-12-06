import { User } from "../users/users.api-types";

export enum TeamRole {
  MEMBER = "MEMBER",
  ADMIN = "ADMIN",
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  createdAt: string;
  updatedAt: string;
  user: Pick<User, "id" | "email" | "username" | "avatar">;
}

export interface Team {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  members: TeamMember[];
}

export interface CreateTeamRequest {
  name: string;
  icon?: string;
  description?: string;
  memberIds?: string[];
}

export interface UpdateTeamRequest {
  name?: string;
  icon?: string;
  description?: string;
}

export interface FindAllTeamsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface TeamsListResponse {
  data: Team[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AddMemberRequest {
  userId: string;
  role?: TeamRole;
}

export interface UpdateMemberRoleRequest {
  role: TeamRole;
}

