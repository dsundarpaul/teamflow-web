import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";
import type {
  LoginRequest,
  RegisterRequest,
  UserProfile,
} from "./auth.api-types";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("teamflow_token", response.access_token);
      }
      queryClient.setQueryData(["users", "me"], response.user);
      queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (response) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("teamflow_token", response.access_token);
      }
      if (response.user) {
        queryClient.setQueryData(["users", "me"], response.user);
      }
      queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
    },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["auth", "profile"],
    queryFn: () => authApi.getProfile(),
    enabled:
      typeof window !== "undefined" &&
      !!localStorage.getItem("teamflow_token"),
    retry: false,
  });
}

