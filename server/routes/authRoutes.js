import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  registerUser,
  loginUser,
  sendLoginOtp,
  sendOtpRegister,
  sendResetOtp,
  resetPassword,
  getProfile,
  updateAddress,
  sendDeleteOtp,
  deleteAccount
} from '../controllers/authController.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// Rate limiter for OTP endpoints
const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 requests per email
  keyGenerator: (req) => req.user?.id || req.body.email,
});

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/send-otp-register', otpLimiter, sendOtpRegister);
router.post('/send-otp-login', otpLimiter, sendLoginOtp);
router.post('/send-reset-otp', otpLimiter, sendResetOtp);
router.post('/reset-password', resetPassword);
router.get('/me', verifyToken, getProfile);
router.put('/update-address', verifyToken, updateAddress);
router.post('/send-delete-otp', verifyToken, otpLimiter, sendDeleteOtp);
router.delete('/delete-account', verifyToken, deleteAccount);

export default router;
