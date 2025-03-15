import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { User } from "./user"

export type SiteStatus = "ACTIVE" | "INACTIVE"

export interface Site {
  id: string
  name: string
  url: string
  status: SiteStatus
  teamId: string
  createdAt: Date
  updatedAt: Date
  users: User[]
}

export interface CreateSiteData {
  name: string
  url: string
  users: User[]
  teamId: string
}

export async function getSites(teamId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const sites = await prisma.site.findMany({
    where: {
      teamId
    },
    include: {
      users: {
        include: {
          user: true
        }
      }
    }
  })

  return sites.map((site) => ({
    ...site,
    users: site.users.map((siteUser) => ({
      id: siteUser.user.id,
      name: siteUser.user.name,
      email: siteUser.user.email,
      role: siteUser.role
    }))
  })) as Site[]
}

export async function createSite(data: CreateSiteData) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const currentUser = await prisma.teamMember.findFirst({
    where: { 
      userId: session.user.id,
      teamId: data.teamId
    }
  })

  const userRole = currentUser?.role || "MEMBER"

  // Criar o site primeiro
  const site = await prisma.site.create({
    data: {
      name: data.name,
      url: data.url,
      status: "ACTIVE" as SiteStatus,
      teamId: data.teamId
    }
  })

  // Adicionar o usuário atual como OWNER/ADMIN
  await prisma.siteUser.create({
    data: {
      userId: session.user.id,
      siteId: site.id,
      role: userRole === "ADMIN" ? "ADMIN" : "OWNER"
    }
  })

  // Adicionar os outros usuários como MEMBER
  if (data.users && data.users.length > 0) {
    await prisma.siteUser.createMany({
      data: data.users.map(user => ({
        userId: user.id,
        siteId: site.id,
        role: "MEMBER"
      }))
    })
  }

  // Buscar o site com todos os usuários
  const siteWithUsers = await prisma.site.findUnique({
    where: {
      id: site.id
    },
    include: {
      users: {
        include: {
          user: true
        }
      }
    }
  })

  if (!siteWithUsers) {
    throw new Error("Site not found")
  }

  return {
    ...siteWithUsers,
    users: siteWithUsers.users.map((siteUser) => ({
      id: siteUser.user.id,
      name: siteUser.user.name,
      email: siteUser.user.email,
      role: siteUser.role
    }))
  } as Site
}

interface UpdateSiteData {
  name: string
  url: string
}

export async function updateSite(id: string, data: UpdateSiteData) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.teamId) {
    throw new Error("User not authorized")
  }

  const site = await prisma.site.update({
    where: {
      id,
      team: {
        id: session.user.teamId
      }
    },
    data: {
      name: data.name,
      url: data.url
    }
  })

  return site
}

export async function deleteSite(id: string) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.teamId) {
    throw new Error("User not authorized")
  }

  await prisma.site.delete({
    where: {
      id,
      team: {
        id: session.user.teamId
      }
    }
  })
} 