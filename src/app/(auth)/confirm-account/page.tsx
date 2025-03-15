import { redirect } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"

import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"

interface Props {
  searchParams: {
    token?: string
    redirect_to?: string
  }
}

async function ConfirmAccount({ token, redirect_to }: { token: string, redirect_to?: string }) {
  try {
    // Verify token and update user
    const user = await prisma.user.findFirst({
      where: {
        AND: [
          { emailVerified: null },
          {
            OR: [
              { accounts: { some: { access_token: token } } },
              { sessions: { some: { sessionToken: token } } }
            ]
          }
        ]
      }
    })

    if (!user) {
      return (
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Invalid link</h2>
          <p className="text-muted-foreground">
            This confirmation link is invalid or has already been used. Please request a new confirmation link.
          </p>
          <Button asChild className="w-full" variant="default">
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>
      )
    }

    // Update user email verification
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() }
    })

    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-center md:text-start text-2xl font-bold text-primary">Email Confirmed!</h2>
        <p className="text-center md:text-start text-muted-foreground">
          Your email has been confirmed successfully.<br />
          You will be redirected to the login page in a few seconds...
        </p>
      </div>
    )
  } catch (error) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-center md:text-start text-2xl font-bold">Link Expired</h2>
        <p className="text-center md:text-start text-muted-foreground">
          This confirmation link has expired or is invalid.<br />
          Please request a new confirmation link.
        </p>
        <Button asChild className="w-full cursor-pointer" variant="default">
          <Link href="/login">Go to login</Link>
        </Button>
      </div>
    )
  }

  // Redirect after 3 seconds
  setTimeout(() => {
    redirect("/login")
  }, 2000)
}

export default function ConfirmAccountPage({ searchParams }: Props) {
  const { token, redirect_to } = searchParams

  if (!token) {
    redirect("/login")
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <Suspense fallback={
        <div className="flex flex-col gap-4">
          <h2 className="text-center md:text-start text-2xl font-bold">Verifying...</h2>
          <p className="text-center md:text-start text-muted-foreground">
            Please wait while we validate your email.
          </p>
        </div>
      }>
        <ConfirmAccount token={token} redirect_to={redirect_to} />
      </Suspense>

      <p className="text-center md:text-start text-sm text-muted-foreground [&_a]:underline [&_a]:hover:text-primary">
        If you have any issues confirming your account, please contact{" "}
        <Link href="mailto:support@resend.com">
          support@resend.com
        </Link>
      </p>
    </div>
  )
}
