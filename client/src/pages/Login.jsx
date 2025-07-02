import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaKey } from 'react-icons/fa';

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "", otp: "", newPassword: "" });
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [lastOtpEmail, setLastOtpEmail] = useState(""); // Track the email used for OTP
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user?.token) {
      navigate("/restaurants");
    }
  }, [user, navigate]);

  // OTP timer countdown
  useEffect(() => {
    let timer;
    if (otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpTimer]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    // Validate email before sending OTP
    if (!form.email.includes("@") || !form.email.includes(".")) {
      setError("Please enter a valid email address");
      return;
    }
    try {
      setIsSendingOtp(true);
      const endpoint = isResetMode 
        ? `${import.meta.env.VITE_BACKEND_URL}/auth/send-reset-otp`
        : `${import.meta.env.VITE_BACKEND_URL}/auth/send-otp-login`;
      console.log("Sending OTP request for email:", form.email);
      await axios.post(endpoint, { email: form.email }, { withCredentials: true });
      setOtpSent(true);
      setOtpTimer(120); // Set 2-minute (120 seconds) timer
      setLastOtpEmail(form.email); // Store the email used for OTP
    } catch (err) {
      console.error("OTP request error:", err.response?.data);
      const errorMessage = err.response?.data?.message || "Failed to send OTP. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // Client-side validation
    if (!form.email.includes("@") || !form.email.includes(".")) {
      setError("Please enter a valid email address");
      return;
    }
    if (!isResetMode && form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    if (otpSent && !form.otp) {
      setError("Please enter the OTP");
      return;
    }
    if (isResetMode && form.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }
    try {
      const endpoint = isResetMode 
        ? `${import.meta.env.VITE_BACKEND_URL}/auth/reset-password`
        : `${import.meta.env.VITE_BACKEND_URL}/auth/login`;
      const payload = isResetMode 
        ? { email: form.email, otp: form.otp, newPassword: form.newPassword }
        : otpSent 
          ? { email: form.email, password: form.password, otp: form.otp }
          : { email: form.email, password: form.password };
      console.log("Sending payload:", payload);
      const { data } = await axios.post(endpoint, payload, { withCredentials: true });
      if (!isResetMode) {
        login(data.token);
        navigate('/restaurants');
      } else {
        setError("Password reset successful! Please log in with your new password.");
        setIsResetMode(false);
        setOtpSent(false);
        setForm({ email: form.email, password: "", otp: "", newPassword: "" });
        setOtpTimer(0);
        setLastOtpEmail("");
      }
    } catch (err) {
      console.error("Error response:", err.response?.data);
      const errorMessage = err.response?.data?.message || 
        isResetMode ? "Password reset failed. Please check your OTP or try again." 
        : "Login failed. Please check your credentials or OTP.";
      setError(errorMessage);
    }
  };

  const handleForgotPassword = () => {
    setIsResetMode(true);
    setOtpSent(false);
    setError("");
    setForm({ email: form.email, password: "", otp: "", newPassword: "" });
    setOtpTimer(0);
    setLastOtpEmail("");
  };

  const handleChangeEmail = () => {
    if (form.email !== lastOtpEmail) {
      setOtpTimer(0); // Reset timer only if email has changed
    }
    setOtpSent(false);
    if (isResetMode) setIsResetMode(false);
  };

  // Format timer display
  const formatTimer = () => {
    const minutes = Math.floor(otpTimer / 60);
    const seconds = otpTimer % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-400 via-red-500 to-rose-600 px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md space-y-6 transition duration-300 ease-in-out transform hover:scale-[1.02]">
        <h2 className="text-3xl font-extrabold text-center text-gray-800">
          {isResetMode ? "Reset Your Password" : "Login to Your Account"}
        </h2>

        {error && <p className="text-red-500 text-center text-sm">{error}</p>}

        <div className="space-y-4">
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-rose-500">
            <span className="px-3 text-gray-500"><FaEnvelope /></span>
            <input
              type="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full py-2 px-2 focus:outline-none"
              disabled={otpSent}
              aria-label="Email"
            />
          </div>

          {!otpSent ? (
            <>
              {!isResetMode && (
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-rose-500">
                  <span className="px-3 text-gray-500"><FaLock /></span>
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full py-2 px-2 focus:outline-none"
                    aria-label="Password"
                  />
                </div>
              )}
              <button
                onClick={handleSendOtp}
                className={`w-full py-2 font-semibold rounded-lg transition duration-300 ${
                  otpTimer > 0 || isSendingOtp
                    ? 'bg-gray-400 text-gray-800 cursor-not-allowed' 
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
                disabled={otpTimer > 0 || isSendingOtp}
                aria-label={isResetMode ? "Send OTP for Password Reset" : "Send OTP for Login"}
              >
                {isSendingOtp ? 'Sending OTP...' : otpTimer > 0 ? `Wait ${formatTimer()} to Resend OTP` : 'Send OTP'}
              </button>
              {!isResetMode && (
                <p className="text-center text-sm">
                  <button
                    onClick={handleForgotPassword}
                    className="text-rose-600 hover:underline"
                    aria-label="Forgot Password"
                  >
                    Forgot Password?
                  </button>
                </p>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-rose-500">
                <span className="px-3 text-gray-500"><FaKey /></span>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  required
                  value={form.otp}
                  onChange={e => setForm({ ...form, otp: e.target.value })}
                  className="w-full py-2 px-2 focus:outline-none"
                  aria-label="OTP"
                />
              </div>
              {isResetMode && (
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-rose-500">
                  <span className="px-3 text-gray-500"><FaLock /></span>
                  <input
                    type="password"
                    placeholder="New Password"
                    required
                    value={form.newPassword}
                    onChange={e => setForm({ ...form, newPassword: e.target.value })}
                    className="w-full py-2 px-2 focus:outline-none"
                    aria-label="New Password"
                  />
                </div>
              )}
              <button
                onClick={handleSubmit}
                className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg transition duration-300"
                aria-label={isResetMode ? "Verify OTP and Reset Password" : "Verify OTP and Login"}
              >
                {isResetMode ? "Verify OTP & Reset Password" : "Verify OTP & Login"}
              </button>
              <button
                onClick={handleSendOtp}
                className={`w-full py-2 font-semibold rounded-lg transition duration-300 ${
                  otpTimer > 0 || isSendingOtp
                    ? 'bg-gray-400 text-gray-800 cursor-not-allowed' 
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
                disabled={otpTimer > 0 || isSendingOtp}
                aria-label="Resend OTP"
              >
                {isSendingOtp ? 'Sending OTP...' : otpTimer > 0 ? `Wait ${formatTimer()} to Resend OTP` : 'Resend OTP'}
              </button>
              <button
                onClick={handleChangeEmail}
                className="w-full py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition duration-300"
                aria-label="Change Email"
              >
                Change Email
              </button>
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link to="/register" className="text-rose-600 hover:underline">
            Register here
          </Link>
          <br />
          <Link to="/" className="text-rose-600 hover:underline mt-2 inline-block">
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
