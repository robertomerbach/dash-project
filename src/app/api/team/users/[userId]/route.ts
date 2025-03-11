import { NextResponse } from "next/server"
import { removeUser } from "@/lib/user"

export async function DELETE(
  req: Request,
  { params }: { params: { teamId: string; userId: string } }
) {
  try {
    await removeUser(params.userId)
    return NextResponse.json({ message: "User removed successfully" })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error removing user" },
      { status: 500 }
    )
  }
} 