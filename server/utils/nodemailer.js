import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS || !process.env.ADMIN_EMAIL) {
  throw new Error('Missing email configuration in .env');
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP verification failed:', error.message, error.stack);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

export async function sendContactEmail({ name, email, subject, message }) {
  console.log('Sending contact email with:', { name, email, subject, message, to: email, cc: process.env.ADMIN_EMAIL });

  const mailOptions = {
    from: `"Zomato Clone" <${process.env.GMAIL_USER}>`,
    to: email,
    cc: process.env.ADMIN_EMAIL,
    subject: `Contact Form Confirmation: ${subject}`,
    text: `Dear ${name},\n\nThank you for your message.\n\nSubject: ${subject}\nMessage: ${message}\n\nWe will respond soon.\nBest regards,\nZomato Clone Team`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Contact email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Nodemailer error (contact email):', error.message, error.stack);
    throw new Error('Failed to send contact email');
  }
}

export async function sendOtpEmail(to, otp, purpose = 'verification') {
  const subject = purpose === 'reset' ? 'Password Reset OTP' : purpose === 'delete' ? 'Account Deletion OTP' : 'Account Verification OTP';
  const text = `Your OTP for ${purpose === 'reset' ? 'password reset' : purpose === 'delete' ? 'account deletion' : 'account verification'} is ${otp}. It is valid for 2 minutes.`;

  const mailOptions = {
    from: `"Zomato Clone" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${to}:`, info.messageId);
    return info;
  } catch (error) {
    console.error('Nodemailer error (OTP email):', error.message, error.stack);
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
}
