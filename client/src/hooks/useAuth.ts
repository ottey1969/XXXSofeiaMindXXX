import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface User {
  id: string;
  email: string;
  credits: number;
  emailVerified: boolean;
}

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        if (response.status === 401) {
          // Check if user is in a registration flow
          const registrationData = localStorage.getItem('pendingRegistration');
          if (registrationData) {
            const userData = JSON.parse(registrationData);
            return {
              id: userData.userId,
              email: userData.email,
              credits: 3,
              emailVerified: false
            };
          }
          return null;
        }
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        return response.json();
      } catch (error) {
        return null;
      }
    },
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user, // Allow access if user exists (registered)
    isVerified: !!user?.emailVerified, // Track verification separately
    error
  };
}

export function useRegister() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest('POST', '/api/auth/register', { email });
      return response.json();
    }
  });
}

export function useVerifyEmail() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (token: string) => {
      const response = await apiRequest('POST', '/api/auth/verify', { token });
      return response.json();
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
      const response = await apiRequest('POST', '/api/auth/logout');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.clear();
    }
  });
}