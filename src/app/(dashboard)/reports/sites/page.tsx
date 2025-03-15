"use client"

import * as z from "zod"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { PlusIcon, X, Check, Plus } from "lucide-react"
import { createSite, getSites } from "@/lib/actions/site"
import { getTeamUsers, type User } from "@/lib/actions/user"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { use } from "react"
import type { Command as CommandPrimitive } from "cmdk"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { columns, Site } from "./columns"
import { Modal } from "@/components/layout/modal"
import { DataTable } from "./data-table"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "  The name must be at least 2 characters.",
  }),
  url: z.string().url({
    message: "Invalid URL.",
  }),
  users: z.array(z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string().nullable(),
    role: z.enum(["OWNER", "MEMBER", "ADMIN"]).optional()
  }))
})

export default function SitesPage({ params }: { params: Promise<{ teamId: string }> }) {
  const resolvedParams = use(params)
  const { data: session } = useSession()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [sites, setSites] = useState<Site[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      url: "",
      users: []
    }
  })

  useEffect(() => {
    form.setValue("users", selectedUsers)
  }, [selectedUsers, form])

  useEffect(() => {
    if (!isCreateModalOpen) {
      form.reset()
      setSelectedUsers([])
    }
  }, [isCreateModalOpen, form])

  const loadSites = async () => {
    try {
      const data = await getSites(resolvedParams.teamId)
      setSites(data)
    } catch (error) {
      toast.error("Error loading sites")
    }
  }

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true)
      const data = await getTeamUsers(resolvedParams.teamId)
      
      if (data && Array.isArray(data)) {
        setUsers(data)
      }
    } catch (error) {
      toast.error("Error loading users")
    } finally {
      setIsLoadingUsers(false)
    }
  }

  useEffect(() => {
    if (session) {
      loadSites()
      loadUsers()
    }
  }, [session, resolvedParams.teamId])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true)
      const site = await createSite({
        name: values.name,
        url: values.url,
        users: values.users,
        teamId: resolvedParams.teamId
      })
      
      setSites((prev) => [...prev, site])
      setSelectedUsers([])
      form.reset()
      setIsCreateModalOpen(false)
      toast.success("Site created successfully!")
    } catch (error) {
      console.error("Error creating site:", error)
      toast.error("Error creating site")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Sites</h1>
        <Button className="cursor-pointer" onClick={() => setIsCreateModalOpen(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          New Site
        </Button>
      </div>

      <DataTable columns={columns} data={sites} />

      <Modal
        title="New Site"
        description="Add a new site to your team."
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            
            <FormField
              control={form.control}
              name="users"
              render={() => (
                <FormItem>
                  <FormLabel>Users</FormLabel>
                  <FormControl>
                    <div className="flex flex-col gap-2">
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <Plus className="mr-2 h-4 w-4" />
                            Add users
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                          <Command>
                            <CommandInput placeholder="Procurar usuários..." value={search} onValueChange={setSearch} />
                            <CommandList>
                              <CommandEmpty>No users found.</CommandEmpty>
                              <CommandGroup>
                                {isLoadingUsers ? (
                                  <CommandItem>Loading users...</CommandItem>
                                ) : users?.length === 0 ? (
                                  <CommandItem>No users available.</CommandItem>
                                ) : (
                                  users
                                    ?.filter((user) =>
                                      user.name?.toLowerCase().includes(search.toLowerCase())
                                    )
                                    .map((user) => (
                                      <CommandItem
                                        key={user.id}
                                        onSelect={() => {
                                          if (!selectedUsers.some(u => u.id === user.id)) {
                                            setSelectedUsers((prev) => [...prev, user]);
                                          }
                                          setOpen(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedUsers.some(u => u.id === user.id) ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        {user.name}
                                      </CommandItem>
                                    ))
                                )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedUsers.map((user) => (
                            <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
                              <span className="flex flex-col">{user.name}</span>
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => setSelectedUsers((prev) => prev.filter((u) => u.id !== user.id))}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
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
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="cursor-pointer">
                {isLoading ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </Modal>
    </div>
  )
}