import { RegisterContent } from "@/components/auth/register-content"
import Link from "next/link"
import { redirect } from "next/navigation"
import { verifyInviteToken, markInviteExpired } from "@/lib/actions/invites"

interface RegisterPageProps {
  searchParams: {
    token?: string
  }
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { token } = searchParams

  if (!token) {
    return (
      <RegisterContent
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

  // Verificar token de convite usando server action
  const inviteInfo = await verifyInviteToken(token)

  // Se o convite for inválido ou expirado, redirecionar para login
  if (!inviteInfo) {
    return redirect("/login?error=Invalid or expired invitation")
  }

  // Verificar se o convite expirou
  if (inviteInfo.expiresAt < new Date()) {
    // Marcar o convite como expirado
    await markInviteExpired(inviteInfo.id)
    return redirect("/login?error=Invitation expired")
  }

  // Se o convite for válido, mostrar o formulário de registro por convite
  return (
    <RegisterContent 
      mode="invite"
      title="Complete your registration"
      email={inviteInfo.email || ''}
      role={inviteInfo.role}
      token={token}
      teamId={inviteInfo.teamId}
      teamName={inviteInfo.teamName}
    />
  )
}