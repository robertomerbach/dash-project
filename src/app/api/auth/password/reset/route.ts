// app/api/auth/password/reset/route.ts
import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { z } from "zod";
import prisma from "@/lib/prisma";

// Schema for password reset
const resetPasswordSchema = z.object({
  token: z.string().uuid(),
  password: z.string().min(8).max(100),
});

/**
 * POST: Reset password using token
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.format() },
        { status: 400 }
      );
    }
    
    const { token, password } = validation.data;
    
    // Verify if token is valid
    const user = await prisma.user.findFirst({
      where: { 
        resetToken: token,
        resetTokenExpires: { gt: new Date() },
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }
    
    // Hash the new password
    const hashedPassword = await hash(password, 12);
    
    // Update user password and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null
      }
    });
    
    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing password reset:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}