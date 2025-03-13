import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Busca o time atual do usuário
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE"
      },
      include: {
        team: true
      }
    })

    if (!teamMember) {
      return new NextResponse("Team not found", { status: 404 })
    }

    // Retorna o time no formato esperado
    const team = {
      id: teamMember.team.id,
      name: teamMember.team.name,
      createdAt: teamMember.team.createdAt,
      updatedAt: teamMember.team.updatedAt
    }

    return NextResponse.json({ team })
  } catch (error) {
    console.error("[TEAM_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
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