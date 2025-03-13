"use client"

import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

import { RowActions } from "./row-actions"
import { AvatarWrapper } from "@/components/layout/avatar-wrapper"
import { Skeleton } from "@/components/ui/skeleton"
import { Site } from "@/hooks/use-sites"

function SitesList({ sites, isLoading, currentUserId }: { sites: Site[]; isLoading: boolean; currentUserId: string }) {
  return (
    <div>
      <div className="relative grid grid-cols-9 gap-2 w-full items-center px-4 pt-8 pb-1">
        <div className="col-span-3 text-sm text-muted-foreground">Name</div>
        <div className="col-span-3 text-sm text-muted-foreground">URL</div>
        <div className="col-span-1 text-sm text-muted-foreground">Users</div>
        <div className="col-span-1 text-sm text-muted-foreground">Ad Accounts</div>
        <div className="col-span-1"></div>
      </div>

      {isLoading ? (
        <div className="divide-slate-6 grid divide-y">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="relative grid grid-cols-9 gap-2 w-full items-center p-4">
              <div className="col-span-3 flex items-center gap-2">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex flex-col">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-20 mt-1" />
                </div>
              </div>
              <div className="col-span-3">
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="col-span-1">
                <Skeleton className="h-6 w-16 rounded" />
              </div>
              <div className="col-span-1">
                <Skeleton className="h-6 w-16 rounded" />
              </div>
              <div className="col-span-1">
                <Skeleton className="h-6 w-6 rounded float-end" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-slate-6 grid divide-y">
          {users?.map((user) => (
            <div key={user.id} className="relative grid grid-cols-11 gap-2 w-full items-center p-4">
              <div className="col-span-3 flex items-center gap-2">
                <AvatarWrapper name={user.name || ""} image={user.image || ""} />
                <div className="flex flex-col">
                  <span className="text-sm">{user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {user.status === "PENDING" ? "Invited" : "Joined"} on {format(new Date(user.createdAt || new Date()), "dd/MM/yyyy")}
                  </span>
                </div>
              </div>
              <div className="col-span-3 text-sm">{user.email}</div>
              <div className="col-span-2">
                <Badge variant="outline">
                  {user.role === "OWNER" ? "Owner" : user.role === "ADMIN" ? "Admin" : "Member"}
                </Badge>
              </div>
              <div className="col-span-2">
                <Badge 
                  variant="default"
                  className={`rounded-sm ${user.status === "PENDING" ? "dark:bg-yellow-100 dark:text-yellow-800 bg-yellow-900 text-yellow-300" : "dark:bg-green-100 dark:text-green-800 bg-green-900 text-green-300"}`}
                >
                  {user.status === "PENDING" ? "Pending" : "Active"}
                </Badge>
              </div>
              <div className="col-span-1">
                <RowActions user={user} currentUserId={currentUserId} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function SitesForm({ currentUserId }: { currentUserId: string }) {
  
  return (
    <>
      

    
    </>
  )
}
