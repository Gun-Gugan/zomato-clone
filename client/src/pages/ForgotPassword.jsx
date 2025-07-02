import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const { user, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState('request-otp');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.token) {
        return; 
      }

      try {
        setLoading(true);
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
          withCredentials: true,
        };
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/auth/me`, config);
        console.log('Profile - Fetched Data:', data.user);
        setEmail(data.user.email || '');
      } catch (error) {
        console.error('Profile fetch error:', error.response?.data || error.message);
        const errorMessage =
          error.response?.status === 404
            ? 'User profile endpoint not found. Please check backend configuration.'
            : error.response?.data?.message || 'Failed to load profile';
        setError(errorMessage);
        if (error.response?.status === 401) {
          toast.error('Session expired. Please log in again.', {
            position: 'top-right',
            autoClose: 2000,
          });
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate, logout]);

  const handleRequestOtp = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      toast.error('Invalid email format', {
        position: 'top-right',
        autoClose: 2000,
      });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/send-reset-otp`, { email });
      toast.success('OTP sent to your email.', {
        position: 'top-right',
        autoClose: 2000,
      });
      setStep('reset-password');
    } catch (error) {
      console.error('Request OTP error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please check your email or try again later.';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp.trim()) {
      setError('Please enter the OTP');
      toast.error('Please enter the OTP', {
        position: 'top-right',
        autoClose: 2000,
      });
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      toast.error('Password must be at least 8 characters', {
        position: 'top-right',
        autoClose: 2000,
      });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/reset-password`, {
        email,
        otp,
        newPassword,
      });
      toast.success('Your password has been reset successfully.', {
        position: 'top-right',
        autoClose: 2000,
      });
      navigate(user?.token ? '/profile' : '/login');
    } catch (error) {
      console.error('Reset password error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && step === 'request-otp') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 text-sm md:text-base">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md md:max-w-lg bg-white rounded-xl shadow-lg p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
          {step === 'request-otp' ? 'Forgot Password' : 'Reset Password'}
        </h1>
        {error && (
          <p className="text-red-500 text-sm md:text-base text-center bg-red-100 p-2 rounded-lg mb-4">{error}</p>
        )}
        {step === 'request-otp' ? (
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm md:text-base font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => !user?.token && setEmail(e.target.value)}
                className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base ${user?.token ? 'bg-gray-100 text-gray-700' : ''}`}
                placeholder="Your email"
                required
                readOnly={!!user?.token}
              />
              {user?.token && (
                <p className="text-xs md:text-sm text-gray-500 mt-1">Email is pre-filled from your profile and cannot be changed.</p>
              )}
            </div>
            <button
              onClick={handleRequestOtp}
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 disabled:opacity-50 text-sm md:text-base"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
            <button
              onClick={() => navigate(user?.token ? '/profile' : '/login')}
              className="w-full py-2 px-4 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-150 text-sm md:text-base"
            >
              {user?.token ? 'Back to Profile' : 'Back to Login'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm md:text-base font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                disabled
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-100 text-gray-700 text-sm md:text-base"
                required
              />
            </div>
            <div>
              <label htmlFor="otp" className="block text-sm md:text-base font-medium text-gray-700">
                OTP
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                placeholder="Enter the OTP"
                required
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm md:text-base font-medium text-gray-700">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                placeholder="Enter new password"
                required
              />
            </div>
            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 disabled:opacity-50 text-sm md:text-base"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button
              onClick={() => navigate(user?.token ? '/profile' : '/login')}
              className="w-full py-2 px-4 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-150 text-sm md:text-base"
            >
              {user?.token ? 'Back to Profile' : 'Back to Login'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
