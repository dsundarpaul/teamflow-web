"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi, LoginRequest } from "@/lib/api/auth";
import { usersApi } from "@/lib/api/users";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", "me"],
    queryFn: () => usersApi.getMe(),
    enabled: typeof window !== "undefined" && !!localStorage.getItem("teamflow_token"),
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      localStorage.setItem("teamflow_token", response.access_token);
      queryClient.setQueryData(["user", "me"], response.user);
      router.push("/dashboard");
    },
  });

  const logout = () => {
    localStorage.removeItem("teamflow_token");
    queryClient.clear();
    router.push("/login");
  };

  return {
    user,
    isLoading,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout,
  };
}

