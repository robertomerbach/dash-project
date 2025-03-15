import prisma from "@/lib/prisma"
import { UserRole, UserStatus } from "@prisma/client"

interface CreateTeamParams {
  name: string
  userId: string
  email: string
}

export async function createTeamWithOwner({ name, userId, email }: CreateTeamParams) {
  const teamName = `${name || email.split("@")[0]}'s Team`
  
  return await prisma.team.create({
    data: {
      name: teamName,
      language: "pt-BR",
      timezone: "America/Sao_Paulo",
      autoTimezone: true,
      currency: "BRL",
      members: {
        create: {
          userId,
          role: "OWNER" as UserRole,
          status: "ACTIVE" as UserStatus
        }
      }
    }
  })
} 