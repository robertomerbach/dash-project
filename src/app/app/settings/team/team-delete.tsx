"use client"

import { Button } from "@/components/ui/button"
import { CardWrapper } from "./card-wrapper"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function TeamDelete() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [deleteText, setDeleteText] = useState("")
  const router = useRouter()

  const handleDelete = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/team`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete team")
      }

      toast.success("Team deleted successfully")
      router.push("/login")
    } catch (error) {
      toast.error("Something went wrong")
      console.error(error)
    } finally {
      setIsLoading(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <CardWrapper
        title="Delete Team"
        content={
          <p className="p-4 text-muted-foreground">
            Permanently delete your team and all of its data
          </p>
        }
        footer={
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete Team
          </Button>
        }
      />
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your team
              and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="delete-confirmation">
                Type <span className="font-mono">delete</span> to confirm
              </Label>
              <Input
                id="delete-confirmation"
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                placeholder="delete"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteText !== "delete" || isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete Team"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}