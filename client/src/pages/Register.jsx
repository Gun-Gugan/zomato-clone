import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaKey, FaMapMarkerAlt } from 'react-icons/fa';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', otp: '', address: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.token) {
      navigate('/restaurants', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    let timer;
    if (otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer(prev => (prev <= 1 ? clearInterval(timer) || 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpTimer]);

  const formatTimer = () => {
    const minutes = Math.floor(otpTimer / 60);
    const seconds = otpTimer % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const sanitizeInput = (input) => input.replace(/[<>&'"]/g, '');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const sanitizedEmail = sanitizeInput(form.email);
    const sanitizedName = sanitizeInput(form.name);
    const sanitizedAddress = sanitizeInput(form.address);

    if (!isValidEmail(sanitizedEmail)) return setError('Please enter a valid email address');
    if (!sanitizedName.trim()) return setError('Please enter your name');
    if (!sanitizedAddress.trim()) return setError('Please enter your address');

    try {
      setIsSendingOtp(true);
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/send-otp-register`,
        { email: sanitizedEmail, address: sanitizedAddress },
        { withCredentials: true }
      );
      setOtpSent(true);
      setOtpTimer(120);
      setSuccess('OTP sent successfully to your email.');
    } catch (err) {
      const msg = err.response?.data?.message === 'Email already exists'
        ? 'User already exists. Please use a different email or log in.'
        : err.response?.data?.message || 'Failed to send OTP. Please try again.';
      setError(msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { name, email, password, otp, address } = form;
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedName = sanitizeInput(name);
    const sanitizedOtp = sanitizeInput(otp);
    const sanitizedAddress = sanitizeInput(address);

    if (!isValidEmail(sanitizedEmail)) return setError('Please enter a valid email address');
    if (!sanitizedName.trim()) return setError('Please enter your name');
    if (!sanitizedAddress.trim()) return setError('Please enter your address');
    if (password.length < 8) return setError('Password must be at least 8 characters');
    if (!sanitizedOtp) return setError('Please enter the OTP');

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/register`,
        { name: sanitizedName, email: sanitizedEmail, password, otp: sanitizedOtp, address: sanitizedAddress },
        { withCredentials: true }
      );
      login(data.token);
      navigate('/restaurants', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message === 'Email already exists'
        ? 'User already exists. Please use a different email or log in.'
        : err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    }
  };

  const handleChangeEmail = () => {
    setOtpSent(false);
    setOtpTimer(0);
    setSuccess('');
    setError('');
    setForm({ ...form, otp: '' });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-700 via-red-600 to-rose-500 px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md space-y-6">
        <h2 className="text-3xl font-extrabold text-center text-gray-800">Create Your Account</h2>

        {error && <div className="text-red-600 text-center text-sm p-2 bg-red-100 rounded-lg">{error}</div>}
        {success && <div className="text-green-600 text-center text-sm p-2 bg-green-100 rounded-lg">{success}</div>}

        <form className="space-y-4" onSubmit={otpSent ? handleSubmit : handleSendOtp}>
          <InputField
            icon={<FaUser />}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={otpSent}
            placeholder="Name"
          />
          <InputField
            icon={<FaEnvelope />}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={otpSent}
            placeholder="Email"
            type="email"
          />
          <InputField
            icon={<FaMapMarkerAlt />}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            disabled={otpSent}
            placeholder="Enter Your Full Address"
          />
          {!otpSent ? (
            <>
              <InputField
                icon={<FaLock />}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Password"
                type="password"
              />
              <button
                type="submit"
                disabled={otpTimer > 0 || isSendingOtp}
                className={`w-full py-2 font-semibold rounded-lg transition duration-300 ${
                  otpTimer > 0 || isSendingOtp ? 'bg-gray-400 text-gray-800 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {isSendingOtp ? 'Sending OTP...' : otpTimer > 0 ? `Wait ${formatTimer()} to Resend OTP` : 'Send OTP'}
              </button>
            </>
          ) : (
            <>
              <InputField
                icon={<FaKey />}
                value={form.otp}
                onChange={(e) => setForm({ ...form, otp: e.target.value })}
                placeholder="Enter OTP"
              />
              <button
                type="submit"
                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg transition duration-300"
              >
                Verify OTP & Register
              </button>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={otpTimer > 0 || isSendingOtp}
                className={`w-full py-2 font-semibold rounded-lg transition duration-300 ${
                  otpTimer > 0 || isSendingOtp ? 'bg-gray-400 text-gray-800 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {isSendingOtp ? 'Sending OTP...' : otpTimer > 0 ? `Wait ${formatTimer()} to Resend OTP` : 'Resend OTP'}
              </button>
              <button
                type="button"
                onClick={handleChangeEmail}
                className="w-full py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition duration-300"
              >
                Change Email
              </button>
            </>
          )}
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-rose-600 hover:underline">Login here</Link>
          <br />
          <Link to="/" className="text-rose-600 hover:underline inline-block mt-2">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
};

const InputField = ({ icon, ...props }) => (
  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-rose-500">
    <span className="px-3 text-gray-500">{icon}</span>
    <input {...props} className="w-full py-2 px-2 focus:outline-none disabled:bg-gray-100" required />
  </div>
);

export default Register;
