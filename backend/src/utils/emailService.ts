import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Send email verification link to user
 */
export const sendVerificationEmail = async (
  email: string,
  token: string,
  userName: string
): Promise<void> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verificationUrl = `${frontendUrl}/verify-email/${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #FF6B35 0%, #EF4444 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #ffffff;
          padding: 30px;
          border: 1px solid #e0e0e0;
          border-top: none;
        }
        .button {
          display: inline-block;
          padding: 15px 30px;
          background: linear-gradient(135deg, #FF6B35 0%, #EF4444 100%);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          margin: 20px 0;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #666;
          font-size: 12px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">MATCHBOX</div>
          <p>USC Student Collaboration Platform</p>
        </div>
        <div class="content">
          <h2>Welcome to MatchBox, ${userName}!</h2>
          <p>Thank you for signing up with your USC email. To complete your registration and access all features including competitions, please verify your email address.</p>

          <p>Click the button below to verify your email:</p>

          <center>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </center>

          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666; font-size: 14px;">${verificationUrl}</p>

          <p><strong>This link will expire in 48 hours.</strong></p>

          <p>If you didn't create an account on MatchBox, you can safely ignore this email.</p>

          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

          <p style="font-size: 14px; color: #666;">
            Need help? Contact us at support@matchbox.com
          </p>
        </div>
        <div class="footer">
          <p>&copy; 2025 MatchBox. All rights reserved.</p>
          <p>USC Student Collaboration Platform</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions: EmailOptions = {
    to: email,
    subject: 'Verify Your MatchBox Email Address',
    html,
  };

  await sendEmail(mailOptions);
};

/**
 * Generic email sending function
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter();

    const from = process.env.EMAIL_FROM || 'MatchBox <noreply@matchbox.com>';

    await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`Email sent successfully to ${options.to}`);
  } catch (error: any) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send password reset email (future use)
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  userName: string
): Promise<void> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FF6B35 0%, #EF4444 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
        .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #FF6B35 0%, #EF4444 100%); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>MATCHBOX</h1>
          <p>Password Reset Request</p>
        </div>
        <div class="content">
          <h2>Hi ${userName},</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>

          <center>
            <a href="${resetUrl}" class="button">Reset Password</a>
          </center>

          <p>Or copy this link: <br>${resetUrl}</p>

          <p><strong>This link will expire in 1 hour.</strong></p>

          <p>If you didn't request a password reset, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions: EmailOptions = {
    to: email,
    subject: 'Reset Your MatchBox Password',
    html,
  };

  await sendEmail(mailOptions);
};
