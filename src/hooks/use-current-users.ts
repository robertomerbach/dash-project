// hooks/api/useCurrentUser.ts
import { 
    useQuery, 
    useMutation, 
    useQueryClient 
  } from '@tanstack/react-query';
  import axios from 'axios';
  
  // Types based on API response structure
  type Team = {
    id: string;
    name: string;
    allowedDomains: string | null;
    language: string;
    timezone: string;
    currency: string;
    createdAt: string;
    updatedAt: string;
  };
  
  type TeamMember = {
    id: string;
    userId: string;
    teamId: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    status: 'ACTIVE' | 'PENDING';
    team: Team;
  };
  
  type Subscription = {
    id: string;
    status: 'ACTIVE' | 'INACTIVE' | 'CANCELED';
    planId: string;
    currentPeriodEnd: string;
  };
  
  type User = {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    createdAt: string;
    subscription: Subscription | null;
    teamMembers: TeamMember[];
  };
  
  type UpdateUserInput = {
    name?: string;
    image?: string;
  };
  
  // Query key factory for consistent keys
  const userKeys = {
    me: () => ['user', 'me'] as const,
  };
  
  /**
   * Custom hook for managing the current user's profile
   */
  export function useCurrentUser() {
    const queryClient = useQueryClient();
    
    // Query for getting current user data
    const userQuery = useQuery({
      queryKey: userKeys.me(),
      queryFn: async () => {
        try {
          const response = await axios.get('/api/users/me');
          return response.data as User;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.error || 'Failed to fetch user');
          }
          throw error;
        }
      },
    });
    
    // Mutation for updating user profile
    const updateUserMutation = useMutation({
      mutationFn: async (data: UpdateUserInput) => {
        try {
          const response = await axios.patch('/api/users/me', data);
          return response.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.error || 'Failed to update user');
          }
          throw error;
        }
      },
      onSuccess: (updatedUser) => {
        // Update cached user data with new values
        queryClient.setQueryData(
          userKeys.me(),
          (oldData: User | undefined) => {
            if (!oldData) return oldData;
            
            return {
              ...oldData,
              name: updatedUser.name,
              image: updatedUser.image,
            };
          }
        );
      },
    });
    
    return {
      // User data and loading states
      user: userQuery.data,
      isLoading: userQuery.isLoading,
      isError: userQuery.isError,
      error: userQuery.error,
      
      // Update functionality
      updateUser: updateUserMutation.mutate,
      isUpdating: updateUserMutation.isPending,
      updateError: updateUserMutation.error,
      
      // Refetch function
      refetch: userQuery.refetch,
    };
  }
  