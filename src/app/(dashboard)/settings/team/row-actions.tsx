"use client"

import { useState } from "react"
import { toast } from "sonner"
import { MoreVertical } from "lucide-react"

import { User } from "@/hooks/use-users"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"


interface RowActionsProps {
  user: User
  currentUserId: string
}

export function RowActions({ user, currentUserId }: RowActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLeaveTeam = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error leaving team")
      }

      toast.success("Left team successfully")
    } catch (error: any) {
      console.error("Error details:", error)
      toast.error(error.message || "Error leaving team")
    } finally {
      setIsLoading(false)
      setShowDeleteDialog(false)
    }
  }

  const handleCancelInvite = async () => {
    // Implementar a lógica para cancelar o convite
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted cursor-pointer float-end">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {user.id === currentUserId ? (
            <DropdownMenuItem className="cursor-pointer">
              <a href={`/profile`}>View Profile</a>
            </DropdownMenuItem>
          ) : null}
          {user.status === "PENDING" ? (
            <DropdownMenuItem className="cursor-pointer" onClick={handleCancelInvite}>
              Cancel Invite
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem className="cursor-pointer" onClick={() => setShowDeleteDialog(true)}>
              {user.role === "MEMBER" ? "Remove Member" : "Leave Team"}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {user.role === "MEMBER" ? `This will permanently remove ${user.name} from your team.` : `You will leave the team.`}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveTeam}
              disabled={isLoading}
              className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Removing..." : user.role === "MEMBER" ? "Remove Member" : "Leave Team"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 