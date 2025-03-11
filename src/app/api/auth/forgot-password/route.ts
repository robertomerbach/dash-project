import { NextResponse } from "next/server"
import { generateToken } from "@/lib/utils"
import { sendEmail } from "@/lib/email"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // If user doesn't exist, return success anyway for security
    if (!user) {
      return NextResponse.json(
        { success: true },
        { status: 200 }
      )
    }

    // Generate recovery token
    const token = generateToken(32)
    const expires = new Date()
    expires.setHours(expires.getHours() + 1) // Token expires in 1 hour

    // Save the recovery token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpires: expires
      }
    })

    // Generate recovery URL
    const recoveryUrl = `${process.env.NEXTAUTH_URL}/change-password?token=${token}&type=recovery`

    // Send recovery email
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #0070f3;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              font-size: 14px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Reset Your Password</h1>
            <p>Hello ${user.name || 'there'},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center;">
              <a href="${recoveryUrl}" class="button">Reset Password</a>
            </p>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <div class="footer">
              <p>This link will expire in 1 hour.</p>
              <p>If the button doesn't work, copy and paste this URL into your browser:</p>
              <p style="word-break: break-all;">${recoveryUrl}</p>
            </div>
          </div>
        </body>
      </html>
    `

    await sendEmail({
      to: email,
      subject: "Reset your password",
      html
    })

    return NextResponse.json(
      { success: true },
      { status: 200 }
    )

  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 