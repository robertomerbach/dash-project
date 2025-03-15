import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomUUID } from "crypto";
import { sendInviteEmail } from "@/lib/email";

// Schema for invite processing (accepting an invite)
const inviteProcessSchema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  token: z.string(),
});

// Schema for creating invites
const createInviteSchema = z.object({
  email: z.string().email(),
  teamId: z.string().cuid(),
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]).default("MEMBER"),
});

// Constants
const INVITE_EXPIRY_DAYS = 7;

/**
 * GET: List pending invites for teams where the current user is admin or owner
 */
export async function GET(
  req: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const teamId = params.teamId;
    
    // Check if user has permission to view team invites
    const userTeamMember = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        teamId,
        role: { in: ["OWNER", "ADMIN"] },
        status: "ACTIVE"
      }
    });
    
    if (!userTeamMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Get pending invites for this team
    const invites = await prisma.teamMember.findMany({
      where: {
        teamId,
        status: "PENDING",
        inviteExpires: { gt: new Date() }
      },
      select: {
        id: true,
        inviteEmail: true,
        role: true,
        inviteExpires: true,
        createdAt: true,
        team: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    return NextResponse.json(invites);
  } catch (error) {
    console.error("Error fetching invites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST: Create a new team invitation
 */
export async function POST(
  req: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const teamId = params.teamId;
    const body = await req.json();
    
    const validation = createInviteSchema.safeParse({
      ...body,
      teamId // Ensure teamId from URL is used
    });
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.format() },
        { status: 400 }
      );
    }
    
    const { email, role } = validation.data;
    
    // Check if user has permission to invite to this team
    const userTeamMember = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        teamId,
        role: { in: ["OWNER", "ADMIN"] },
        status: "ACTIVE"
      },
      include: {
        team: {
          select: {
            name: true,
            allowedDomains: true
          }
        }
      }
    });
    
    if (!userTeamMember) {
      return NextResponse.json(
        { error: "No permission to invite to this team" },
        { status: 403 }
      );
    }
    
    // Check if email domain is allowed
    if (userTeamMember.team.allowedDomains) {
      const allowedDomains = userTeamMember.team.allowedDomains.split(",").map(d => d.trim());
      const emailDomain = email.split("@")[1];
      
      if (!allowedDomains.includes(emailDomain)) {
        return NextResponse.json(
          { error: `Email domain not allowed for this team. Allowed domains: ${allowedDomains.join(", ")}` },
          { status: 400 }
        );
      }
    }
    
    // Check if email already has a pending invite for this team
    const existingInvite = await prisma.teamMember.findFirst({
      where: {
        teamId,
        inviteEmail: email,
        status: "PENDING",
        inviteExpires: { gt: new Date() }
      }
    });
    
    if (existingInvite) {
      return NextResponse.json(
        { error: "This email already has a pending invitation" },
        { status: 400 }
      );
    }
    
    // Check if email is already a team member
    const existingMember = await prisma.user.findFirst({
      where: {
        email,
        teamMembers: {
          some: {
            teamId,
            status: "ACTIVE"
          }
        }
      }
    });
    
    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this team" },
        { status: 400 }
      );
    }
    
    // Create invite with unique token
    const inviteToken = randomUUID();
    const inviteExpires = new Date();
    inviteExpires.setDate(inviteExpires.getDate() + INVITE_EXPIRY_DAYS);
    
    const invite = await prisma.teamMember.create({
      data: {
        teamId,
        inviteEmail: email,
        role,
        inviteToken,
        inviteExpires,
        status: "PENDING"
      }
    });
    
    // Generate invite URL
    const baseUrl = process.env.NEXTAUTH_URL || `https://${process.env.VERCEL_URL}`;
    const inviteUrl = `${baseUrl}/register?token=${inviteToken}`;
    
    // Send invitation email
    await sendInviteEmail({
      email,
      name: email.split('@')[0], // Use part of email as name placeholder
      inviteUrl,
      teamName: userTeamMember.team.name
    });
    
    return NextResponse.json(
      { 
        message: "Invitation sent successfully",
        invite: {
          id: invite.id,
          email: invite.inviteEmail,
          expiresAt: invite.inviteExpires
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}