// hooks/api/useTeams.ts
import { 
  useQuery, 
  useMutation, 
  useQueryClient 
} from '@tanstack/react-query';
import axios from 'axios';

// Types based on API response structure
type UserRole = 'OWNER' | 'ADMIN' | 'MEMBER';
type UserStatus = 'PENDING' | 'EXPIRED' | 'ACTIVE';
type SiteStatus = 'ACTIVE' | 'INACTIVE';
type SubscriptionPlan = 'BASIC' | 'INTERMEDIATE' | 'UNLIMITED';
type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'EXPIRED';

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

type Subscription = {
  id: string;
  teamId: string;
  plan: SubscriptionPlan;
  maxAdsSites: number;
  maxMetricSites: number;
  startDate: string;
  endDate: string | null;
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
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
  subscription: Subscription | null;
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
  autoTimezone?: boolean;
  currency?: string;
};

type UpdateTeamInput = {
  id: string;
  name?: string;
  allowedDomains?: string;
  language?: string;
  timezone?: string;
  autoTimezone?: boolean;
  currency?: string;
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
  lists: () => [...teamKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...teamKeys.lists(), { ...filters }] as const,
  details: () => [...teamKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamKeys.details(), id] as const,
};

/**
 * Custom hook for team operations
 */
export function useTeams() {
  const queryClient = useQueryClient();
  
  // Query: Get all teams for current user
  const teamsQuery = useQuery({
    queryKey: teamKeys.lists(),
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
  
  // Query: Get single team by ID
  const getTeam = (teamId: string) => {
    return useQuery({
      queryKey: teamKeys.detail(teamId),
      queryFn: async () => {
        try {
          const response = await axios.get(`/api/teams/${teamId}`);
          return response.data as Team;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.error || 'Failed to fetch team');
          }
          throw error;
        }
      },
      enabled: !!teamId,
    });
  };
  
  // Mutation: Create team
  const createTeamMutation = useMutation({
    mutationFn: async (data: CreateTeamInput) => {
      try {
        const response = await axios.post('/api/teams', data);
        return response.data as CreateTeamResponse;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.error || 'Failed to create team');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
  
  // Mutation: Update team
  const updateTeamMutation = useMutation({
    mutationFn: async (data: UpdateTeamInput) => {
      try {
        const response = await axios.patch(`/api/teams/${data.id}`, data);
        return response.data as UpdateTeamResponse;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.error || 'Failed to update team');
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      if (data.team?.id) {
        queryClient.invalidateQueries({ queryKey: teamKeys.detail(data.team.id) });
      }
    },
  });
  
  // Mutation: Delete team
  const deleteTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      try {
        await axios.delete(`/api/teams/${teamId}`);
        return teamId;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.error || 'Failed to delete team');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });

  // Mutation: Invite team member
  const inviteTeamMemberMutation = useMutation({
    mutationFn: async ({ teamId, email, role }: { teamId: string; email: string; role: UserRole }) => {
      try {
        const response = await axios.post(`/api/teams/${teamId}/members/invite`, { email, role });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.error || 'Failed to invite team member');
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(variables.teamId) });
    },
  });
  
  return {
    // Teams data and loading states
    teams: teamsQuery.data,
    isLoading: teamsQuery.isLoading,
    isError: teamsQuery.isError,
    error: teamsQuery.error,
    
    // Single team getter
    getTeam,
    
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
    
    // Team member operations
    inviteTeamMember: inviteTeamMemberMutation.mutate,
    isInviting: inviteTeamMemberMutation.isPending,
    inviteError: inviteTeamMemberMutation.error,
    
    // Refetch function
    refetch: teamsQuery.refetch,
  };
}