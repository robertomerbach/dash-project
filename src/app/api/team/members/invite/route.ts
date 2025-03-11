import { NextResponse } from "next/server"
import { inviteUser } from "@/lib/user"

export async function POST(
  req: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const { name, email, role } = await req.json()

    console.log("Inviting user:", { name, email, role, teamId: params.teamId })

    const user = await inviteUser({
      name,
      email,
      role,
      teamId: params.teamId
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