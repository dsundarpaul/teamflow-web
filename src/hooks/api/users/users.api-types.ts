export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export interface User {
  id: string;
  email: string;
  username: string;
  avatar: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  username: string;
}

export interface UpdateUserRequest {
  email?: string;
  username?: string;
  avatar?: string;
  role?: Role;
}

export interface FindAllUsersParams {
  page: string;
  limit: string;
  sort: "asc" | "desc";
  role?: Role;
  search?: string;
}

