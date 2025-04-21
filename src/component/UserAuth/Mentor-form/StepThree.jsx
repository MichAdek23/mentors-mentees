import { GlobalContext } from '@/component/GlobalStore/GlobalState';
import React, { useContext, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useForm } from 'react-hook-form';
import { userApi } from '@/lib/api';

function StepThree() {
  const { handleIncreament, handleDecreament } = useContext(GlobalContext);

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const detailsForm = watch();

  // State to track the selected checkboxes
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    const stepThreeData = {
      selectedInterests: selectedInterests
    };
    localStorage.setItem('stepThreeData', JSON.stringify(stepThreeData));
  }, [selectedInterests]);

  // Load saved form data from localStorage on component mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('stepThreeData');
    if (savedFormData) {
      const parsedFormData = JSON.parse(savedFormData);
      setValue('selectedInterests', parsedFormData.selectedInterests);
      setSelectedInterests(parsedFormData.selectedInterests || []);
    }
  }, [setValue]);

  // Handle checkbox change
  const handleCheckboxChange = (interest) => {
    let updatedInterests = [...selectedInterests];
    if (updatedInterests.includes(interest)) {
      updatedInterests = updatedInterests.filter(item => item !== interest);
    } else if (updatedInterests.length < 3) {
      updatedInterests.push(interest);
    }
    setSelectedInterests(updatedInterests);
    setValue('selectedInterests', updatedInterests, { shouldValidate: true });
    setErrorMessage('');
  };

  // Handle form submission
  const onSubmit = async () => {
    if (selectedInterests.length === 3) {
      try {
        // Send data to the backend
        await userApi.updateProfileStep3({
          interests: selectedInterests,
          role: 'mentor',
        });

        handleIncreament();
      } catch (error) {
        console.error('Error updating profile step 3:', error);
        alert(error.response?.data?.message || 'Failed to update profile. Please try again.');
      }
    } else {
      setErrorMessage('Please select exactly 3 areas of interest.');
    }
  };

  return (
    <div className="text-center lg:text-start w-[300px] lg:w-[400px]">
      {/* Back Button */}
      <div onClick={handleDecreament}>
        <button className="w-10 flex justify-center items-center text-slate-200 h-10 bg-slate-400 rounded-full">
          <FontAwesomeIcon className="text-2xl" icon={faArrowLeft} />
        </button>
      </div>

      {/* Step Indicator */}
      <p className="text-base text-center font-medium">STEP 3 of 4</p>

      {/* Progress Bar */}
      <progress className="bg-customOrange h-2" value="60" max="100"></progress>

      {/* Form Title */}
      <h1 className="mt-7 text-xl lg:text-[36px] font-medium">Select areas of Interest</h1>

      {/* Form */}
      <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        {/* Academics Checkbox */}
        <div className="flex justify-between border-2 rounded-lg p-4 items-center gap-2">
          <div className="flex items-center gap-4">
            <p className="text-base font-medium">Academic</p>
          </div>
          <input
            type="checkbox"
            checked={selectedInterests.includes('academics')}
            onChange={() => handleCheckboxChange('academics')}
            className="accent-customOrange text-white w-6 h-4 cursor-pointer"
          />
        </div>

        {/* Business/Entrepreneurship Checkbox */}
        <div className="flex justify-between border-2 rounded-lg p-4 items-center gap-2">
          <div className="flex items-center gap-4">
            <p className="text-base font-medium">Business/Entrepreneurship</p>
          </div>
          <input
            type="checkbox"
            checked={selectedInterests.includes('business')}
            onChange={() => handleCheckboxChange('business')}
            className="accent-customOrange text-white w-6 h-4 cursor-pointer"
          />
        </div>

        {/* Career Guidance Checkbox */}
        <div className="flex justify-between border-2 rounded-lg p-4 items-center gap-2">
          <div className="flex items-center gap-4">
            <p className="text-base font-medium">Career Guidance</p>
          </div>
          <input
            type="checkbox"
            checked={selectedInterests.includes('career')}
            onChange={() => handleCheckboxChange('career')}
            className="accent-customOrange text-white w-6 h-4 cursor-pointer"
          />
        </div>

        {/* Christ-like Discipleship Checkbox */}
        <div className="flex justify-between border-2 rounded-lg p-4 items-center gap-2">
          <div className="flex items-center gap-4">
            <p className="text-base font-medium">Christ-like Discipleship</p>
          </div>
          <input
            type="checkbox"
            checked={selectedInterests.includes('discipleship')}
            onChange={() => handleCheckboxChange('discipleship')}
            className="accent-customOrange text-white w-6 h-4 cursor-pointer"
          />
        </div>

        {/* Personal Development and Leadership Checkbox */}
        <div className="flex justify-between border-2 rounded-lg p-4 items-center gap-2">
          <div className="flex items-center gap-4">
            <p className="text-base font-medium">Personal Development and Leadership</p>
          </div>
          <input
            type="checkbox"
            checked={selectedInterests.includes('personalDevelopment')}
            onChange={() => handleCheckboxChange('personalDevelopment')}
            className="accent-customOrange text-white w-6 h-4 cursor-pointer"
          />
        </div>

        {/* Error Message */}
        {errors.selectedInterests && (
          <p className="text-red-500 text-sm">Please select exactly 3 areas of interest.</p>
        )}
        {errorMessage && (
          <p className="text-red-500 text-sm">{errorMessage}</p>
        )}

        {/* Continue Button */}
        <button
          type="submit"
          className="mt-4 w-full h-11 lg:h-14 rounded-lg cursor-pointer text-white bg-customOrange"
        >
          Continue
        </button>
      </form>
    </div>
  );
}

export default StepThree;