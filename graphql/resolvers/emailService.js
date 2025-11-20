const nodemailer = require('nodemailer');

// Create transporter (using Gmail just because)
const createTransporter = () => {
  return nodemailer.createTransporter({ 
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Email templates
const emailTemplates = {
  verification: (name, token) => ({
    subject: 'Verify Your Email - Expense Tracker',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Expense Tracker, ${name}!</h2>
        <p>Please verify your email address to complete your registration.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Verification Token:</strong></p>
          <p style="font-size: 18px; font-weight: bold; color: #007bff; margin: 10px 0;">${token}</p>
        </div>
        <p>Or click the link below:</p>
        <a href="${process.env.CLIENT_URL}/verify-email?token=${token}" 
           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Verify Email Address
        </a>
        <p style="margin-top: 20px; color: #666;">
          This token will expire in 1 hour. If you didn't create an account, please ignore this email.
        </p>
      </div>
    `,
  }),
  
  passwordReset: (name, token) => ({
    subject: 'Password Reset Request - Expense Tracker',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>We received a request to reset your password for your Expense Tracker account.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Reset Token:</strong></p>
          <p style="font-size: 18px; font-weight: bold; color: #dc3545; margin: 10px 0;">${token}</p>
        </div>
        <p>Or click the link below to reset your password:</p>
        <a href="${process.env.CLIENT_URL}/reset-password?token=${token}" 
           style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Reset Password
        </a>
        <p style="margin-top: 20px; color: #666;">
          This reset token will expire in 1 hour. If you didn't request a password reset, please ignore this email.
        </p>
      </div>
    `,
  }),
};

const sendEmail = async (to, templateName, data) => {
  try {
    // Forbid sending emails in dev mode if no email config
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
      console.log(`[EMAIL SIMULATED] ${templateName} to ${to}:`, data);
      return true;
    }

    const transporter = createTransporter();
    const template = emailTemplates[templateName](data.name, data.token);

    const mailOptions = {
      from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: template.subject,
      html: template.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

// Email specific functions
const sendVerificationEmail = async (user) => {
  return await sendEmail(user.email, 'verification', {
    name: user.name,
    token: user.emailVerificationToken,
  });
};

const sendPasswordResetEmail = async (user) => {
  return await sendEmail(user.email, 'passwordReset', {
    name: user.name,
    token: user.passwordResetToken,
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};