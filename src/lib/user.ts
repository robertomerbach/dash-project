"use server"

import { getServerSession } from "next-auth"

import prisma from "./prisma"
import { authOptions } from "./auth"
import { sendInviteEmail } from "./email"
import { generateToken } from "./utils"

export type UserRole = "OWNER" | "MEMBER" | "ADMIN"
export type UserStatus = "PENDING" | "ACTIVE"

export interface InviteUserData {
  name: string
  email: string
  role: UserRole
}

export async function inviteUser(data: InviteUserData) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  // Get current team
  const teamMember = await prisma.teamMember.findFirst({
    where: {
      userId: session.user.id,
      status: "ACTIVE"
    },
    select: {
      teamId: true,
      team: true
    }
  })

  if (!teamMember) {
    throw new Error("No active team found")
  }

  // Verificar se o usuário já existe no time
  const existingMember = await prisma.teamMember.findFirst({
    where: {
      teamId: teamMember.teamId,
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
      teamId: teamMember.teamId,
      inviteEmail: data.email,
      inviteToken: token,
      inviteExpires: expires,
      status: "PENDING",
      userId: existingUser?.id || undefined
    }
  })

  // Gerar URL de convite
  const inviteUrl = `${process.env.NEXTAUTH_URL}/signup?token=${token}&email=${data.email}`

  // Enviar email de convite
  await sendInviteEmail({
    email: data.email,
    name: data.name,
    inviteUrl,
    teamName: teamMember.team.name
  })

  return {
    id: invite.id,
    name: data.name,
    email: data.email,
    role: data.role,
    status: "PENDING",
    createdAt: invite.createdAt
  }
}

export async function updateUser(id: string, data: { role: UserRole }) {
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
    id: teamMember.id,
    name: teamMember.user?.name || teamMember.inviteEmail,
    email: teamMember.user?.email || teamMember.inviteEmail,
    role: teamMember.role,
    status: teamMember.status,
    createdAt: teamMember.createdAt
  }
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