// app/api/auth/password/change/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { hash, compare } from "bcrypt";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Schema for password change (logged-in user)
const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).max(100),
});

/**
 * POST: Change password for authenticated user
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await req.json();
    
    const validation = changePasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.format() },
        { status: 400 }
      );
    }
    
    const { currentPassword, newPassword } = validation.data;
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });
    
    if (!user || !user.password) {
      return NextResponse.json(
        { error: "User not found or has no password set" },
        { status: 400 }
      );
    }
    
    // Verify current password
    const isPasswordValid = await compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }
    
    // Hash new password
    const hashedPassword = await hash(newPassword, 12);
    
    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });
    
    return NextResponse.json(
      { message: "Password changed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing password change:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}