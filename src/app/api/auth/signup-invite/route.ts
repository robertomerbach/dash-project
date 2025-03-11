import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { name, email, password, role, token, teamId } = await req.json()

    const exists = await prisma.user.findUnique({
      where: { email }
    })

    // Verificar se o convite existe e está válido
    const invite = await prisma.teamMember.findFirst({
      where: {
        inviteToken: token,
        inviteEmail: email,
        status: "PENDING"
      }
    })

    if (!invite) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(password, 10)

    // Se o usuário já existe, apenas atualizar os dados e vincular ao time
    if (exists) {
      await prisma.teamMember.update({
        where: { id: invite.id },
        data: {
          userId: exists.id,
          status: "ACTIVE",
          inviteToken: null,
          inviteExpires: null
        }
      })

      return NextResponse.json({
        user: {
          name: exists.name,
          email: exists.email
        }
      })
    }

    // Criar novo usuário e vincular ao time
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    })

    // Atualizar o convite com o usuário criado
    await prisma.teamMember.update({
      where: { id: invite.id },
      data: {
        userId: user.id,
        status: "ACTIVE",
        inviteToken: null,
        inviteExpires: null
      }
    })

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error("Error in signup-invite:", error)
    return NextResponse.json(
      { error: "Error creating user" },
      { status: 500 }
    )
  }
}
