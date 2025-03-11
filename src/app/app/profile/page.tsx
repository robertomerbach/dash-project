"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Schema de validação para o email
const emailFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

// Schema de validação para o nome
const nameFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
})

type EmailFormValues = z.infer<typeof emailFormSchema>
type NameFormValues = z.infer<typeof nameFormSchema>

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)
  const [isUpdatingName, setIsUpdatingName] = useState(false)

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: session?.user?.email || "",
    },
  })

  const nameForm = useForm<NameFormValues>({
    resolver: zodResolver(nameFormSchema),
    defaultValues: {
      name: session?.user?.name || "",
    },
  })

  async function onEmailSubmit(values: EmailFormValues) {
    setIsUpdatingEmail(true)

    try {
      const response = await fetch("/api/user/update-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      toast.success("Email updated successfully!")
      await update() // Atualiza a sessão
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update email")
    } finally {
      setIsUpdatingEmail(false)
    }
  }

  async function onNameSubmit(values: NameFormValues) {
    setIsUpdatingName(true)

    try {
      const response = await fetch("/api/user/update-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      toast.success("Name updated successfully!")
      await update() // Atualiza a sessão
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update name")
    } finally {
      setIsUpdatingName(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Avatar e Nome */}
      <Card>
        <CardHeader>
          <CardTitle>Your photo</CardTitle>
          <CardDescription>
            This is your profile photo that will be shown across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <Button variant="outline">Change photo</Button>
        </CardContent>
      </Card>

      {/* Nome */}
      <Card>
        <CardHeader>
          <CardTitle>Your name</CardTitle>
          <CardDescription>
            This is your name that will be shown across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...nameForm}>
            <form onSubmit={nameForm.handleSubmit(onNameSubmit)} className="space-y-4">
              <FormField
                control={nameForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isUpdatingName}>
                {isUpdatingName ? "Updating..." : "Update name"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Email */}
      <Card>
        <CardHeader>
          <CardTitle>Your email</CardTitle>
          <CardDescription>
            This is the email associated with your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isUpdatingEmail}>
                {isUpdatingEmail ? "Updating..." : "Update email"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Senha */}
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => window.location.href = "/change-password"}>
            Change password
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}