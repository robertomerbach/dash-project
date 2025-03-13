import useSWR from "swr"

export type User = {
  id: string
  name: string
  image: string
  email: string
  role: string
  status: string
  createdAt: Date
  updatedAt: Date
}

type UsersResponse = {
  users: User[]
}

async function getUsers() {
  const response = await fetch(`/api/users`)
  if (!response.ok) throw new Error("Failed to fetch users")
  return response.json()
}

export function useUsers() {
  const { data, error, isLoading, mutate } = useSWR<UsersResponse>(
    `/api/users`,
    getUsers
  )

  return {
    users: data?.users,
    isLoading,
    isError: error,
    mutate
  }
}