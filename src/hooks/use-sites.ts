// hooks/api/useSites.ts
import { 
  useQuery, 
  useMutation, 
  useQueryClient 
} from '@tanstack/react-query';
import axios from 'axios';

// Types based on schema
export interface Site {
  id: string;
  name: string;
  url: string;
  status: 'ACTIVE' | 'INACTIVE';
  teamId: string;
  createdAt: string;
  updatedAt: string;
}

interface SiteUser {
  id: string;
  userId: string;
  siteId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  createdAt: string;
  updatedAt: string;
  site: Site;
}

interface CreateSiteInput {
  name: string;
  url: string;
  teamId: string;
}

interface UpdateSiteInput {
  id: string;
  name?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

// Query key factory
const siteKeys = {
  all: ['sites'] as const,
  lists: () => [...siteKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...siteKeys.lists(), { ...filters }] as const,
  details: () => [...siteKeys.all, 'detail'] as const,
  detail: (id: string) => [...siteKeys.details(), id] as const,
};

/**
 * Hook for fetching and managing sites
 */
export function useSites(teamId?: string) {
  const queryClient = useQueryClient();
  
  // Get sites for current user
  const sitesQuery = useQuery({
    queryKey: siteKeys.list({ teamId }),
    queryFn: async () => {
      try {
        const url = teamId 
          ? `/api/teams/${teamId}/sites` 
          : '/api/sites';
          
        const response = await axios.get(url);
        return response.data.sites as Site[];
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.error || 'Failed to fetch sites');
        }
        throw error;
      }
    },
    enabled: !teamId || !!teamId,
  });

  // Create a new site
  const createSiteMutation = useMutation({
    mutationFn: async (data: CreateSiteInput) => {
      try {
        const url = `/api/teams/${data.teamId}/sites`;
        const response = await axios.post(url, data);
        return response.data as Site;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.error || 'Failed to create site');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteKeys.lists() });
    },
  });

  // Update an existing site
  const updateSiteMutation = useMutation({
    mutationFn: async (data: UpdateSiteInput) => {
      try {
        const response = await axios.patch(`/api/teams/${teamId}/sites/${data.id}`, data);
        return response.data as Site;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.error || 'Failed to update site');
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: siteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: siteKeys.detail(data.id) });
    },
  });

  // Delete a site
  const deleteSiteMutation = useMutation({
    mutationFn: async (siteId: string) => {
      try {
        await axios.delete(`/api/teams/${teamId}/sites/${siteId}`);
        return siteId;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.error || 'Failed to delete site');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteKeys.lists() });
    },
  });

  return {
    // Sites data and loading states
    sites: sitesQuery.data || [],
    isLoading: sitesQuery.isLoading,
    isError: sitesQuery.isError,
    error: sitesQuery.error,
    
    // Site operations
    createSite: createSiteMutation.mutate,
    isCreating: createSiteMutation.isPending,
    createError: createSiteMutation.error,
    
    updateSite: updateSiteMutation.mutate,
    isUpdating: updateSiteMutation.isPending,
    updateError: updateSiteMutation.error,
    
    deleteSite: deleteSiteMutation.mutate,
    isDeleting: deleteSiteMutation.isPending,
    deleteError: deleteSiteMutation.error,
    
    // Refetch function
    refetch: sitesQuery.refetch,
  };
}