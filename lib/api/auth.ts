import { apiClient } from "./client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserProfile,
} from "@/src/hooks/api/auth/auth.api-types";

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/auth/login", data);
    return response.data;
  },
  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      "/auth/register",
      data
    );
    return response.data;
  },
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>("/auth/profile");
    return response.data;
  },
};

