"use client"

import * as z from "zod"
import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Eye, EyeOff } from "lucide-react"

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

const loginFormSchema = z.object({
  email: z.string().email({
    message: "Invalid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
})

type LoginFormValues = z.infer<typeof loginFormSchema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)

  // Verificar erro na URL ao carregar a página
  React.useEffect(() => {
    const error = searchParams.get("error")
    if (error) {
      toast.error(decodeURIComponent(error))
    }
  }, [searchParams])

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Observa o valor do email em tempo real
  const email = form.watch("email")

  // Função para gerar o link de forgot password com o email
  const getForgotPasswordLink = () => {
    return `/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ""}`
  }

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Invalid email or password.")
        return
      }

      router.push("/overview")
      router.refresh()
    } catch (error) {
      toast.error("Something went wrong.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-center md:text-start text-2xl font-bold">Log in to Arena</h2>
        <p className="text-center md:text-start text-sm text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:text-primary">
          Don&apos;t have an account?{" "}<Link href="/register">Sign up</Link>
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="email">Email</FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <Link href={getForgotPasswordLink()} className="text-sm text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:text-primary">
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
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
          <Button type="submit" className={`w-full mt-4 ${isLoading ? "cursor-not-allowed" : "cursor-pointer"}`} disabled={isLoading}>
            {isLoading ? "Loading..." : "Login"}
          </Button>
        </form>
      </Form>

    <div className="text-center md:text-start text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
      By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
      and <a href="#">Privacy Policy</a>.
    </div>
  </div>
  )
}