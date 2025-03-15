// hooks/api/useTeams.ts
import { 
  useQuery, 
  useMutation, 
  useQueryClient 
} from '@tanstack/react-query';
import axios from 'axios';

// Types based on API response structure
type UserRole = 'OWNER' | 'ADMIN' | 'MEMBER';
type UserStatus = 'PENDING' | 'ACTIVE';
type SiteStatus = 'ACTIVE' | 'INACTIVE';

type UserBasic = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

type Site = {
  id: string;
  name: string;
  url: string;
  status: SiteStatus;
  teamId: string;
  createdAt: string;
  updatedAt: string;
};

type TeamMember = {
  id: string;
  userId: string | null;
  teamId: string;
  role: UserRole;
  status: UserStatus;
  inviteEmail: string | null;
  inviteToken: string | null;
  inviteExpires: string | null;
  createdAt: string;
  updatedAt: string;
  user: UserBasic | null;
};

type Team = {
  id: string;
  name: string;
  allowedDomains: string | null;
  language: string;
  timezone: string;
  autoTimezone: boolean;
  currency: string;
  createdAt: string;
  updatedAt: string;
  subscription: string;
  sites: Site[];
  members: TeamMember[];
};

type TeamMemberWithTeam = {
  id: string;
  userId: string | null;
  teamId: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  team: Team;
};

// Input types for operations
type CreateTeamInput = {
  name: string;
  allowedDomains?: string;
  language?: string;
  timezone?: string;
  currency?: string;
};

type UpdateTeamInput = {
  name: string;
};

// Response types
type CreateTeamResponse = Team & {
  members: TeamMember[];
};

type UpdateTeamResponse = {
  team: Team;
};

// Query key factory
const teamKeys = {
  all: ['teams'] as const,
};

/**
 * Custom hook for team operations
 */
export function useTeams() {
  const queryClient = useQueryClient();
  
  // Query: Get all teams for current user
  const teamsQuery = useQuery({
    queryKey: teamKeys.all,
    queryFn: async () => {
      try {
        const response = await axios.get('/api/users/teams');
        return response.data as TeamMemberWithTeam[];
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.error || 'Failed to fetch teams');
        }
        throw error;
      }
    },
  });
  
  // Mutation: Create team
  const createTeamMutation = useMutation({
    mutationFn: async (data: CreateTeamInput) => {
      try {
        const response = await axios.post('/api/users/teams', data);
        return response.data as CreateTeamResponse;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.error || 'Failed to create team');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
  
  // Mutation: Update team name
  // Note: Updates the first team where user is OWNER or ADMIN
  const updateTeamMutation = useMutation({
    mutationFn: async (data: UpdateTeamInput) => {
      try {
        const response = await axios.patch('/api/users/teams', data);
        return response.data as UpdateTeamResponse;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.error || 'Failed to update team');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
  
  // Mutation: Delete team
  // Note: Deletes the first team where user is OWNER or ADMIN
  const deleteTeamMutation = useMutation({
    mutationFn: async () => {
      try {
        await axios.delete('/api/users/teams');
        return true;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.error || 'Failed to delete team');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
  
  return {
    // Teams data and loading states
    teams: teamsQuery.data,
    isLoading: teamsQuery.isLoading,
    isError: teamsQuery.isError,
    error: teamsQuery.error,
    
    // Team operations
    createTeam: createTeamMutation.mutate,
    isCreating: createTeamMutation.isPending,
    createError: createTeamMutation.error,
    
    updateTeam: updateTeamMutation.mutate,
    isUpdating: updateTeamMutation.isPending,
    updateError: updateTeamMutation.error,
    
    deleteTeam: deleteTeamMutation.mutate,
    isDeleting: deleteTeamMutation.isPending,
    deleteError: deleteTeamMutation.error,
    
    // Refetch function
    refetch: teamsQuery.refetch,
  };
}
