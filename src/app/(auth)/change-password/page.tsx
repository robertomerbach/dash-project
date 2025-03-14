"use client"

import React from "react"
import Link from "next/link"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { redirect, useRouter } from "next/navigation"
import { useState, use } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { Eye, EyeOff } from "lucide-react"

// Schema de validação
const passwordSchema = z.object({
  password: z.string().min(8, "The password must be at least 8 characters long"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "The passwords do not match",
  path: ["confirmPassword"],
})

type PasswordFormValues = z.infer<typeof passwordSchema>

interface Props {
  searchParams: Promise<{
    token?: string
    type?: string
  }>
}

export default function ChangePasswordPage({ searchParams }: Props) {
  const params = use(searchParams)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Validar token ao carregar a página
  React.useEffect(() => {
    async function validateToken() {
      if (!params.token) {
        toast.error("No reset token provided")
        setTimeout(() => {
          router.push("/login")
        }, 2000)
        return
      }

      try {
        const response = await fetch("/api/auth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: params.token,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          toast.error(data.error || "Invalid or expired reset link")
          setTimeout(() => {
            router.push("/login")
          }, 2000)
          return
        }

        setIsTokenValid(true)
      } catch (error) {
        toast.error("Error validating reset link. Please try again.")
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [params.token, router])

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: PasswordFormValues) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: params.token,
          password: values.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error updating password")
      }

      toast.success("Password updated successfully! Redirecting to login...")
      
      // Limpa o formulário
      form.reset()
      
      // Redireciona após 2 segundos
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("Error updating password. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Mostrar loading enquanto valida o token
  if (isValidating) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Validating...</h2>
        <p className="text-muted-foreground">
          Please wait while we validate your reset link.
        </p>
      </div>
    )
  }

  // Se o token não for válido, não mostra o formulário
  if (!isTokenValid) {
    return null
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-center md:text-start text-2xl font-bold">Create new password</h2>
        <p className="text-center md:text-start text-muted-foreground">
          Enter your new password below. The password must be at least 8 characters long.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="password">New password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                       id="password"
                       type={showPassword ? "text" : "password"}
                       placeholder="Enter your new password"
                       autoComplete="new-password"
                       disabled={isLoading}
                       {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 cursor-pointer h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="confirm-password">Confirm password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password again"
                      disabled={isLoading}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 cursor-pointer h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full cursor-pointer" 
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update password"}
          </Button>
        </form>
      </Form>
      <div className="flex items-center justify-center md:justify-start gap-1">
        <span className="text-sm text-muted-foreground">Remember your password?</span>
        <Button variant="link" className="p-0 text-sm" asChild>
          <Link href="/login">Back to login</Link>
        </Button>
      </div>
    </div>
  )
}
