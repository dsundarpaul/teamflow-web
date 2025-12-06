import { apiClient } from "./client";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  FindAllUsersParams,
} from "@/src/hooks/api/users/users.api-types";

export const usersApi = {
  create: async (data: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post<User>("/users", data);
    return response.data;
  },
  findAll: async (params: FindAllUsersParams): Promise<User[]> => {
    const query = new URLSearchParams(params as any).toString();
    const response = await apiClient.get<User[]>(`/users?${query}`);
    return response.data;
  },
  findById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },
  update: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.put<User>(`/users/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<User> => {
    const response = await apiClient.delete<User>(`/users/${id}`);
    return response.data;
  },
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>("/users/me");
    return response.data;
  },
};

