// app/api/users/teams/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/users/teams - Obter todas as equipes do usuário atual
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const teams = await prisma.teamMember.findMany({
      where: { userId: session.user.id },
      include: {
        team: {
          include: {
            sites: true,
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                  }
                }
              }
            }
          }
        }
      }
    });
    
    return NextResponse.json(teams);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

// POST /api/users/teams - Criar uma nova equipe
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { name, allowedDomains, language, timezone, currency } = await req.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }
    
    // Criar equipe e associar o usuário como OWNER
    const team = await prisma.team.create({
      data: {
        name,
        allowedDomains: allowedDomains || null,
        language: language || 'en',
        timezone: timezone || 'America/New_York',
        currency: currency || 'USD',
        members: {
          create: {
            userId: session.user.id,
            role: 'OWNER',
            status: 'ACTIVE'
          }
        }
      },
      include: {
        members: true
      }
    });
    
    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { name } = body

    if (!name) {
      return new NextResponse("Name is required", { status: 400 })
    }

    // Busca o time atual do usuário onde ele é OWNER ou ADMIN
    const member = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
        role: {
          in: ["OWNER", "ADMIN"]
        }
      }
    })

    if (!member) {
      return new NextResponse("Team not found or unauthorized", { status: 404 })
    }

    // Atualiza o nome do time
    const updatedTeam = await prisma.team.update({
      where: {
        id: member.teamId,
      },
      data: {
        name
      }
    })

    return NextResponse.json({ team: updatedTeam })
  } catch (error) {
    console.error("[TEAM_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Busca o time atual do usuário onde ele é OWNER ou ADMIN
    const member = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        role: {
          in: ["OWNER", "ADMIN"]
        }
      },
      include: {
        team: true
      }
    })

    if (!member) {
      return new NextResponse("Team not found or unauthorized", { status: 404 })
    }

    // Deleta o time e todos os dados associados em cascata
    await prisma.team.delete({
      where: {
        id: member.teamId,
      },
    })

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error("[TEAM_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}