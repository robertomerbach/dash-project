import prisma from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"
import { use } from "react"

import { SignupContent } from "@/components/layout/signup-content"

interface SignupPageProps {
  searchParams: Promise<{
    token?: string  
  }>
}

export default function SignupPage({ searchParams }: SignupPageProps) {
  const params = use(searchParams)

  if (!params.token) {
    return (
      <SignupContent
        mode="create"
        title="Sign up to Arena"
        description={
          <p className="text-center md:text-start text-sm text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:text-primary">
            Already have an account?{" "}
            <Link href="/login">Log in</Link>
          </p>
        }
      />
    )
  }

  // Modo de registro por convite (com token)
  const invitedUser = use(prisma.teamMember.findFirst({
    where: { 
      inviteToken: params.token,
      status: 'PENDING'
    },
    select: {
      id: true,
      role: true,
      inviteEmail: true,
      inviteExpires: true,
      team: {
        select: {
          id: true,
          name: true
        }
      },
      user: {
        select: {
          name: true
        }
      }
    }
  }))

  if (!invitedUser) {
    redirect("/login?error=Invalid or expired invitation")
  }

  if (invitedUser.inviteExpires && invitedUser.inviteExpires < new Date()) {
    // Remover o convite expirado
    use(prisma.teamMember.update({
      where: { id: invitedUser.id },
      data: { 
        status: 'EXPIRED',
        inviteToken: null,
        inviteExpires: null
      }
    }))
    
    redirect("/login?error=Invitation expired")
  }

  return (
    <SignupContent 
      mode="invite"
      title="Complete your registration"
      email={invitedUser.inviteEmail || ''}
      role={invitedUser.role}
      token={params.token}
      organizationId={invitedUser.team.id}
      userName={invitedUser.user?.name || ''}
    />
  )
}