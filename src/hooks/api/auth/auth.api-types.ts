import type { User } from "../users/users.api-types";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface UserProfile {
  userId: string;
  email: string;
}

