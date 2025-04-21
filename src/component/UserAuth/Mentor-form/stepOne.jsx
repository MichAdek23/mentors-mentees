import { GlobalContext } from '@/component/GlobalStore/GlobalState';
import React, { useContext, useState } from 'react';
import { userApi } from '@/lib/api';

function StepOne() {
  const { handleIncreament } = useContext(GlobalContext);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [gender, setGender] = useState('');

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 12 * 1024 * 1024) { // 12MB limit
        alert('File size must be less than 12MB');
        return;
      }

      const previewUrl = URL.createObjectURL(file); 
      setImageUrl(previewUrl); 

      try {
        setUploading(true);
        const formData = new FormData();
        formData.append('profilePicture', file);

        const response = await userApi.uploadProfilePicture(formData);
        console.log('API Response:', response);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert(error.message || 'Failed to upload image. Please try again.');
      } finally {
        setUploading(false);
      }
    }
  };
  console.log(imageUrl, 'imageUrl');

  const handleGenderSelect = (selectedGender) => {
    setGender(selectedGender);
  };

  const handleContinue = async () => {
    if (!gender) {
      alert('Please select your gender');
      return;
    }

    try {
      // Update the backend with gender
      const formData = new FormData();
      formData.append('gender', gender);

      await userApi.updateProfile(formData);

      handleIncreament();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.response?.data?.message || 'Failed to update profile. Please try again.');
    }
  };

  return (
    <div className='text-center lg:text-start w-[300px] lg:w-[400px]'>
      <p className='text-base font-medium mt-3 lg:mt-6'>STEP 1 of 4</p>

      {/* Progress Bar */}
      <progress className="progress-bar h-2" value="30" max="100"></progress>

      <h1 className='mt-7 text-xl lg:text-[36px] font-medium'>Complete Profile Details</h1>

      {/* Upload Image */}
      <div>
        <p className='mt-5 text-lg font-medium text-cyan-600'>Upload profile photo*</p>

        <div className='flex flex-col lg:flex-row items-center mt-5 gap-3'>
          <div className='h-[75px] w-[75px] rounded-full flex justify-center items-center bg-slate-600 font-medium text-blue-950'>
            {imageUrl ? (
              <img 
                src={imageUrl} 
                className='h-full w-full rounded-full object-cover' 
                alt="Profile" 
                onError={(e) => { e.target.src = ''; setImageUrl(null); }} 
              />
            ) : (
              <p className='text-4xl'>E</p>
            )}
          </div>
          <div>
            <input 
              type="file" 
              name="image" 
              className='bg-transparent' 
              onChange={handleImageUpload} 
              accept="image/*"
              disabled={uploading}
            />
            <p>{uploading ? 'Uploading...' : 'Make sure the file is below 12MB'}</p>
          </div>
        </div>
      </div>

      {/* Gender Selection */}
      <div className="mt-6">
        <p className='text-lg font-medium text-cyan-600'>Select your gender*</p>
        <div className="flex gap-4 mt-2">
          <button
            type="button"
            onClick={() => handleGenderSelect('male')}
            className={`px-4 py-2 rounded-lg border-2 ${
              gender === 'male' ? 'border-customOrange bg-orange-50' : 'border-gray-300'
            }`}
          >
            Male
          </button>
          <button
            type="button"
            onClick={() => handleGenderSelect('female')}
            className={`px-4 py-2 rounded-lg border-2 ${
              gender === 'female' ? 'border-customOrange bg-orange-50' : 'border-gray-300'
            }`}
          >
            Female
          </button>
          <button
            type="button"
            onClick={() => handleGenderSelect('other')}
            className={`px-4 py-2 rounded-lg border-2 ${
              gender === 'other' ? 'border-customOrange bg-orange-50' : 'border-gray-300'
            }`}
          >
            Other
          </button>
        </div>
      </div>

      {/* Continue Button */}
      <button onClick={handleContinue} className='mt-4 w-full h-11 lg:h-14 rounded-lg cursor-pointer text-white bg-customOrange'>
        Continue
      </button>
    </div>
  );
}

export default StepOne;
