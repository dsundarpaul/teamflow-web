"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";

export function useProtectedRoute() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("teamflow_token") : null;
    
    if (!isLoading && !user && !token) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  return { user, isLoading };
}

