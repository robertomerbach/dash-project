import useSWR from "swr"

export type Team = {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

type TeamResponse = {
  team: Team
}

async function getTeam() {
  const response = await fetch(`/api/team`)
  if (!response.ok) throw new Error("Failed to fetch team")
  return response.json()
}

export function useTeam() {
  const { data, error, isLoading, mutate } = useSWR<TeamResponse>(
    `/api/team`,
    getTeam
  )

  return {
    team: data?.team,
    isLoading,
    isError: error,
    mutate
  }
}