"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { CardWrapper } from "./card-wrapper"
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

  useEffect(() => {
    const fetchTeamName = async () => {
      try {
        setIsFetching(true)
        const response = await fetch('/api/team')
        
        if (!response.ok) {
          throw new Error("Failed to fetch team name")
        }

        const data = await response.json()
        form.setValue('name', data.name)
      } catch (error) {
        toast.error("Failed to load team name")
      } finally {
        setIsFetching(false)
      }
    }

    fetchTeamName()
  }, [form])

  async function onSubmit(values: FormValues) {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/team`, {
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

      toast.success("Nome do time atualizado com sucesso!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao atualizar nome do time")
    } finally {
      setIsLoading(false)
    }
  }

  const NameContent = (
    <div className="p-4">
      {isFetching ? (
        <div className="space-y-2">
          <Skeleton className="h-2 w-12" />
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
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome do time" {...field} />
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
      {isLoading ? "Salvando..." : "Salvar alterações"}
    </Button>
  )

  return (
    <CardWrapper
      title="Nome do Time"
      content={NameContent}
      footer={NameFooter}
    />
  )
}