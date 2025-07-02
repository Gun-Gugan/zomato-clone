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

transporter.verify(() => {});

export async function sendContactEmail({ name, email, subject, message }) {
  const mailOptions = {
    from: `"Zomato Clone" <${process.env.GMAIL_USER}>`,
    to: email,
    cc: process.env.ADMIN_EMAIL,
    subject: `Contact Form Confirmation: ${subject}`,
    text: `Dear ${name},\n\nThank you for your message.\n\nSubject: ${subject}\nMessage: ${message}\n\nWe will respond soon.\nBest regards,\nZomato Clone Team`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw new Error('Failed to send contact email');
  }
}

export async function sendOtpEmail(to, otp, purpose = 'verification') {
  const subject =
    purpose === 'reset'
      ? 'Password Reset OTP'
      : purpose === 'delete'
      ? 'Account Deletion OTP'
      : 'Account Verification OTP';

  const text = `Your OTP for ${
    purpose === 'reset'
      ? 'password reset'
      : purpose === 'delete'
      ? 'account deletion'
      : 'account verification'
  } is ${otp}. It is valid for 2 minutes.`;

  const mailOptions = {
    from: `"Zomato Clone" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw new Error('Failed to send OTP email');
  }
}
