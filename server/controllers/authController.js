import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
import { sendOtpEmail } from '../utils/nodemailer.js';

dotenv.config();

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export const registerUser = async (req, res) => {
  const { name, email, password, otp, address } = req.body;
  try {
    if (!name || !email || !password || !otp || !address) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    if (!address.trim()) {
      return res.status(400).json({ message: 'Address is required' });
    }

    const user = await User.findOne({
      email,
      loginOtpExpires: { $gt: new Date() },
    });
    if (!user || !(await bcrypt.compare(otp, user.loginOtp))) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    if (user.password) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.name = name;
    user.password = hashedPassword;
    user.address = address;
    user.loginOtp = undefined;
    user.loginOtpExpires = undefined;
    await user.save();

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { name: user.name, email: user.email, address: user.address } });
  } catch (err) {
    res.status(500).json({ error: `Registration failed: ${err.message}` });
  }
};

export const loginUser = async (req, res) => {
  const { email, password, otp } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (otp) {
      if (!user.loginOtp || !(await bcrypt.compare(otp, user.loginOtp)) || user.loginOtpExpires < new Date()) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }
      user.loginOtp = undefined;
      user.loginOtpExpires = undefined;
      await user.save();
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { name: user.name, email: user.email, address: user.address } });
  } catch (err) {
    res.status(500).json({ error: `Login failed: ${err.message}` });
  }
};

export const sendLoginOtp = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000);

    user.loginOtp = await bcrypt.hash(otp, 10);
    user.loginOtpExpires = otpExpires;
    await user.save();

    await Promise.race([
      sendOtpEmail(email, otp, 'login'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Email sending timed out')), 30000)),
    ]);
    res.status(200).json({ message: 'Login OTP sent to email' });
  } catch (err) {
    res.status(500).json({ error: `Failed to send login OTP: ${err.message}` });
  }
};

export const sendOtpRegister = async (req, res) => {
  const { email, address } = req.body;
  try {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (!address || !address.trim()) {
      return res.status(400).json({ message: 'Address is required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.password) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000);

    await User.updateOne(
      { email },
      { $set: { email, address, loginOtp: await bcrypt.hash(otp, 10), loginOtpExpires: otpExpires } },
      { upsert: true }
    );

    await Promise.race([
      sendOtpEmail(email, otp, 'verification'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Email sending timed out')), 30000)),
    ]);
    res.status(200).json({ message: 'OTP sent to email' });
  } catch (err) {
    res.status(500).json({ error: `Failed to send OTP: ${err.message}` });
  }
};

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000);

    user.resetOtp = await bcrypt.hash(otp, 10);
    user.resetOtpExpires = otpExpires;
    await user.save();

    await Promise.race([
      sendOtpEmail(email, otp, 'reset'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Email sending timed out')), 30000)),
    ]);
    res.status(200).json({ message: 'Reset OTP sent to email' });
  } catch (err) {
    res.status(500).json({ error: `Failed to send reset OTP: ${err.message}` });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const user = await User.findOne({
      email,
      resetOtpExpires: { $gt: new Date() },
    });
    if (!user || !(await bcrypt.compare(otp, user.resetOtp))) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ error: `Password reset failed: ${err.message}` });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email address');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user: { name: user.name, email: user.email, address: user.address } });
  } catch (err) {
    res.status(500).json({ error: `Failed to fetch profile: ${err.message}` });
  }
};

export const updateAddress = async (req, res) => {
  const { address } = req.body;
  try {
    if (!address || !address.trim()) {
      return res.status(400).json({ message: 'Address is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.address = address;
    await user.save();

    res.json({ user: { name: user.name, email: user.email, address: user.address }, message: 'Address updated successfully' });
  } catch (err) {
    res.status(500).json({ error: `Failed to update address: ${err.message}` });
  }
};

export const sendDeleteOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000);

    user.deleteOtp = await bcrypt.hash(otp, 10);
    user.deleteOtpExpires = otpExpires;
    await user.save();

    await Promise.race([
      sendOtpEmail(user.email, otp, 'delete'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Email sending timed out')), 30000)),
    ]);
    res.status(200).json({ message: 'Delete OTP sent to email' });
  } catch (err) {
    res.status(500).json({ error: `Failed to send delete OTP: ${err.message}` });
  }
};

export const deleteAccount = async (req, res) => {
  const { otp } = req.body;
  try {
    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.deleteOtp || !(await bcrypt.compare(otp, user.deleteOtp)) || user.deleteOtpExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await User.deleteOne({ _id: user._id });
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: `Failed to delete account: ${err.message}` });
  }
};
