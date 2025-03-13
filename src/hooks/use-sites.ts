import useSWR from "swr"

export interface Site {
  id: string
  name: string
  url: string
  status: string
  monitorsCount: number
  openIncidentsCount: number
}

interface SitesResponse {
  sites: Site[]
}

// Hook reutilizável para buscar dados dos sites
export function useSites() {
  const { data, error, isLoading, mutate } = useSWR<SitesResponse>(
    `/api/sites`,
    async (url: any) => {
      const res = await fetch(url, {
        credentials: "include" // Incluir cookies na requisição
      })
      if (!res.ok) {
        throw new Error("Failed to fetch sites")
      }
      return res.json()
    }
  )

  return {
    data: data?.sites ?? [],
    isLoading,
    isError: error,
    mutate
  }
}
