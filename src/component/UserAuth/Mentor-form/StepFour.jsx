import React, { useContext, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { GlobalContext } from '@/component/GlobalStore/GlobalState';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../../lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

function StepFour() {
  const navigate = useNavigate();
  const { handleDecreament } = useContext(GlobalContext);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // Load saved form data from localStorage on component mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('stepFourData');
    if (savedFormData) {
      const parsedFormData = JSON.parse(savedFormData);
      setValue('bio', parsedFormData.bio);
      setValue('overview', parsedFormData.overview);
    }
  }, [setValue]);

  // Save form data to localStorage whenever it changes
  const onFormChange = (data) => {
    const stepFourData = {
      bio: data.bio,
      overview: data.overview
    };
    localStorage.setItem('stepFourData', JSON.stringify(stepFourData));
  };

  const handleFormSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');

      // Send step four data to the backend
      await userApi.updateProfileStep4({
        bio: data.bio || '',
        overview: data.overview || '',
      });

      // Clear all stored data after successful update
      localStorage.removeItem('stepFourData');

      // Navigate to payment page
      navigate('/payment');
    } catch (error) {
      console.error('Profile completion error:', error);
      setError(error.response?.data?.message || 'Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-6 lg:px-0 md:w-[400px]">
      {/* Back Button */}
      <div onClick={handleDecreament}>
        <button className="w-10 flex justify-center items-center text-slate-200 h-10 bg-slate-400 rounded-full">
          <FontAwesomeIcon className="text-2xl" icon={faArrowLeft} />
        </button>
      </div>

      {/* Step Indicator */}
      <p className="text-base text-center font-medium mt-4 lg:mt-6">STEP 4 of 4</p>

      {/* Progress Bar */}
      <progress className="bg-customOrange h-2" value="80" max="100"></progress>

      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] w-full sm:w-auto lg:w-[490px] font-semibold text-customDarkBlue">Complete Your Profile</h1>
      <p className="text-slate-400 text-sm mt-5">Please provide your bio information</p>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form className="mt-5" onSubmit={handleSubmit(handleFormSubmit)} onChange={handleSubmit(onFormChange)}>
        {/* Bio Field */}
        <div className="mt-4">
          <div className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2">
            <textarea
              {...register('bio', { 
                required: 'Bio is required',
                minLength: {
                  value: 50,
                  message: 'Bio must be at least 50 characters long'
                },
                maxLength: {
                  value: 500,
                  message: 'Bio must not exceed 500 characters'
                }
              })}
              className="outline-none w-full min-h-[120px] resize-none"
              placeholder="Tell us about yourself, your experience, and what you can offer as a mentor..."
            />
          </div>
          {errors.bio && <p className="text-red-600">{errors.bio.message}</p>}
        </div>

        {/* Overview Field */}
        <div className="mt-4">
          <div className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2">
            <textarea
              {...register('overview')}
              className="outline-none w-full min-h-[120px] resize-none"
              placeholder="Provide a brief overview of your professional experience and achievements..."
            />
          </div>
        </div>

        <div className="mt-4">
          <button 
            type="submit" 
            disabled={loading}
            className={`text-white bg-customOrange w-full h-11 lg:h-14 rounded-lg cursor-pointer hover:bg-orange-600 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Completing Profile...' : 'Complete Registration'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default StepFour;