// app/api/auth/users/route.ts
import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";

// Schema para signup
const signupSchema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

// GET: Obter informações do usuário atual
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      subscription: true,
      teamMembers: {
        include: {
          team: true
        }
      }
    }
  });
  
  return NextResponse.json(user);
}

// POST: Criar novo usuário (signup)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validação dos dados
    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.format() },
        { status: 400 }
      );
    }
    
    const { name, email, password } = validation.data;
    
    // Verificar se o email já existe
    const userExists = await prisma.user.findUnique({
      where: { email },
    });
    
    if (userExists) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      );
    }
    
    // Hash da senha
    const hashedPassword = await hash(password, 12);
    
    // Criar usuário com assinatura gratuita e equipe pessoal
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
        subscription: {
          create: {
            plan: "FREE",
            status: "ACTIVE",
            maxAdsSites: 1,
            maxMetricSites: 3,
          }
        }
      },
    });
    
    // Criar equipe padrão para o usuário
    await prisma.team.create({
      data: {
        name: `${name}'s Team`,
        language: "pt-BR",
        timezone: "America/Sao_Paulo",
        currency: "BRL",
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
            status: "ACTIVE"
          }
        }
      }
    });
    
    return NextResponse.json(
      { 
        message: "Usuário criado com sucesso",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}