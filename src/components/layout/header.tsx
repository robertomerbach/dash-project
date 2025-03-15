"use client"

import { NavUser } from "./nav-user"
import { useSession } from "next-auth/react"
import { Skeleton } from "@/components/ui/skeleton"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useTeams } from "@/hooks/use-team"

export function AppHeader() {
  const { data: session } = useSession()
  const { teams, isLoading } = useTeams()
  
  // Find the first active team from the user's teams
  const activeTeam = teams?.[0]?.team; // Usando optional chaining para evitar erro se teams for undefined

  return (
    <header className="sticky bg-background/60 backdrop-blur z-30 top-0">
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 px-8 border-b transition-[width,height] ease-linear">
        <div className="flex items-center gap-2">
          <SidebarTrigger size="icon" className="cursor-pointer -ml-1.5" />
          {isLoading ? (
            <Skeleton className="h-6 w-46" />
          ) : (
            <span>{activeTeam?.name || "Team"}</span> // Exibe "Team" se activeTeam for undefined
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <NavUser user={session?.user} />
        </div>
      </div>
    </header>
  )
}
