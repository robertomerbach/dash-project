// hooks/api/useUser.ts
import { 
  useQuery, 
  useMutation, 
  useQueryClient 
} from '@tanstack/react-query';
import axios from 'axios';

// Types for user data based on API response
type Team = {
  id: string;
  name: string;
};

type Site = {
  id: string;
  name: string;
  url: string;
};

type TeamMember = {
  team: Team;
};

type SiteUser = {
  site: Site;
};

type User = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  subscription: any;
  teamMembers: TeamMember[];
  siteUsers: SiteUser[];
};

// Query key factory for consistent keys
const userKeys = {
  all: ['users'] as const,
  details: (id: string) => [...userKeys.all, id] as const,
};

/**
 * Custom hook for fetching and managing a user by ID
 */
export function useUser(id: string) {
  const queryClient = useQueryClient();
  
  // Query for getting user data
  const userQuery = useQuery({
    queryKey: userKeys.details(id),
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/users/${id}`);
        return response.data as User;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.error || 'Failed to fetch user');
        }
        throw error;
      }
    },
    enabled: !!id,
  });
  
  // Mutation for deleting user
  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await axios.delete(`/api/users/${id}`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.error || 'Failed to delete user');
        }
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
  
  return {
    // User data and loading states
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    isError: userQuery.isError,
    error: userQuery.error,
    
    // Delete functionality
    deleteUser: deleteUserMutation.mutate,
    isDeleting: deleteUserMutation.isPending,
    deleteError: deleteUserMutation.error,
    
    // Refetch function
    refetch: userQuery.refetch
  };
}