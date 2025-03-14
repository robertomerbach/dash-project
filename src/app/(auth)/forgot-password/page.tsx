"use client"

import Link from "next/link"
import { useState, use } from "react"
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

// Validation schema
const emailSchema = z.object({
  email: z.string().email("Enter a valid email"),
})

type EmailFormValues = z.infer<typeof emailSchema>

interface Props {
  searchParams: Promise<{
    email?: string
  }>
}

export default function ForgotPasswordPage({ searchParams }: Props) {
  const params = use(searchParams)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: params.email || "",
    },
  })

  async function onSubmit(values: EmailFormValues) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
        }),
      })

      if (!response.ok) {
        throw new Error("Error sending the recovery email")
      }

      toast.success(
        "If there is an account with this email, you will receive the recovery instructions."
      )
      
      // Clear the form
      form.reset()
    } catch (error) {
      toast.error(
        "It was not possible to send the recovery email. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-center md:text-start text-2xl font-bold">Reset your password</h2>
        <p className="text-center md:text-start text-muted-foreground">
          Include the email address associated with your account and we'll send you an email with instructions to reset your password.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="nome@exemplo.com"
                    disabled={isLoading}
                    {...field}
                  />
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
            {isLoading ? "Sending..." : "Send instructions"}
          </Button>
        </form>
      </Form>

      <div className="flex items-center justify-center md:justify-start gap-1">
        <span className="text-sm text-muted-foreground">Remember your password?</span>
        <Button variant="link" className="p-0 text-sm" asChild>
          <Link href="/login">Back to login</Link>
        </Button>
      </div>

      <p className="text-center md:text-start text-sm text-muted-foreground [&_a]:underline [&_a]:hover:text-primary">
        If you have any issues accessing your account, please contact{" "}
        <Link href="mailto:support@resend.com">
          support@resend.com
        </Link>
      </p>
    </div>
  )
}
