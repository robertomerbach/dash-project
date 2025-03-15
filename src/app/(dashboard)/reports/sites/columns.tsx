"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

import { type Site as SiteType } from "@/lib/actions/site"
import { type User } from "@/lib/actions/user"

import { ColumnHeader } from "./columns-header"
import { RowActions } from "./row-actions"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

export type Site = SiteType

export const columns: ColumnDef<Site>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <ColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "url",
    header: ({ column }) => (
      <ColumnHeader column={column} title="URL" />
    ),
    cell: ({ row }) => (
      <div className="group flex items-center flex-row gap-2">
        {row.getValue("url")}
        <Link href={row.getValue("url")} className="text-muted-foreground opacity-0 hover:opacity-100 hover:text-primary group-hover:opacity-100 transition-opacity duration-300" rel="noopener noreferrer nofollow" target="_blank">
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "users",
    header: ({ column }) => (
      <ColumnHeader column={column} title="Users" />
    ),
    cell: ({ row }) => {
      const users = row.getValue("users") as User[]
      return (
        <div className="flex flex-wrap gap-1">
          {users.map((user) => (
            <TooltipProvider key={user.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-6 w-6 cursor-default">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback>{user.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <span>{user.name}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )
    },
    enableHiding: true,
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <RowActions row={row} />,
  },
] 