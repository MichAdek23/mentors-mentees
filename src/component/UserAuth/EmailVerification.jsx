import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faSpinner, faCheckCircle, faExclamationCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { userApi } from '../../lib/api';

function EmailVerification() {
  const { token } = useParams(); // Get the token from the URL
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        setLoading(true);
        setError('');
        setSuccess('');

        // Verify the email using the token
        const response = await userApi.verifyEmail(token);

        if (response.data) {
          const { message, token: authToken } = response.data;

          if (message === 'Email is already verified') {
            navigate('/mode-of-registering'); // Redirect if email is already verified
          } else {
            // Store the auth token in localStorage
            localStorage.setItem('token', authToken);

            setSuccess('Email verified successfully! Redirecting...');
            setTimeout(() => {
              navigate('/mode-of-registering'); // Redirect after successful verification
            }, 2000);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to verify email. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  useEffect(() => {
    // Get user email from localStorage
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.email) {
      setUserEmail(userData.email);
    }
  }, []);

  const handleResendEmail = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Resend verification email
      await userApi.sendVerificationEmail(userEmail);
      setSuccess('Verification email sent successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <section className="relative flex h-full">
      <div className="hidden lg:block h-full w-3/5">
        <div onClick={() => navigate('/')} className="w-full h-full">
          <img src="/image/close-up-people-learning-together-office 1.png" className="w-full h-full object-cover" alt="Logo" />
        </div>
      </div>

      <div className="flex items-center w-full lg:w-2/5 justify-center">
        <div className="w-full px-6 lg:px-0 md:w-[400px]">
          {/* Back Button */}
          <button 
            onClick={handleBack}
            className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back
          </button>

          <h1 className="text-2xl font-bold lg:text-[40px] text-customDarkBlue">Verify Your Email</h1>
          <p className="text-slate-400 text-sm mt-2">
            We've sent a verification link to <span className="font-semibold text-gray-700">{userEmail}</span>. 
            Please check your inbox and click the link to verify your account.
          </p>

          {loading && <p>Verifying your email...</p>}
          {error && <p className="text-red-600">{error}</p>}
          {success && <p className="text-green-600">{success}</p>}

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
              <FontAwesomeIcon icon={faExclamationCircle} />
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
              <FontAwesomeIcon icon={faCheckCircle} />
              {success}
            </div>
          )}

          <div className="mt-8 flex flex-col items-center">
            <div className="bg-orange-100 p-4 rounded-full mb-4">
              <FontAwesomeIcon icon={faEnvelope} className="text-3xl text-customOrange" />
            </div>
            
            <p className="text-center text-gray-600 mb-6">
              Didn't receive the email? Check your spam folder or try resending.
            </p>

            <button
              onClick={handleResendEmail}
              disabled={loading}
              className="w-full py-3 rounded-lg text-white bg-customOrange hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              ) : (
                'Resend Email'
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EmailVerification;