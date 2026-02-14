"use client";

import useSWR from "swr";
import { useCallback } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin" | "warehouse" | "logistics";
  trustScore?: number;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useAuth() {
  const { data, error, isLoading, mutate } = useSWR("/api/auth/session", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const user: User | null = data?.user || null;

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      await mutate();
      return json.user;
    },
    [mutate]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string, role?: string) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      await mutate();
      return json.user;
    },
    [mutate]
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    await mutate({ user: null }, false);
  }, [mutate]);

  return {
    user,
    isLoading,
    isError: !!error,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    mutate,
  };
}
