const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body
 */
const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `"Event Management System" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send OTP email for password reset
 * @param {string} email - Recipient email
 * @param {string} otp - The OTP code
 * @param {string} name - User's name
 */
const sendOTPEmail = async (email, otp, name) => {
  const subject = 'Password Reset OTP - Event Management System';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #4f46e5; text-align: center; margin-bottom: 20px;">Password Reset Request</h2>
      <p style="color: #334155;">Hi <strong>${name}</strong>,</p>
      <p style="color: #334155;">You requested a password reset. Use the OTP below to reset your password:</p>
      <div style="text-align: center; margin: 28px 0;">
        <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4f46e5; background: #eef2ff; padding: 16px 32px; border-radius: 8px;">${otp}</span>
      </div>
      <p style="color: #64748b; font-size: 13px;">This OTP is valid for <strong>${process.env.OTP_EXPIRE_MINUTES || 10} minutes</strong>.</p>
      <p style="color: #64748b; font-size: 13px;">If you did not request this, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center;">Event Management System</p>
    </div>
  `;

  await sendEmail(email, subject, html);
};

module.exports = { sendEmail, sendOTPEmail };
