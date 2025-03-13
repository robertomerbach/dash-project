"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { EyeOff, Eye } from "lucide-react"

// Esquema de validação
const createFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

const inviteFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

// Tipagem do formulário
type CreateFormValues = z.infer<typeof createFormSchema>
type InviteFormValues = z.infer<typeof inviteFormSchema>
type FormValues = CreateFormValues | InviteFormValues

interface RegisterContentProps {
  mode: 'create' | 'invite'
  title?: string
  description?: React.ReactNode
  email?: string
  role?: string
  token?: string
  organizationId?: string
  userName?: string
}

export function RegisterContent({ 
  mode = 'create',
  title = '',
  description = '',
  email = '',
  role = 'user',
  token = '',
  organizationId = '',
  userName = '',
}: RegisterContentProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  // Escolher esquema com base no modo
  const formSchema = mode === 'create' ? createFormSchema : inviteFormSchema

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: userName || "",
      ...(mode === 'create' ? { email: email || "" } : {}),
      password: "",
      confirmPassword: "",
    } as FormValues,
  })

  const onSubmit = React.useCallback(async (values: FormValues) => {
    if (isLoading) return

    setIsLoading(true)

    const endpoint = mode === 'create' ? "/api/auth/register" : "/api/auth/register-invite"
    
    const payload = mode === 'create'
      ? { name: values.name, email: (values as CreateFormValues).email, password: values.password }
      : { name: values.name, email, password: values.password, role, token, organizationId }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Something went wrong")
        return
      }

      toast.success("Account created successfully!")
      router.push(mode === 'create' ? `/` : "/login")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, mode, email, role, token, organizationId, router])

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-center md:text-start text-2xl font-bold">{title}</h2>
        {description}
      </div>

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
                      disabled={isLoading}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 cursor-pointer h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => index === 0 ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {index === 0 ? showPassword : showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          ))}

          <Button type="submit" className="w-full mt-4" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create account"}
          </Button>
        </form>
      </Form>

      <div className="text-center md:text-start text-xs text-muted-foreground">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}