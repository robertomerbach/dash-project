import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schema for invite processing
const inviteProcessSchema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  token: z.string(),
});

/**
 * POST: Process a team invitation (signup via invite)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const validation = inviteProcessSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.format() },
        { status: 400 }
      );
    }
    
    const { name, email, password, token } = validation.data;
    
    // Verify that the invitation token is valid and not expired
    const invite = await prisma.teamMember.findFirst({
      where: { 
        inviteToken: token,
        inviteExpires: { gt: new Date() },
        status: "PENDING"
      },
      include: {
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
        { status: 400 }
      );
    }
    
    // Check if the invitation email matches the provided email
    if (invite.inviteEmail && invite.inviteEmail !== email) {
      return NextResponse.json(
        { error: "Email doesn't match the invitation" },
        { status: 400 }
      );
    }
    
    // Check if the email domain is allowed for this team
    if (invite.team.allowedDomains) {
      const allowedDomains = invite.team.allowedDomains.split(",").map(d => d.trim());
      const emailDomain = email.split("@")[1];
      
      if (!allowedDomains.includes(emailDomain)) {
        return NextResponse.json(
          { error: "Email domain not allowed for this team" },
          { status: 400 }
        );
      }
    }
    
    // Use Prisma transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Check if user already exists
      const existingUser = await tx.user.findUnique({
        where: { email }
      });
      
      let userId: string;
      
      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Hash the password
        const hashedPassword = await hash(password, 12);
        
        // Create a new user
        const newUser = await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword
          }
        });
        
        userId = newUser.id;
      }
      
      // Update the team member record to link with user
      const updatedTeamMember = await tx.teamMember.update({
        where: { id: invite.id },
        data: { 
          userId,
          status: "ACTIVE",
          inviteToken: null,
          inviteExpires: null
        },
        include: {
          team: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
      
      return {
        userId,
        teamId: updatedTeamMember.teamId,
        teamName: updatedTeamMember.team.name
      };
    });
    
    return NextResponse.json(
      { 
        message: "Invitation accepted successfully",
        userId: result.userId,
        teamId: result.teamId,
        teamName: result.teamName
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}