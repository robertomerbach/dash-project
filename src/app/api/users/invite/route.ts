import { NextResponse } from "next/server"
import { inviteUser } from "@/lib/user"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { name, email, role } = await req.json()

    console.log("Inviting user:", { name, email, role, teamId: session.user.teamId })

    const user = await inviteUser({
      name,
      email,
      role,
      teamId: session.user.teamId || ""
    })

    console.log("User invited successfully:", user)

    return NextResponse.json(user)
  } catch (error: any) {
    console.error("Error inviting user:", {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    })

    return NextResponse.json(
      { error: error.message || "Error inviting user" },
      { status: 500 }
    )
  }
} 