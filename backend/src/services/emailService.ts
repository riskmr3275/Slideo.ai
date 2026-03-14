import nodemailer from 'nodemailer';
import {
  welcomeEmailTemplate,
  otpEmailTemplate,
  passwordResetEmailTemplate,
  presentationSharedEmailTemplate,
  accountDeletedEmailTemplate,
} from './emailTemplates';

// ── Transporter ───────────────────────────────────────────────────────────────
const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.LESS_SECURE_PASSWORD;

  if (!user || !pass) {
    throw new Error('EMAIL_USER or LESS_SECURE_PASSWORD is not set in environment variables');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
};

// ── Generic send helper ───────────────────────────────────────────────────────
export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  const transporter = createTransporter();
  const from = `"Slideo.ai" <${process.env.EMAIL_USER}>`;

  await transporter.sendMail({ from, to, subject, html });
  console.log(`[EmailService] Email sent → ${to} | Subject: "${subject}"`);
};

// ── Convenience methods ───────────────────────────────────────────────────────

/** Sent immediately after a successful signup */
export const sendWelcomeEmail = async (to: string, name: string): Promise<void> => {
  await sendEmail(
    to,
    '🎉 Welcome to Slideo.ai — Let\'s build something amazing!',
    welcomeEmailTemplate(name)
  );
};

/** OTP for email verification or 2FA */
export const sendOTPEmail = async (
  to: string,
  otp: string,
  expiryMinutes = 10
): Promise<void> => {
  await sendEmail(
    to,
    `🔐 Your Slideo.ai verification code: ${otp}`,
    otpEmailTemplate(otp, expiryMinutes)
  );
};

/** Password reset magic link */
export const sendPasswordResetEmail = async (
  to: string,
  resetUrl: string,
  expiryMinutes = 30
): Promise<void> => {
  await sendEmail(
    to,
    '🔑 Reset your Slideo.ai password',
    passwordResetEmailTemplate(resetUrl, expiryMinutes)
  );
};

/** Notify a user that a presentation was shared with them */
export const sendPresentationSharedEmail = async (
  to: string,
  senderName: string,
  presentationTitle: string,
  shareUrl: string,
  permission: string = 'view'
): Promise<void> => {
  await sendEmail(
    to,
    `📊 ${senderName} shared a presentation with you — Slideo.ai`,
    presentationSharedEmailTemplate(senderName, presentationTitle, shareUrl, permission)
  );
};

/** Confirmation after account deletion */
export const sendAccountDeletedEmail = async (
  to: string,
  name: string
): Promise<void> => {
  await sendEmail(
    to,
    '😢 Your Slideo.ai account has been deleted',
    accountDeletedEmailTemplate(name)
  );
};
