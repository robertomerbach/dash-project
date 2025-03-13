"use client"

import { NavUser } from "./nav-user"
import { useSession } from "next-auth/react"

import { useTeam } from "@/hooks/use-team"

import { Skeleton } from "@/components/ui/skeleton"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function AppHeader() {
  const { data: session } = useSession()
  const { team, isLoading } = useTeam()

  return (
    <header className="sticky bg-background/60 backdrop-blur z-30 top-0">
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 px-8 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 ">
        <div className="flex items-center gap-2">
          <SidebarTrigger size="icon" className="cursor-pointer -ml-1.5" />
          {isLoading ? (
            <Skeleton className="h-6 w-46" />
          ) : (
            <span>{team?.name || "Team"}</span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <NavUser user={session?.user} />
        </div>
      </div>
    </header>
  )
}