"use server"

import prisma from "@/lib/prisma"

export interface InviteInfo {
  id: string
  email: string | null
  role: "OWNER" | "ADMIN" | "MEMBER"
  expiresAt: Date
  teamId: string
  teamName: string
}

/**
 * Server action to verify an invitation token
 */
export async function verifyInviteToken(token: string): Promise<InviteInfo | null> {
  if (!token) {
    return null
  }

  try {
    const invite = await prisma.teamMember.findFirst({
      where: { 
        inviteToken: token,
        status: "PENDING",
        inviteExpires: { gt: new Date() }
      },
      select: {
        id: true,
        inviteEmail: true,
        role: true,
        inviteExpires: true,
        team: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!invite) {
      return null
    }

    return {
      id: invite.id,
      email: invite.inviteEmail,
      role: invite.role,
      expiresAt: invite.inviteExpires,
      teamId: invite.team.id,
      teamName: invite.team.name
    }
  } catch (error) {
    console.error("Error verifying invitation token:", error)
    return null
  }
}

/**
 * Mark an invitation as expired
 */
export async function markInviteExpired(inviteId: string): Promise<boolean> {
  try {
    await prisma.teamMember.update({
      where: { id: inviteId },
      data: { 
        status: "EXPIRED",
        inviteToken: null,
        inviteExpires: null
      }
    })
    
    return true
  } catch (error) {
    console.error("Error marking invitation as expired:", error)
    return false
  }
}