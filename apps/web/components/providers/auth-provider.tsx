"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { User } from "@/types/api";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (input: { email: string; password: string }) => Promise<User>;
  signup: (input: { name: string; email: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data } = await api.get<{ user: User }>("/auth/me");
      return data.user;
    }
  });

  const loginMutation = useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const { data } = await api.post<{ user: User }>("/auth/login", input);
      return data.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["auth", "me"], user);
    }
  });

  const signupMutation = useMutation({
    mutationFn: async (input: { name: string; email: string; password: string }) => {
      const { data } = await api.post<{ user: User }>("/auth/signup", input);
      return data.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["auth", "me"], user);
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSettled: () => {
      queryClient.clear();
    }
  });

  return (
    <AuthContext.Provider
      value={{
        user: meQuery.data ?? null,
        isLoading: meQuery.isLoading,
        login: loginMutation.mutateAsync,
        signup: signupMutation.mutateAsync,
        logout: logoutMutation.mutateAsync
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
