import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { userApi } from '../../../lib/api'; // Import userApi

function ChangePassword() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordType, setPasswordType] = useState({
    new: false,
    confirm: false
  });
  const [resetToken, setResetToken] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const newPassword = watch('newPassword');

  useEffect(() => {
    // Extract token from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get('token');

    if (tokenFromUrl) {
      setResetToken(tokenFromUrl);
    } else {
      // Fallback to token from localStorage
      const tokenFromStorage = localStorage.getItem('resetToken');
      if (tokenFromStorage) {
        setResetToken(tokenFromStorage);
      } else {
        setError('Reset token is missing. Please use the reset link or verify your OTP again.');
      }
    }
  }, [location]);

  const togglePasswordVisibility = (field) => {
    setPasswordType((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const onSubmit = async (data) => {
    try {
      setError('');
      setSuccess('');

      if (!resetToken) {
        throw new Error('Reset token is missing. Please use the reset link or verify your OTP again.');
      }

      const trimmedNewPassword = data.newPassword.trim();
      const trimmedConfirmPassword = data.confirmPassword.trim();

      if (trimmedNewPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (trimmedNewPassword !== trimmedConfirmPassword) {
        throw new Error('Passwords do not match');
      }

      console.log('Sending password update request:', {
        token: resetToken,
        password: trimmedNewPassword,
      }); // Debug log

      await userApi.updatePassword({
        token: resetToken,
        password: trimmedNewPassword,
      });

      setSuccess('Password reset successfully');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reset password. Please try again.');
    }
  };

  return (
    <section className="relative flex h-full">
      <div className="hidden lg:block h-full w-3/5">
        <img src="/image/close-up-people-learning-together-office 1.png" loading="lazy" className="h-full w-full object-cover" alt="" />
        <div onClick={() => navigate('/')} className="absolute top-4">
          <img src="/image/LogoAyth.png" loading="lazy" className="w-40" alt="" />
        </div>
      </div>

      {/* Right Side Form */}
      <div className="flex flex-col lg:flex-row items-center w-full lg:w-2/5 justify-center">
        <div onClick={() => navigate('/')} className="block lg:hidden bg-black py-2 px-2">
          <img src="/image/LogoAyth.png" loading="lazy" className="w-40" alt="" />
        </div>
        <div className="w-full px-6 lg:px-0 md:w-[400px]">
          <h1 className="text-2xl font-bold lg:text-[40px] text-customDarkBlue">Change Password</h1>
          <p className="text-slate-400 text-sm mt-2">Enter your new password</p>

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          <form className="mt-5" onSubmit={handleSubmit(onSubmit)}>
            {/* New Password */}
            <div className="mt-4">
              <div className="flex items-center p-2 md:p-4 justify-between gap-3 w-full rounded-xl border-2">
                <div className="flex items-center justify-center gap-3">
                  <span>
                    <FontAwesomeIcon className="text-gray-400 text-xl" icon={faLock} />
                  </span>
                  <input
                    type={passwordType.new ? 'text' : 'password'}
                    {...register('newPassword', {
                      required: 'New password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters long',
                      },
                    })}
                    className="outline-none w-full"
                    placeholder="New Password"
                  />
                </div>
                <span onClick={() => togglePasswordVisibility('new')} className="cursor-pointer">
                  {passwordType.new ? (
                    <FontAwesomeIcon className="text-gray-400 text-lg" icon={faEye} />
                  ) : (
                    <FontAwesomeIcon className="text-gray-400 text-lg" icon={faEyeSlash} />
                  )}
                </span>
              </div>
              {errors.newPassword && <p className="text-red-600">{errors.newPassword.message}</p>}
            </div>

            {/* Confirm New Password */}
            <div className="mt-4">
              <div className="flex items-center p-2 md:p-4 justify-between gap-3 w-full rounded-xl border-2">
                <div className="flex items-center justify-center gap-3">
                  <span>
                    <FontAwesomeIcon className="text-gray-400 text-xl" icon={faLock} />
                  </span>
                  <input
                    type={passwordType.confirm ? 'text' : 'password'}
                    {...register('confirmPassword', {
                      required: 'Please confirm your new password',
                      validate: (value) => value === newPassword || 'Passwords do not match',
                    })}
                    className="outline-none w-full"
                    placeholder="Confirm New Password"
                  />
                </div>
                <span onClick={() => togglePasswordVisibility('confirm')} className="cursor-pointer">
                  {passwordType.confirm ? (
                    <FontAwesomeIcon className="text-gray-400 text-lg" icon={faEye} />
                  ) : (
                    <FontAwesomeIcon className="text-gray-400 text-lg" icon={faEyeSlash} />
                  )}
                </span>
              </div>
              {errors.confirmPassword && <p className="text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            <div className="mt-4">
              <button
                type="submit"
                className="text-white bg-customOrange w-full h-11 lg:h-14 rounded-lg cursor-pointer hover:bg-orange-600 transition-colors"
              >
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ChangePassword;