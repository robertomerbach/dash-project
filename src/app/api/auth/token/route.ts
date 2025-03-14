// app/api/auth/tokens/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const tokenSchema = z.object({
  token: z.string().uuid(),
  type: z.enum(["password-reset", "email-verification", "team-invite"]),
});

// POST: Validar qualquer tipo de token
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validação do token
    const validation = tokenSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Token inválido", valid: false },
        { status: 400 }
      );
    }
    
    const { token, type } = validation.data;
    
    // Verificar validade do token com base no tipo
    let isValid = false;
    let data = null;
    
    switch (type) {
      case "password-reset":
        const resetToken = await prisma.passwordReset.findUnique({
          where: { 
            token,
            expiresAt: { gt: new Date() },
            used: false
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        });
        
        isValid = !!resetToken;
        data = resetToken?.user;
        break;
        
      case "email-verification":
        const verificationToken = await prisma.emailVerification.findUnique({
          where: { 
            token,
            expiresAt: { gt: new Date() },
            verified: false
          }
        });
        
        isValid = !!verificationToken;
        break;
        
      case "team-invite":
        const inviteToken = await prisma.teamInvite.findUnique({
          where: { 
            token,
            expiresAt: { gt: new Date() },
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
        
        isValid = !!inviteToken;
        data = inviteToken ? {
          teamId: inviteToken.teamId,
          teamName: inviteToken.team.name,
          role: inviteToken.role,
          email: inviteToken.email,
          allowedDomains: inviteToken.team.allowedDomains
        } : null;
        break;
    }
    
    return NextResponse.json({
      valid: isValid,
      data
    });
  } catch (error) {
    console.error("Erro ao validar token:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor", valid: false },
      { status: 500 }
    );
  }
}
