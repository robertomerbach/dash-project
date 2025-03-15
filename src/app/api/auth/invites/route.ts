// app/api/auth/invites/route.ts
import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { randomUUID } from "crypto"

// Schema para processamento de convites
const inviteProcessSchema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  token: z.string(),
});

// Schema para criação de convites
const createInviteSchema = z.object({
  email: z.string().email(),
  teamId: z.string().cuid(),
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]).default("MEMBER"), // Removido VIEWER que não existe no schema
});

// GET: Listar convites para o usuário atual
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  
  // Buscar equipes onde o usuário é admin ou owner
  const userTeams = await prisma.teamMember.findMany({
    where: {
      userId: session.user.id,
      role: { in: ["OWNER", "ADMIN"] }
    },
    select: {
      teamId: true
    }
  });
  
  const teamIds = userTeams.map(team => team.teamId);
  
  // Buscar convites pendentes para essas equipes
  const invites = await prisma.teamMember.findMany({
    where: {
      teamId: { in: teamIds },
      status: "PENDING",
      inviteExpires: { gt: new Date() } // Corrigido: expiresAt → inviteExpires
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
  
  return NextResponse.json(invites);
}

// POST: Processar um convite (signup via convite)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Verificar se é uma criação de convite ou processamento de convite
    if (body.token) {
      // Processamento de convite
      const validation = inviteProcessSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: "Dados inválidos", details: validation.error.format() },
          { status: 400 }
        );
      }
      
      const { name, email, password, token } = validation.data;
      
      // Verificar se o token de convite é válido
      const invite = await prisma.teamMember.findFirst({
        where: { 
          inviteToken: token, // Corrigido: token → inviteToken
          inviteExpires: { gt: new Date() }, // Corrigido: expiresAt → inviteExpires
          status: "PENDING"
        },
        include: {
          team: true
        }
      });
      
      if (!invite) {
        return NextResponse.json(
          { error: "Convite inválido ou expirado" },
          { status: 400 }
        );
      }
      
      // Verificar se o domínio do email está permitido
      if (invite.team.allowedDomains) {
        const allowedDomains = invite.team.allowedDomains.split(",").map(d => d.trim());
        const emailDomain = email.split("@")[1];
        
        if (!allowedDomains.includes(emailDomain)) {
          return NextResponse.json(
            { error: "Domínio de email não permitido para esta equipe" },
            { status: 400 }
          );
        }
      }
      
      // Verificar se o email já existe
      const userExists = await prisma.user.findUnique({
        where: { email },
      });
      
      let userId;
      
      if (userExists) {
        userId = userExists.id;
      } else {
        // Hash da senha
        const hashedPassword = await hash(password, 12);
        
        // Criar novo usuário
        const newUser = await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            // Removido campo role que não existe no modelo User
            subscription: {
              create: {
                plan: "BASIC", // Corrigido: FREE → BASIC conforme enum SubscriptionPlan
                status: "ACTIVE",
                maxAdsSites: 1,
                maxMetricSites: 3,
              }
            }
          },
        });
        
        userId = newUser.id;
      }
      
      // Atualizar o convite para associar ao usuário
      await prisma.teamMember.update({
        where: { id: invite.id },
        data: { 
          userId: userId,
          status: "ACTIVE", // Corrigido: ACCEPTED → ACTIVE conforme enum UserStatus
          inviteToken: null, // Limpar o token de convite
          inviteExpires: null // Limpar a expiração
        }
      });
      
      return NextResponse.json(
        { 
          message: "Convite aceito com sucesso",
          teamId: invite.teamId,
          teamName: invite.team.name
        },
        { status: 200 }
      );
    } else {
      // Criação de convite
      const session = await getServerSession(authOptions);
      
      if (!session) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
      }
      
      const validation = createInviteSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: "Dados inválidos", details: validation.error.format() },
          { status: 400 }
        );
      }
      
      const { email, teamId, role } = validation.data;
      
      // Verificar se o usuário tem permissão para convidar
      const userTeamMember = await prisma.teamMember.findFirst({
        where: {
          userId: session.user.id,
          teamId,
          role: { in: ["OWNER", "ADMIN"] }
        }
      });
      
      if (!userTeamMember) {
        return NextResponse.json(
          { error: "Sem permissão para convidar para esta equipe" },
          { status: 403 }
        );
      }
      
      // Criar convite
      const inviteExpires = new Date(); // Corrigido: expiresAt → inviteExpires
      inviteExpires.setDate(inviteExpires.getDate() + 7); // Expira em 7 dias
      
      const invite = await prisma.teamMember.create({
        data: {
          teamId,
          inviteEmail: email, // Corrigido: email → inviteEmail
          role,
          inviteToken: randomUUID(), // Corrigido: token → inviteToken
          inviteExpires, // Corrigido: expiresAt → inviteExpires
          status: "PENDING"
        }
      });
      
      // Aqui você enviaria um email com o convite
      
      return NextResponse.json(
        { 
          message: "Convite enviado com sucesso",
          invite: {
            id: invite.id,
            email: invite.inviteEmail, // Corrigido: email → inviteEmail
            expiresAt: invite.inviteExpires // Corrigido: expiresAt → inviteExpires
          }
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Erro ao processar convite:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
