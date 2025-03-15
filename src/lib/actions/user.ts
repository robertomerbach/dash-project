"use server"

import { getServerSession } from "next-auth"

import prisma from "../prisma"
import { authOptions } from "../auth"
import { sendInviteEmail } from "../email"
import { generateToken } from "../utils"

export type UserRole = "OWNER" | "MEMBER" | "ADMIN"
export type UserStatus = "PENDING" | "ACTIVE"

export type User = {
  id: string
  name: string | null
  email: string | null
  image?: string | null
  role?: UserRole
  status?: UserStatus
  createdAt: Date
}

export interface InviteUserData {
  name: string
  email: string
  role: UserRole
  teamId: string
}

export async function getTeamUsers(teamId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const teamUsers = await prisma.teamMember.findMany({
    where: {
      teamId
    },
    include: {
      user: true
    }
  })

  return teamUsers.map(tu => ({
    id: tu.id,
    name: tu.user?.name || tu.inviteEmail,
    email: tu.user?.email || tu.inviteEmail,
    image: tu.user?.image,
    role: tu.role,
    status: tu.status,
    createdAt: tu.createdAt
  })) as User[]
}

export async function inviteUser(data: InviteUserData) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  // Verificar se o usuário já existe no time
  const existingMember = await prisma.teamMember.findFirst({
    where: {
      teamId: data.teamId,
      OR: [
        { inviteEmail: data.email },
        {
          user: {
            email: data.email
          }
        }
      ]
    }
  })

  if (existingMember) {
    throw new Error("User already exists in this team")
  }

  // Verificar se o usuário já existe no sistema
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  })

  // Gerar token de convite
  const token = generateToken(32)
  const expires = new Date()
  expires.setDate(expires.getDate() + 7) // Expira em 7 dias

  // Criar o convite
  const invite = await prisma.teamMember.create({
    data: {
      role: data.role,
      teamId: data.teamId,
      inviteEmail: data.email,
      inviteToken: token,
      inviteExpires: expires,
      status: "PENDING",
      userId: existingUser?.id || undefined
    },
    include: {
      team: true
    }
  })

  // Buscar o nome do time
  const team = await prisma.team.findUnique({
    where: { id: data.teamId },
    select: { name: true }
  })

  if (!team) {
    throw new Error("Team not found")
  }

  // Gerar URL de convite
  const inviteUrl = `${process.env.NEXTAUTH_URL}/register?token=${token}&email=${data.email}`

  // Enviar email de convite
  await sendInviteEmail({
    email: data.email,
    name: data.name,
    inviteUrl,
    teamName: team.name
  })

  return {
    id: invite.id,
    name: data.name,
    email: data.email,
    role: data.role,
    status: "PENDING"
  } as User
}

export async function updateUser(id: string, data: Partial<User>) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const teamMember = await prisma.teamMember.update({
    where: {
      id
    },
    data: {
      role: data.role
    },
    include: {
      user: true
    }
  })

  return {
    id: teamMember.user?.id || "",
    name: teamMember.user?.name || "",
    email: teamMember.user?.email || "",
    role: teamMember.role,
    status: teamMember.status,
    createdAt: teamMember.createdAt
  } as User
}

export async function removeUser(id: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  await prisma.teamMember.delete({
    where: {
      id
    }
  })
} 