// app/api/auth/tokens/verify/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const tokenSchema = z.object({
  token: z.string(),
  type: z.enum(["password-reset", "team-invite", "email-verification"]),
});

export async function GET(req: Request) {
  try {
    // Recupera token e tipo da URL
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const type = url.searchParams.get("type") as "password-reset" | "team-invite" | "email-verification";
    
    if (!token || !type) {
      return NextResponse.json(
        { error: "Token and type are required", valid: false },
        { status: 400 }
      );
    }
    
    const validation = tokenSchema.safeParse({ token, type });
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid token format or type", valid: false },
        { status: 400 }
      );
    }
    
    let isValid = false;
    let data = null;
    
    switch (type) {
      case "password-reset": {
        const user = await prisma.user.findFirst({
          where: {
            resetToken: token,
            resetTokenExpires: { gt: new Date() },
          },
          select: {
            email: true,
          }
        });
        
        isValid = !!user;
        if (user?.email) {
          const maskEmail = (email: string) => {
            const [username, domain] = email.split('@');
            const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
            return `${maskedUsername}@${domain}`;
          };
          data = { email: maskEmail(user.email) };
        }
        break;
      }
      case "team-invite": {
        const teamMember = await prisma.teamMember.findFirst({
          where: { 
            inviteToken: token,
            inviteExpires: { gt: new Date() },
            status: "PENDING"
          },
          include: {
            team: {
              select: {
                name: true,
              }
            }
          }
        });
        
        isValid = !!teamMember;
        data = teamMember ? {
          teamName: teamMember.team.name,
          email: teamMember.inviteEmail,
        } : null;
        break;
      }
      case "email-verification": {
        const user = await prisma.user.findFirst({
          where: {
            emailVerificationToken: token,
            emailVerificationExpires: { gt: new Date() },
          },
          select: {
            email: true,
          }
        });
        
        isValid = !!user;
        if (user?.email) {
          const maskEmail = (email: string) => {
            const [username, domain] = email.split('@');
            const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
            return `${maskedUsername}@${domain}`;
          };
          data = { email: maskEmail(user.email) };
        }
        break;
      }
    }
    
    return NextResponse.json({
      valid: isValid,
      data
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json(
      { error: "Internal server error", valid: false },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const validation = tokenSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid token or type", valid: false },
        { status: 400 }
      );
    }
    
    const { token, type } = validation.data;
    
    let isValid = false;
    let data = null;
    
    switch (type) {
      case "password-reset": {
        const user = await prisma.user.findFirst({
          where: {
            resetToken: token,
            resetTokenExpires: { gt: new Date() },
          },
          select: {
            id: true,
            email: true,
            name: true
          }
        });
        
        isValid = !!user;
        data = user ? {
          userId: user.id,
          email: user.email,
          name: user.name
        } : null;
        break;
      }
      case "team-invite": {
        const teamMember = await prisma.teamMember.findFirst({
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
        
        isValid = !!teamMember;
        data = teamMember ? {
          teamId: teamMember.teamId,
          teamName: teamMember.team.name,
          role: teamMember.role,
          email: teamMember.inviteEmail,
          allowedDomains: teamMember.team.allowedDomains
        } : null;
        break;
      }
      case "email-verification": {
        const user = await prisma.user.findFirst({
          where: {
            emailVerificationToken: token,
            emailVerificationExpires: { gt: new Date() },
          },
          select: {
            id: true,
            email: true,
            name: true
          }
        });
        
        isValid = !!user;
        data = user ? {
          userId: user.id,
          email: user.email,
          name: user.name
        } : null;
        break;
      }
    }
    
    return NextResponse.json({
      valid: isValid,
      data
    });
  } catch (error) {
    console.error("Error validating token:", error);
    return NextResponse.json(
      { error: "Internal server error", valid: false },
      { status: 500 }
    );
  }
}
