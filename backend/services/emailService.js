import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import ejs from 'ejs';

dotenv.config();

// Ensure __dirname is defined for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports like 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD // This should be your Gmail App Password
  },
  tls: {
    rejectUnauthorized: false // Allow self-signed certificates
  }
});

// Generic function to send emails
export const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"Leap-On Mentorship" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

// Load email template
const loadTemplate = (templateName, replacements) => {
  try {
    const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
    let template = fs.readFileSync(templatePath, 'utf8');
    for (const [key, value] of Object.entries(replacements)) {
      template = template.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return template;
  } catch (error) {
    console.error(`Error loading template "${templateName}":`, error);
    throw new Error(`Template "${templateName}" not found`);
  }
};

// Send verification email
export const sendVerificationEmail = async (email, verificationUrl) => {
  const subject = 'Verify Your Email';
  const html = loadTemplate('verification', { verificationUrl });
  await sendEmail({ to: email, subject, html });
};

// Send login notification email
export const sendLoginNotificationEmail = async (email, firstName) => {
  const subject = 'Login Notification';
  const html = loadTemplate('loginNotification', { firstName });
  await sendEmail({ to: email, subject, html });
};

// Send profile completion email
export const sendProfileCompletionEmail = async (email, firstName) => {
  const subject = 'Profile Completion';
  const html = loadTemplate('profileCompletion', { firstName });
  await sendEmail({ to: email, subject, html });
};

// Send password reset notification email
export const sendPasswordResetNotification = async (email, resetUrl, firstName, otp) => {
  const subject = 'Password Reset Requested';
  const html = loadTemplate('passwordResetNotification', { resetUrl, firstName, otp }); // Pass template name
  await sendEmail({ to: email, subject, html });
};

// Send password change notification email
export const sendPasswordChangeNotification = async (email, firstName) => {
  const subject = 'Password Changed Successfully';
  const html = loadTemplate('passwordChangeNotification', { firstName }); // Pass template name
  await sendEmail({ to: email, subject, html });
};

// Send connection email
export const sendConnectionEmail = async (recipientEmail, templateName, data) => {
  const subject = 'Connection Request on Leap-On Mentorship';
  const html = loadTemplate(templateName, {
    ...data,
    acceptUrl: data.acceptUrl,
    rejectUrl: data.rejectUrl,
  });
  await sendEmail({ to: recipientEmail, subject, html });
};

// Send session email
export const sendSessionEmail = async (recipientEmail, templateName, data) => {
  const subject = 'Session Request on Leap-On Mentorship';
  const html = loadTemplate(templateName, {
    ...data,
    acceptUrl: data.acceptUrl,
    rejectUrl: data.rejectUrl,
    roomId: data.roomId,
    roomLink: data.roomLink,
  });
  await sendEmail({ to: recipientEmail, subject, html });
};

export default transporter;