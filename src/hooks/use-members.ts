import useSWR from "swr"

export type Member = {
  id: string
  name: string
  image: string
  email: string
  role: string
  status: string
  createdAt: Date
  updatedAt: Date
}

type MembersResponse = {
  members: Member[]
}

async function getMembers() {
  const response = await fetch(`/api/team/members`)
  if (!response.ok) throw new Error("Failed to fetch team")
  return response.json()
}

export function useMembers() {
  const { data, error, isLoading, mutate } = useSWR<MembersResponse>(
    `/api/team/members`,
    getMembers
  )

  return {
    members: data?.members,
    isLoading,
    isError: error,
    mutate
  }
}