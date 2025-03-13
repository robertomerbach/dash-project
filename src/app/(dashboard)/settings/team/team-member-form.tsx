"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { PlusIcon } from "lucide-react"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

import { CardWrapper } from "@/components/layout/card-wrapper"
import { Modal } from "@/components/layout/modal"
import { RowActions } from "./row-actions"
import { AvatarWrapper } from "@/components/layout/avatar-wrapper"
import { Skeleton } from "@/components/ui/skeleton"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useUsers } from "@/hooks/use-users"
import type { User } from "@/hooks/use-users"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
  role: z.enum(["OWNER", "MEMBER", "ADMIN"])
})

function UsersList({ users, isLoading, currentUserId }: { users: User[]; isLoading: boolean; currentUserId: string }) {
  return (
    <div>
      <div className="relative grid grid-cols-9 gap-2 w-full items-center px-4 pt-8 pb-1">
        <div className="col-span-3 text-sm text-muted-foreground">Name</div>
        <div className="col-span-3 text-sm text-muted-foreground">Email</div>
        <div className="col-span-1 text-sm text-muted-foreground">Role</div>
        <div className="col-span-1 text-sm text-muted-foreground">Status</div>
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

export function TeamMemberForm({ currentUserId }: { currentUserId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { users, isLoading: isFetchingUsers, mutate } = useUsers()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "MEMBER"
    }
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error inviting user")
      }

      await mutate() // Recarrega a lista após adicionar
      form.reset()
      setIsCreateModalOpen(false)
      toast.success("User invited successfully!")
    } catch (error: any) {
      toast.error(error.message || "Error inviting user")
    } finally {
      setIsLoading(false)
    }
  }

  const InviteContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input autoComplete="off" placeholder="Enter the name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="off" placeholder="member@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-2">Role</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value}>
                  <div className="space-y-2"> 
                    <div className="flex items-start gap-2">
                      <RadioGroupItem value="MEMBER" id="member" />
                      <Label htmlFor="member" className="flex flex-col items-start gap-0 cursor-pointer">
                        <div className="text-sm text-foreground">Member</div>
                        <p className="text-sm text-muted-foreground">View metrics and reports.</p>
                      </Label>
                    </div>
                    <div className="flex items-start gap-2">
                      <RadioGroupItem value="ADMIN" id="admin" />
                      <Label htmlFor="admin" className="flex flex-col items-start gap-0 cursor-pointer">
                        <div className="text-sm text-foreground">Admin</div>
                        <p className="text-sm text-muted-foreground">Invite users, update payment and delete the team.</p>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsCreateModalOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Inviting..." : "Invite"}
          </Button>
        </div>
      </form>
    </Form>
  )

  return (
    <>
      <CardWrapper 
        title="Members" 
        action={
          <Button className="gap-1 cursor-pointer" onClick={() => setIsCreateModalOpen(true)}>
            <PlusIcon className="h-4 w-4" />
            Invite Member
          </Button>
        }
        content={<UsersList users={users || []} isLoading={isFetchingUsers} currentUserId={currentUserId} />}
      />

      <Modal
        title="Invite Member"
        description="Add a new member to your team."
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        content={InviteContent}
      />
    </>
  )
}
