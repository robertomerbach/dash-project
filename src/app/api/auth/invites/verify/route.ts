// app/api/auth/invites/verify/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schema for token verification
const verifyTokenSchema = z.object({
  token: z.string().uuid(),
});

/**
 * GET: Verify an invitation token and get info about the team
 */
export async function GET(req: Request) {
  try {
    // Get token from URL
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }
    
    const validation = verifyTokenSchema.safeParse({ token });
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 400 }
      );
    }
    
    // Find the invitation by token
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
            name: true,
            allowedDomains: true
          }
        }
      }
    });
    
    if (!invite) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 404 }
      );
    }
    
    // Return invitation details
    return NextResponse.json({
      status: "valid",
      inviteInfo: {
        id: invite.id,
        email: invite.inviteEmail,
        role: invite.role,
        expiresAt: invite.inviteExpires,
        team: {
          id: invite.team.id,
          name: invite.team.name
        }
      }
    });
  } catch (error) {
    console.error("Error verifying invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}