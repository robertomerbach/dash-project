import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function Home() {
  const session = await getServerSession(authOptions)

  // Se não estiver logado, redireciona para login
  if (!session?.user) {
    redirect("/login")
  }

  redirect(`/app`)
} 