import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { userApi } from '../../../lib/api'; // Import userApi

function ResetPassword() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setError('');
      setSuccess('');
      console.log('Email to store:', data.email); // Debugging: Log the email
      if (data.email) {
        localStorage.setItem('resetEmail', data.email); // Store email in localStorage
      } else {
        throw new Error('Email is undefined or empty');
      }
      const response = await userApi.forgotPassword(data.email);
      setSuccess('Password reset instructions and OTP have been sent to your email');
      navigate(response.data.redirect); // Redirect to OTP page
    } catch (err) {
      console.error('Error storing email or sending request:', err); // Debugging: Log errors
      setError(err.response?.data?.message || 'Failed to send reset instructions. Please try again.');
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
          <h1 className="text-2xl font-bold lg:text-[40px] text-customDarkBlue">Reset Password</h1>
          <p className="text-slate-400 text-sm mt-2">Enter your email to receive reset instructions</p>

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
            <div className="mt-4">
              <div className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2">
                <span>
                  <FontAwesomeIcon className="text-gray-400 text-xl" icon={faEnvelope} />
                </span>
                <input
                  type="email"
                  {...register('email', { 
                    required: 'This field is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="outline-none w-full"
                  placeholder="Email"
                />
              </div>
              {errors.email && <p className="text-red-600">{errors.email.message}</p>}
            </div>

            <div className="mt-4">
              <button 
                type="submit" 
                className="text-white bg-customOrange w-full h-11 lg:h-14 rounded-lg cursor-pointer hover:bg-orange-600 transition-colors"
              >
                Send Reset Instructions
              </button>
            </div>

            <p className="mt-[30px] text-center text-sm font-medium text-customDarkBlue">
              Remember your password?
              <span className="text-customOrange ml-1">
                <Link to={'/login'}>Login</Link>
              </span>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ResetPassword;