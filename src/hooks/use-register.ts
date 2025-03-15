// hooks/use-register.ts
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Types for registration data
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// Types for invitation-based registration
export interface InviteRegisterData extends RegisterData {
  token: string;
}

// Response types
export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
}

export interface InviteRegisterResponse {
  userId: string;
  teamId: string;
  teamName: string;
  message: string;
}

/**
 * Custom hook for standard user registration
 */
export function useRegister() {
  const router = useRouter();

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      try {
        const response = await axios.post('/api/auth/register', data);
        return response.data as RegisterResponse;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.error || 'Registration failed');
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Account created successfully!');
      router.push('/login');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create account');
    },
  });

  return {
    register: registerMutation.mutate,
    isPending: registerMutation.isPending,
    error: registerMutation.error,
  };
}

/**
 * Custom hook for handling invitation-based registration
 */
export function useInviteRegister() {
  const router = useRouter();

  const verifyInviteMutation = useMutation({
    mutationFn: async (token: string) => {
      try {
        const response = await axios.get(`/api/auth/invites/verify?token=${token}`);
        return response.data.inviteInfo;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.error || 'Invalid invitation');
        }
        throw error;
      }
    },
  });

  const acceptInviteMutation = useMutation({
    mutationFn: async (data: InviteRegisterData) => {
      try {
        const response = await axios.post('/api/auth/invites/process', data);
        return response.data as InviteRegisterResponse;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.error || 'Failed to process invitation');
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success(`Welcome to ${data.teamName}!`);
      router.push('/login');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to accept invitation');
    },
  });

  return {
    verifyInvite: verifyInviteMutation.mutate,
    isVerifying: verifyInviteMutation.isPending,
    inviteData: verifyInviteMutation.data,
    verifyError: verifyInviteMutation.error,
    
    acceptInvite: acceptInviteMutation.mutate,
    isAccepting: acceptInviteMutation.isPending,
    acceptError: acceptInviteMutation.error,
  };
}