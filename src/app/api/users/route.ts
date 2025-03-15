// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { hash } from 'bcrypt';

// GET /api/users - Obter todos os usuários (apenas para admin)
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Verificar se o usuário é ADMIN ou OWNER em algum time
  const isAdmin = await prisma.teamMember.findFirst({
    where: {
      userId: session.user.id,
      role: { in: ['ADMIN', 'OWNER'] },
      status: 'ACTIVE'
    }
  });
  
  if (!isAdmin) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }
  
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        teamMembers: {
          select: {
            role: true,
            team: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });
    
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/users - Criar novo usuário (para registro de admin)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Verificar se o usuário é ADMIN ou OWNER em algum time
  const adminTeamMember = await prisma.teamMember.findFirst({
    where: {
      userId: session.user.id,
      role: { in: ['ADMIN', 'OWNER'] },
      status: 'ACTIVE'
    },
    include: {
      team: true
    }
  });
  
  if (!adminTeamMember) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }
  
  try {
    const { name, email, password, teamRole = 'MEMBER' } = await req.json();
    
    // Validação básica
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }
    
    // Hash da senha
    const hashedPassword = await hash(password, 12);
    
    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // Adicionar o usuário ao time do admin
        teamMembers: {
          create: {
            teamId: adminTeamMember.teamId,
            role: teamRole as 'OWNER' | 'ADMIN' | 'MEMBER',
            status: 'ACTIVE'
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });
    
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
