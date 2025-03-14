"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { CardWrapper } from "@/components/layout/card-wrapper"
import { Skeleton } from "@/components/ui/skeleton"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Team name must be at least 2 characters.",
  }),
})

type FormValues = z.infer<typeof formSchema>

export function TeamNameForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })

  const fetchTeamName = useCallback(async () => {
    try {
      setIsFetching(true)
      const response = await fetch('/api/users/teams')
      
      if (!response.ok) {
        throw new Error("Failed to fetch team name")
      }

      const data = await response.json()
      form.setValue('name', data.team.name)
    } catch (error) {
      toast.error("Failed to load team name")
    } finally {
      setIsFetching(false)
    }
  }, [form])

  useEffect(() => {
    fetchTeamName()
  }, [fetchTeamName])

  async function onSubmit(values: FormValues) {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/users/teams'`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update team name")
      }

      toast.success("Team name updated successfully!")
      await fetchTeamName() // Recarrega os dados após salvar
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update team name")
    } finally {
      setIsLoading(false)
    }
  }

  const NameContent = (
    <div className="p-4">
      {isFetching ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the team name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      )}
    </div>
  )

  const NameFooter = (
    <Button type="submit" className="cursor-pointer" disabled={isLoading || isFetching} onClick={form.handleSubmit(onSubmit)}>
      {isLoading ? "Saving..." : "Save changes"}
    </Button>
  )

  return (
    <CardWrapper
      title="Team Name"
      content={NameContent}
      footer={NameFooter}
    />
  )
}