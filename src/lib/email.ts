import { Resend } from 'resend';

const resend = new Resend(process.env.SMTP_API_KEY);

interface EmailProps {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailProps) {
  try {
    const data = await resend.emails.send({
      from: process.env.SMTP_FROM || 'App <onboarding@resend.dev>',
      to,
      subject,
      html
    });

    return { success: true, data };
  } catch (error) {
    throw new Error('Error sending email');
  }
}

interface VerificationEmailProps {
  to: string
  name: string
  verificationUrl: string
}

export async function sendVerificationEmail({ to, name, verificationUrl }: VerificationEmailProps) {
  const subject = "Verify your email"
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your email</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            background-color: #f8f9fa;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .content {
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            border: 1px solid #e9ecef;
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
            text-align: center;
            margin-top: 20px;
            padding: 20px;
            color: #6c757d;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify your email</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>Thank you for signing up! To start using your account, we need to verify your email address.</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">
                Verify Email
              </a>
            </p>
            <p>If you did not sign up for our platform, you can ignore this email.</p>
            <p>This link expires in 24 hours.</p>
          </div>
          <div class="footer">
            <p>If the button does not work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${verificationUrl}</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to,
    subject,
    html
  })
}

interface InviteEmailProps {
  email: string
  name: string
  inviteUrl: string 
  teamName: string
}

export async function sendInviteEmail({ email, name, inviteUrl, teamName }: InviteEmailProps) {
  const subject = `Invitation to ${teamName}`
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation to ${teamName}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            max-width: 150px;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            background-color: #0070f3;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 4px;
            font-weight: 500;
            margin-top: 20px;
            margin-bottom: 20px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
          }
          .token {
            background-color: #f1f1f1;
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>You have been invited to ${teamName}</h1>
          </div>
          
          <p>Hello ${name},</p>
          
          <p>You have been invited to join <strong>${teamName}</strong>.</p>
          
          <p>Click the button below to accept the invitation and complete your registration:</p>
          
          <div style="text-align: center;">
            <a href="${inviteUrl}" class="button">Accept Invitation</a>
          </div>
          
          <p>Or copy and paste the following URL into your browser:</p>
          <p style="word-break: break-all;">${inviteUrl}</p>
          
          <div class="footer">
            <p>This invitation will expire in 7 days.</p>
            <p>If you did not request this invitation, please ignore this email.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject,
    html
  })
}