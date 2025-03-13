import { NextResponse } from "next/server"
import { removeUser } from "@/lib/user"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function DELETE(req: Request, { params }: { params: { userId: string } }) {
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
      select: {
        teamId: true
      }
    })

    if (!teamMember) {
      return new NextResponse("Team not found", { status: 404 })
    }

    // Remove o usuário
    await removeUser(params.userId)

    return NextResponse.json({ message: "User removed successfully" })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error removing user" },
      { status: 500 }
    )
  }
} 