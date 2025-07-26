import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface User {
  id: string;
  email: string;
  credits: number;
  emailVerified: boolean;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user?.emailVerified,
    error
  };
}

export function useRegister() {
  return useMutation({
    mutationFn: async (email: string) => {
      return apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });
}

export function useVerifyEmail() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (token: string) => {
      return apiRequest('/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ token }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    }
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return apiRequest('/api/auth/logout', {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.clear();
    }
  });
}