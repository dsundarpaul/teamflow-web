"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useLogin, useProfile } from "@/src/hooks/api/auth";
import { useMe } from "@/src/hooks/api/users";
import type { LoginRequest } from "@/src/hooks/api/auth";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useMe();
  const loginMutation = useLogin();

  const login = async (data: LoginRequest) => {
    try {
      const response = await loginMutation.mutateAsync(data);
      queryClient.setQueryData(["users", "me"], response.user);
      router.push("/dashboard");
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("teamflow_token");
    }
    queryClient.clear();
    router.push("/login");
  };

  return {
    user,
    isLoading,
    login,
    isLoggingIn: loginMutation.isPending,
    logout,
  };
}

