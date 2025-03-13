import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import prisma from "@/lib/prisma"
import { createTeamWithOwner } from "@/lib/team"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    const exists = await prisma.user.findUnique({
      where: { email }
    })

    if (exists) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(password, 10)

    // Criar usuário e time em uma única transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar o usuário
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      })

      const team = await createTeamWithOwner({
        name,
        userId: user.id,
        email
      })

      return { user, team }
    })

    return NextResponse.json({
      user: {
        name: result.user.name,
        email: result.user.email
      },
      teamId: result.team.id
    })
  } catch (error) {
    console.error("Error in register:", error)
    return NextResponse.json(
      { error: "Error creating user" },
      { status: 500 }
    )
  }
}
