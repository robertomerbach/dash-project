// app/api/auth/password/forgot/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// Schema para recuperação de senha
const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

/**
 * POST: Request password reset
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate the email
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid email" },
        { status: 400 }
      );
    }
    
    const { email } = validation.data;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    
    // Even if the user doesn't exist, return success response for security
    if (!user) {
      return NextResponse.json(
        { message: "If the email is registered, you will receive password reset instructions." },
        { status: 200 }
      );
    }
    
    // Generate reset token
    const resetToken = randomUUID();
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // Expires in 1 hour
    
    // Save token directly on the user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    });
    
    // Send email
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: email,
      subject: "Password Reset",
      html: `
        <h1>Password Reset</h1>
        <p>Hello ${user.name || "user"},</p>
        <p>You requested a password reset for your Dashboard account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
      `,
    });
    
    return NextResponse.json(
      { message: "If the email is registered, you will receive password reset instructions." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing password recovery request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}