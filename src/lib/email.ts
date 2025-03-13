import { Resend } from 'resend';

// Constants for email configuration
const DEFAULT_FROM_EMAIL = 'App <onboarding@resend.dev>';
const VERIFICATION_EXPIRY_HOURS = 24;
const INVITATION_EXPIRY_DAYS = 7;

// Environment variables with types for better type safety
const SMTP_API_KEY = process.env.SMTP_API_KEY as string;
const SMTP_FROM = process.env.SMTP_FROM as string;

// Initialize Resend once
const resend = new Resend(SMTP_API_KEY);

// Response type for email sending operations
interface EmailResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Base interface for all email operations
interface EmailProps {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send an email using Resend
 * @param params Email parameters
 * @returns Promise with email sending result
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = SMTP_FROM || DEFAULT_FROM_EMAIL
}: EmailProps): Promise<EmailResponse> {
  try {
    // Validate required inputs
    if (!to || !subject || !html) {
      throw new Error('Missing required email parameters');
    }

    const data = await resend.emails.send({
      from,
      to,
      subject,
      html
    });

    return { success: true, data };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error sending email' 
    };
  }
}

// Interface for verification email parameters
interface VerificationEmailProps {
  to: string;
  name: string;
  verificationUrl: string;
}

/**
 * Send a verification email to a user
 * @param params Verification email parameters
 * @returns Promise with email sending result
 */
export async function sendVerificationEmail({
  to,
  name,
  verificationUrl
}: VerificationEmailProps): Promise<EmailResponse> {
  const subject = "Verify your email";
  
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
            <p>This link expires in ${VERIFICATION_EXPIRY_HOURS} hours.</p>
          </div>
          <div class="footer">
            <p>If the button does not work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${verificationUrl}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject,
    html
  });
}

// Interface for team invitation email parameters
interface InviteEmailProps {
  email: string;
  name: string;
  inviteUrl: string;
  teamName: string;
}

/**
 * Send a team invitation email
 * @param params Invitation email parameters
 * @returns Promise with email sending result
 */
export async function sendInviteEmail({
  email,
  name,
  inviteUrl,
  teamName
}: InviteEmailProps): Promise<EmailResponse> {
  const subject = `Invitation to ${teamName}`;
  
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
            <p>This invitation will expire in ${INVITATION_EXPIRY_DAYS} days.</p>
            <p>If you did not request this invitation, please ignore this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject,
    html
  });
}

// Create email templates for reuse
export const emailTemplates = {
  /**
   * Create common HTML template structure to avoid repetition
   */
  createBaseTemplate: (content: string, title: string) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
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
          ${content}
        </div>
      </body>
    </html>
  `
};