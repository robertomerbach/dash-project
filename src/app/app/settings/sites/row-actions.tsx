"use client"

import { Row } from "@tanstack/react-table"
import { MoreVertical, Pencil, Trash } from "lucide-react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Modal } from "@/components/layout/modal"
import { deleteSite } from "@/lib/site"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { updateSite } from "@/lib/site"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"

const siteSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required"),
    url: z.string().url("Must be a valid URL")
})


interface RowActionsProps<TData> {
  row: Row<TData>
}

export function RowActions<TData>({
  row,
}: RowActionsProps<TData>) {
    const site = siteSchema.parse(row.original)

      const [isEditModalOpen, setIsEditModalOpen] = useState(false)
      const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
      const [isLoading, setIsLoading] = useState(false)
      const form = useForm<z.infer<typeof siteSchema>>({
        resolver: zodResolver(siteSchema),
        defaultValues: {
          name: site.name,
          url: site.url
        }
      })

      const onEdit = async (data: z.infer<typeof siteSchema>) => {
        try {
          setIsLoading(true)
          await updateSite(site.id, data)
          setIsEditModalOpen(false)
          toast.success("Site updated successfully!")
          window.location.reload()
        } catch (error) {
          toast.error("Error updating site")
        } finally {
          setIsLoading(false)
        }
      }

      const onDelete = async () => {
        try {
          setIsLoading(true)
          await deleteSite(site.id)
          setIsDeleteModalOpen(false)
          toast.success("Site deleted successfully!")
          window.location.reload()
        } catch (error) {
          toast.error("Error deleting site")
        } finally {
          setIsLoading(false)
        }
      }

  return (
    <>
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted cursor-pointer float-end"
            >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem className="cursor-pointer" onClick={() => setIsEditModalOpen(true)}>
          <div className="flex items-center justify-between w-full gap-2">
              Edit
              <Pencil className="h-3 w-3" />
          </div>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => setIsDeleteModalOpen(true)}>
          <div className="flex items-center justify-between gap-2 w-full text-destructive">
              Delete
              <Trash className="h-3 w-3 text-destructive" />
          </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Modal
        title="Edit Site"
        description="Edit the site information."
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      >
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onEdit)} className="space-y-4">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                    <Input placeholder="Site name" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
                <FormItem>
                <FormLabel>URL</FormLabel>
                <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <div className="flex justify-end gap-2">
            <Button 
                type="button" 
                variant="outline" 
                className="cursor-pointer"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isLoading}
            >
                Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="cursor-pointer">
                {isLoading ? "Saving..." : "Save"}
            </Button>
            </div>
        </form>
        </Form>
    </Modal>
    
    <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {site.name} from your team.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
   </>
  )
}