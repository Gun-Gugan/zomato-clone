import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaKey, FaShoppingCart, FaLock, FaTrash, FaSignOutAlt } from 'react-icons/fa';

const Profile = () => {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [addressSuccess, setAddressSuccess] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.token) {
        toast.info('Please log in to view your profile.', {
          position: 'top-right',
          autoClose: 2000,
        });
        navigate('/login');
        return;
      }

      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
          withCredentials: true,
        };
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/auth/me`, config);
        setProfileData(data.user);
        setAddress(data.user.address || '');
      } catch (error) {
        console.error('Profile fetch error:', error.response?.data || error.message);
        const errorMessage = error.response?.status === 404
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

  useEffect(() => {
    let timer;
    if (otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prev) => (prev <= 1 ? clearInterval(timer) || 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpTimer]);

  const formatTimer = () => {
    const minutes = Math.floor(otpTimer / 60);
    const seconds = otpTimer % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleAddressUpdate = async (e) => {
    e.preventDefault();
    setAddressError('');
    setAddressSuccess('');

    const sanitizedAddress = address.replace(/[<>&'"]/g, '');
    if (!sanitizedAddress.trim()) {
      setAddressError('Please enter a valid address');
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
        withCredentials: true,
      };
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/auth/update-address`,
        { address: sanitizedAddress },
        config
      );
      setProfileData({ ...profileData, address: data.user.address });
      setAddressSuccess('Address updated successfully');
      toast.success('Address updated successfully', {
        position: 'top-right',
        autoClose: 2000,
      });
    } catch (error) {
      console.error('Address update error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Failed to update address';
      setAddressError(errorMessage);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.', {
          position: 'top-right',
          autoClose: 2000,
        });
        logout();
        navigate('/login');
      }
    }
  };

  const handleSendDeleteOtp = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setOtpError('');
    setOtpSuccess('');
    setIsSendingOtp(true);

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
        withCredentials: true,
      };
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/send-delete-otp`, {}, config);
      setOtpSent(true);
      setOtpTimer(120);
      setOtpSuccess('OTP sent to your email for account deletion verification.');
      toast.success('OTP sent to your email.', {
        position: 'top-right',
        autoClose: 2000,
      });
    } catch (error) {
      console.error('Send delete OTP error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Failed to send OTP';
      setOtpError(errorMessage);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.', {
          position: 'top-right',
          autoClose: 2000,
        });
        logout();
        navigate('/login');
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setOtpError('');
    setOtpSuccess('');

    const sanitizedOtp = otp.replace(/[<>&'"]/g, '');
    if (!sanitizedOtp.trim()) {
      setOtpError('Please enter the OTP');
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
        withCredentials: true,
      };
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/auth/delete-account`, {
        ...config,
        data: { otp: sanitizedOtp },
      });
      setOtpSuccess('Account deleted successfully');
      toast.success('Account deleted successfully', {
        position: 'top-right',
        autoClose: 2000,
      });
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Delete account error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Failed to delete account';
      setOtpError(errorMessage);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.', {
          position: 'top-right',
          autoClose: 2000,
        });
        logout();
        navigate('/login');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 text-sm md:text-base">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
        <p className="text-red-500 text-sm md:text-base font-semibold bg-white p-4 rounded-lg shadow max-w-full md:max-w-lg text-center">{error}</p>
      </div>
    );
  }

  if (!profileData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-6 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl bg-white rounded-xl shadow-lg p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">Your Profile</h1>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-4 sm:space-y-0">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xl md:text-2xl font-semibold text-blue-600">{profileData.name.charAt(0).toUpperCase()}</span>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm md:text-base font-medium text-gray-900">
                <span className="font-semibold">Name:</span> {profileData.name}
              </p>
              <p className="text-sm md:text-base font-medium text-gray-900">
                <span className="font-semibold">Email:</span> {profileData.email}
              </p>
              <p className="text-sm md:text-base font-medium text-gray-900">
                <span className="font-semibold">Address:</span> {profileData.address || 'Not set'}
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-4">
              {addressError && (
                <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-lg">{addressError}</p>
              )}
              {addressSuccess && (
                <p className="text-green-500 text-sm text-center bg-green-100 p-2 rounded-lg">{addressSuccess}</p>
              )}
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                <span className="px-3 text-gray-500"><FaMapMarkerAlt /></span>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Update your address"
                  className="w-full py-2 px-2 focus:outline-none text-sm md:text-base"
                />
              </div>
              <button
                onClick={handleAddressUpdate}
                className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 text-sm md:text-base"
              >
                Update Address
              </button>
            </div>
            {otpSent && (
              <div className="space-y-4">
                {otpError && (
                  <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-lg">{otpError}</p>
                )}
                {otpSuccess && (
                  <p className="text-green-500 text-sm text-center bg-green-100 p-2 rounded-lg">{otpSuccess}</p>
                )}
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <span className="px-3 text-gray-500"><FaKey /></span>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    className="w-full py-2 px-2 focus:outline-none text-sm md:text-base"
                  />
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-150 text-sm md:text-base"
                >
                  Verify OTP & Delete Account
                </button>
                <button
                  onClick={handleSendDeleteOtp}
                  disabled={otpTimer > 0 || isSendingOtp}
                  className={`w-full py-2 px-4 font-semibold rounded-lg shadow-md transition duration-150 text-sm md:text-base ${
                    otpTimer > 0 || isSendingOtp ? 'bg-gray-400 text-gray-800 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isSendingOtp ? 'Sending OTP...' : otpTimer > 0 ? `Wait ${formatTimer()} to Resend OTP` : 'Resend OTP'}
                </button>
                <button
                  onClick={() => {
                    setOtpSent(false);
                    setOtp('');
                    setOtpError('');
                    setOtpSuccess('');
                    setOtpTimer(0);
                  }}
                  className="w-full py-2 px-4 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition duration-150 text-sm md:text-base"
                >
                  Cancel Deletion
                </button>
              </div>
            )}
          </div>
        </div>
        <nav className="mt-6 border-t border-gray-200 pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => navigate('/orders')}
              className="flex flex-col items-center justify-center py-2 text-gray-600 hover:text-blue-600 transition duration-150"
            >
              <FaShoppingCart className="text-lg md:text-xl" />
              <span className="text-xs md:text-sm">Orders</span>
            </button>
            <button
              onClick={() => navigate('/forgot-password')}
              className="flex flex-col items-center justify-center py-2 text-gray-600 hover:text-yellow-600 transition duration-150"
            >
              <FaLock className="text-lg md:text-xl" />
              <span className="text-xs md:text-sm">Reset Password</span>
            </button>
            <button
              onClick={handleSendDeleteOtp}
              disabled={otpSent}
              className={`flex flex-col items-center justify-center py-2 transition duration-150 ${
                otpSent ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <FaTrash className={`text-lg md:text-xl ${otpSent ? 'text-gray-400' : ''}`} />
              <span className={`text-xs md:text-sm ${otpSent ? 'text-gray-400' : ''}`}>Delete</span>
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="flex flex-col items-center justify-center py-2 text-gray-600 hover:text-red-600 transition duration-150"
            >
              <FaSignOutAlt className="text-lg md:text-xl" />
              <span className="text-xs md:text-sm">Log Out</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Profile;
