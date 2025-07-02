import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
import { sendOtpEmail } from '../utils/nodemailer.js';

dotenv.config();

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

export const registerUser = async (req, res) => {
  const { name, email, password, otp, address } = req.body;
  try {
    console.log('registerUser called with:', { name, email, address, otp });
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
    console.log('User registered successfully:', { email });

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { name: user.name, email: user.email, address: user.address } });
  } catch (err) {
    console.error('Register error:', err.message, err.stack);
    res.status(500).json({ error: `Registration failed: ${err.message}` });
  }
};

export const loginUser = async (req, res) => {
  const { email, password, otp } = req.body;
  try {
    console.log('loginUser called with:', { email, otp: !!otp });
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
      console.log('OTP verified and cleared for user:', { email });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { name: user.name, email: user.email, address: user.address } });
  } catch (err) {
    console.error('Login error:', err.message, err.stack);
    res.status(500).json({ error: `Login failed: ${err.message}` });
  }
};

export const sendLoginOtp = async (req, res) => {
  const { email } = req.body;
  try {
    console.log('sendLoginOtp called with:', { email });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes expiry

    user.loginOtp = await bcrypt.hash(otp, 10); // Hash OTP
    user.loginOtpExpires = otpExpires;
    await user.save();
    console.log('Login OTP saved for user:', { email, otpExpires });

    await Promise.race([
      sendOtpEmail(email, otp, 'login'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Email sending timed out')), 30000)),
    ]);
    res.status(200).json({ message: 'Login OTP sent to email' });
  } catch (err) {
    console.error('Send login OTP error:', err.message, err.stack);
    res.status(500).json({ error: `Failed to send login OTP: ${err.message}` });
  }
};

export const sendOtpRegister = async (req, res) => {
  const { email, address } = req.body;
  try {
    console.log('sendOtpRegister called with:', { email, address });
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
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes expiry

    await User.updateOne(
      { email },
      { $set: { email, address, loginOtp: await bcrypt.hash(otp, 10), loginOtpExpires: otpExpires } },
      { upsert: true }
    );
    console.log('Register OTP saved for user:', { email, otpExpires });

    await Promise.race([
      sendOtpEmail(email, otp, 'verification'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Email sending timed out')), 30000)),
    ]);
    res.status(200).json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error('Send OTP error:', err.message, err.stack);
    res.status(500).json({ error: `Failed to send OTP: ${err.message}` });
  }
};

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  try {
    console.log('sendResetOtp called with:', { email });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes expiry

    user.resetOtp = await bcrypt.hash(otp, 10); // Hash OTP
    user.resetOtpExpires = otpExpires;
    console.log('User before save:', { email: user.email, resetOtp: user.resetOtp, resetOtpExpires: user.resetOtpExpires });
    await user.save();
    console.log('User saved successfully');

    await Promise.race([
      sendOtpEmail(email, otp, 'reset'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Email sending timed out')), 30000)),
    ]);
    res.status(200).json({ message: 'Reset OTP sent to email' });
  } catch (err) {
    console.error('Send reset OTP error:', err.message, err.stack);
    res.status(500).json({ error: `Failed to send reset OTP: ${err.message}` });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    console.log('resetPassword called with:', { email, otp });
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
    console.log('Password reset successfully for user:', { email });

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err.message, err.stack);
    res.status(500).json({ error: `Password reset failed: ${err.message}` });
  }
};

export const getProfile = async (req, res) => {
  try {
    console.log('getProfile called for user ID:', req.user.id);
    const user = await User.findById(req.user.id).select('name email address');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user: { name: user.name, email: user.email, address: user.address } });
  } catch (err) {
    console.error('Get profile error:', err.message, err.stack);
    res.status(500).json({ error: `Failed to fetch profile: ${err.message}` });
  }
};

export const updateAddress = async (req, res) => {
  const { address } = req.body;
  try {
    console.log('updateAddress called for user ID:', req.user.id, 'with address:', address);
    if (!address || !address.trim()) {
      return res.status(400).json({ message: 'Address is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.address = address;
    await user.save();
    console.log('Address updated successfully for user:', { email: user.email });

    res.json({ user: { name: user.name, email: user.email, address: user.address }, message: 'Address updated successfully' });
  } catch (err) {
    console.error('Update address error:', err.message, err.stack);
    res.status(500).json({ error: `Failed to update address: ${err.message}` });
  }
};

export const sendDeleteOtp = async (req, res) => {
  try {
    console.log('sendDeleteOtp called for user ID:', req.user.id);
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes expiry

    user.deleteOtp = await bcrypt.hash(otp, 10); // Hash OTP
    user.deleteOtpExpires = otpExpires;
    await user.save();
    console.log('Delete OTP saved for user:', { email: user.email, otpExpires });

    await Promise.race([
      sendOtpEmail(user.email, otp, 'delete'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Email sending timed out')), 30000)),
    ]);
    res.status(200).json({ message: 'Delete OTP sent to email' });
  } catch (err) {
    console.error('Send delete OTP error:', err.message, err.stack);
    res.status(500).json({ error: `Failed to send delete OTP: ${err.message}` });
  }
};

export const deleteAccount = async (req, res) => {
  const { otp } = req.body;
  try {
    console.log('deleteAccount called for user ID:', req.user.id, 'with OTP:', otp);
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
    console.log('Account deleted successfully for user ID:', req.user.id);
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err.message, err.stack);
    res.status(500).json({ error: `Failed to delete account: ${err.message}` });
  }
};
