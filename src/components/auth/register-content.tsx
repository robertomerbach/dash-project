"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EyeOff, Eye } from "lucide-react"
import { useInviteRegister, useRegister } from "@/hooks/use-register"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Alert, AlertDescription } from "../ui/alert"

// Schema for regular registration
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

// Schema for invitation-based registration
const inviteRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email").optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

// Tipagem do formulário
type RegisterSchema = z.infer<typeof registerSchema>
type InviteRegisterSchema = z.infer<typeof inviteRegisterSchema>

interface RegisterContentProps {
  mode: 'create' | 'invite'
  title?: string
  description?: React.ReactNode
  email?: string
  role?: string
  token?: string
  teamId?: string
  teamName?: string
  userName?: string
}

export function RegisterContent({ 
  mode = 'create',
  title = '',
  description = '',
  email = '',
  role = 'user',
  token = '',
  teamId = '',
  teamName= '',
  userName = '',
}: RegisterContentProps) {
  const router = useRouter()
  const { register, isPending: isRegisterPending, error: registerError } = useRegister()
  const { acceptInvite, isAccepting } = useInviteRegister()
  const [error, setError] = React.useState<string | null>(null)

  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  // Escolher esquema com base no modo
  const formSchema = mode === 'create' ? registerSchema : inviteRegisterSchema

  // Create form based on mode
  const form = useForm<RegisterSchema | InviteRegisterSchema>({
    resolver: zodResolver(mode === "create" ? registerSchema : inviteRegisterSchema),
    defaultValues: {
      name: userName || "",
      email: email || "",
      password: "",
      confirmPassword: ""
    },
  })

  function onSubmit(values: RegisterSchema | InviteRegisterSchema) {
    setError(null)

    try {
      if (mode === "create") {
        // Regular registration
        register({
          name: values.name,
          email: values.email,
          password: values.password
        })
      } else if (mode === "invite" && token) {
        // Invitation-based registration
        acceptInvite({
          name: values.name,
          email: email, // Use email from invitation
          password: values.password,
          token
        })
      }
    } 
      catch (err) { setError(err instanceof Error ? err.message : "Something went wrong")
    }
  }

  const isPending = mode === "create" ? isRegisterPending : isAccepting
  const errorMessage = error || (registerError instanceof Error ? registerError.message : "")

  return (
    <Card className="space-y-6">
      <CardHeader className="space-y-1.5">
        <CardTitle className="text-center md:text-start text-2xl font-bold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {mode === "invite" && email && (
          <Alert className="mb-4">
            <AlertDescription>
              {email} has been invited to join {teamName || "the team"} as a {role?.toLowerCase()}.
            </AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl><Input placeholder="Enter your name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {mode === 'create' ? (
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="Enter your email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            ) : (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <Input type="email" value={email} disabled />
                <p className="text-xs text-muted-foreground mt-1">
                  The email cannot be changed because it was defined in the invitation
                </p>
              </FormItem>
            )}

            {['password', 'confirmPassword'].map((fieldName, index) => (
              <FormField key={fieldName} control={form.control} name={fieldName as 'password' | 'confirmPassword'} render={({ field }) => (
                <FormItem>
                  <FormLabel>{fieldName === "password" ? "Password" : "Confirm Password"}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={(index === 0 ? showPassword : showConfirmPassword) ? "text" : "password"}
                        placeholder="••••••••••••"
                        autoComplete={fieldName === "password" ? "password" : "new-password"}
                        disabled={isPending}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 cursor-pointer h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => index === 0 ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showPassword || showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            ))}

            <Button type="submit" className="w-full mt-4" disabled={isPending}>
              {isPending ? "Creating..." : "Create account"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="text-center md:text-start text-xs text-muted-foreground">
          By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </div>
      </CardFooter>
    </Card>
  )
}