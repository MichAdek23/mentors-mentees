import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { userApi } from '@/lib/api';

// Function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return "/image/Subtract.png";
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/uploads')) {
    // For uploaded images, use the full API URL
    return `${import.meta.env.VITE_API_URL || 'https://leapon.onrender.com'}${imagePath}`;
  }
  if (imagePath.startsWith('/api/uploads')) {
    // Handle legacy paths that incorrectly include /api
    return `${import.meta.env.VITE_API_URL || 'https://leapon.onrender.com'}${imagePath.replace('/api', '')}`;
  }
  // For static images in the public directory
  return imagePath;
};

const EditProfile = ({ profile, onUpdate, setIsEditProfileVisible }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatedProfile, setUpdatedProfile] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    profilePicture: profile?.profilePicture || '',
    interests: profile?.interests || [],
    social: {
      linkedIn: profile?.social?.linkedIn || '',
      twitter: profile?.social?.twitter || '',
      instagram: profile?.social?.instagram || '',
      website: profile?.social?.website || ''
    },
    overview: profile?.overview || '',
    email: profile?.email || '',
    availability: profile?.availability || '',
    modeOfContact: profile?.modeOfContact || '',
    gender: profile?.gender || '',
    title: profile?.title || '',
    department: profile?.department || '',
    expertise: profile?.expertise || [],
    experience: profile?.experience || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('social.')) {
      const socialField = name.split('.')[1];
      setUpdatedProfile(prev => ({
        ...prev,
        social: {
          ...prev.social,
          [socialField]: value
        }
      }));
    } else {
      setUpdatedProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name, value) => {
    setUpdatedProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 12 * 1024 * 1024) { // 12MB limit
        setError('File size must be less than 12MB');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('profilePicture', file); // Use 'profilePicture' as the field name

        const response = await userApi.uploadProfilePicture(formData);
        
        // Update local state
        setUpdatedProfile(prev => ({ ...prev, profilePicture: response.data.profilePicture }));
        
        // Update user data in localStorage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        userData.profilePicture = response.data.profilePicture;
        localStorage.setItem('userData', JSON.stringify(userData));
        
        setError(null);
      } catch (error) {
        console.error('Error uploading image:', error);
        setError(error.message || 'Failed to upload image. Please try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/update-profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProfile),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      onUpdate(data.user); // Update the parent component with the new profile data
      setIsEditProfileVisible(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const renderBasicProfile = () => (
    <>
      <div>
        <p className='mt-5 text-lg font-medium text-cyan-600'>Upload profile photo*</p>
        <div className='flex flex-col lg:flex-row items-center cursor-pointer mt-5 gap-3'>
          <div className='h-[75px] w-[75px] rounded-full flex justify-center items-center bg-slate-600 font-medium text-blue-950'>
            {updatedProfile && updatedProfile.profilePicture ? (
              <img src={getImageUrl(updatedProfile.profilePicture)} className='h-full w-full rounded-full' alt="" />
            ) : (
              <img src="/image/Subtract.png" className='object-contain rounded-full' alt="Fallback Profile" />
            )}
          </div>
          <div>
            <input type="file" name="image" className='bg-white' onChange={handleImageUpload} accept="image/*" />
            <p>Make sure the file is below 12MB</p>
          </div>
        </div>
      </div>
      <div className="profile-section grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="mt-4 flex items-center p-2 md:p-4 justify-between gap-3 w-full rounded-xl border-2">
            <div className="relative flex items-center w-full justify-center gap-3">
              <input
                type="text"
                className="outline-none w-full"
                name="firstName"
                value={updatedProfile.firstName}
                onChange={handleChange}
                placeholder="Enter First Name"
              />
              <p className="absolute -top-7 left-2 bg-white px-1 text-base font-bold text-slate-400">
                First Name
              </p>
            </div>
          </div>
        </div>
        <div>
          <div className="mt-4 flex items-center p-2 md:p-4 justify-between gap-3 w-full rounded-xl border-2">
            <div className="relative flex items-center w-full justify-center gap-3">
              <input
                type="text"
                className="outline-none w-full"
                name="lastName"
                value={updatedProfile.lastName}
                onChange={handleChange}
                placeholder="Enter Last Name"
              />
              <p className="absolute -top-7 left-2 bg-white px-1 text-base font-bold text-slate-400">
                Last Name
              </p>
            </div>
          </div>
        </div>
        <div>
          <div className="mt-4 flex items-center p-2 md:p-4 justify-between gap-3 w-full rounded-xl border-2">
            <div className="relative flex items-center w-full justify-center gap-3">
              <input
                type="email"
                className="outline-none w-full"
                name="email"
                value={updatedProfile.email}
                onChange={handleChange}
                placeholder="Enter Email"
              />
              <p className="absolute -top-7 left-2 bg-white px-1 text-base font-bold text-slate-400">
                Email
              </p>
            </div>
          </div>
        </div>
        <div>
          <div className="mt-4 flex items-center p-2 md:p-4 justify-between gap-3 w-full rounded-xl border-2">
            <div className="relative flex items-center w-full justify-center gap-3">
              <input
                type="text"
                className="outline-none w-full"
                name="title"
                value={updatedProfile.title}
                onChange={handleChange}
                placeholder="Enter Title"
              />
              <p className="absolute -top-7 left-2 bg-white px-1 text-base font-bold text-slate-400">
                Title
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border-2">
        <div className="relative flex items-center w-full justify-center gap-3">
          <textarea
            name="overview"
            value={updatedProfile.overview}
            onChange={handleChange}
            placeholder="Tell About yourself"
            className='w-full outline-none px-4 py-2 h-[110px]'
          />
          <p className="absolute -top-4 left-2 bg-white px-1 text-base font-bold text-slate-400">
            Overview
          </p>
        </div>
      </div>
    </>
  );

  const renderMentorPreference = () => (
    <div className="profile-section grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700">Availability</label>
        <div className="mt-4 flex items-center p-2 md:p-4 justify-between gap-3 w-full rounded-xl border-2">
          <div className="relative flex items-center w-full justify-center gap-3">
            <Select onValueChange={(value) => handleSelectChange('availability', value)}>
              <SelectTrigger className="outline-none w-full">
                <SelectValue className="text-lg text-slate-500" placeholder="Select One" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Available ASAP">Available ASAP</SelectItem>
                <SelectItem value="In a few weeks">In a few weeks</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700">Mode of contact</label>
        <div className="mt-4 flex items-center p-2 md:p-4 justify-between gap-3 w-full rounded-xl border-2">
          <div className="relative flex items-center w-full justify-center gap-3">
            <Select onValueChange={(value) => handleSelectChange('modeOfContact', value)}>
              <SelectTrigger className="outline-none w-full">
                <SelectValue className="text-lg text-slate-500" placeholder="Select One" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Virtual">Virtual</SelectItem>
                <SelectItem value="Chat">Chat</SelectItem>
                <SelectItem value="Physical">Physical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700">Gender</label>
        <div className="mt-4 flex items-center p-2 md:p-4 justify-between gap-3 w-full rounded-xl border-2">
          <div className="relative flex items-center w-full justify-center gap-3">
            <Select onValueChange={(value) => handleSelectChange('gender', value)}>
              <SelectTrigger className="outline-none w-full">
                <SelectValue className="text-lg text-slate-500" placeholder="Select One" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700">Department</label>
        <div className="mt-4 flex items-center p-2 md:p-4 justify-between gap-3 w-full rounded-xl border-2">
          <div className="relative flex items-center w-full justify-center gap-3">
            <input
              type="text"
              name="department"
              value={updatedProfile.department}
              onChange={handleChange}
              className="outline-none w-full"
              placeholder="Enter Department"
            />
          </div>
        </div>
      </div>
      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700">Experience</label>
        <div className="mt-4 flex items-center p-2 md:p-4 justify-between gap-3 w-full rounded-xl border-2">
          <div className="relative flex items-center w-full justify-center gap-3">
            <input
              type="text"
              name="experience"
              value={updatedProfile.experience}
              onChange={handleChange}
              className="outline-none w-full"
              placeholder="Enter Years of Experience"
            />
          </div>
        </div>
      </div>
      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700">Expertise</label>
        <div className="mt-4 flex items-center p-2 md:p-4 justify-between gap-3 w-full rounded-xl border-2">
          <div className="relative flex items-center w-full justify-center gap-3">
            <input
              type="text"
              name="expertise"
              value={updatedProfile.expertise.join(', ')}
              onChange={(e) => handleChange({
                target: {
                  name: 'expertise',
                  value: e.target.value.split(',').map(item => item.trim())
                }
              })}
              className="outline-none w-full"
              placeholder="Enter Expertise (comma-separated)"
            />
          </div>
        </div>
      </div>
      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700">Interests</label>
        <div className="mt-4 flex items-center p-2 md:p-4 justify-between gap-3 w-full rounded-xl border-2">
          <div className="relative flex items-center w-full justify-center gap-3">
            <input
              type="text"
              name="interests"
              value={updatedProfile.interests.join(', ')}
              onChange={(e) => handleChange({
                target: {
                  name: 'interests',
                  value: e.target.value.split(',').map(item => item.trim())
                }
              })}
              className="outline-none w-full"
              placeholder="Enter Interests (comma-separated)"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSocialLinks = () => (
    <div className="profile-section grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700">LinkedIn Profile URL</label>
        <div className="mt-4 flex items-center p-2 md:p-4 justify-between gap-3 w-full rounded-xl border-2">
          <div className="relative flex items-center w-full justify-center gap-3">
            <input
              type="text"
              name="social.linkedIn"
              value={updatedProfile.social.linkedIn}
              onChange={handleChange}
              className="outline-none w-full"
              placeholder="LinkedIn"
            />
          </div>
        </div>
      </div>
      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700">Twitter Profile URL</label>
        <div className="mt-4 flex items-center p-2 md:p-4 justify-between gap-3 w-full rounded-xl border-2">
          <div className="relative flex items-center w-full justify-center gap-3">
            <input
              type="text"
              name="social.twitter"
              value={updatedProfile.social.twitter}
              onChange={handleChange}
              className="outline-none w-full"
              placeholder="Twitter"
            />
          </div>
        </div>
      </div>
      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700">Instagram Profile URL</label>
        <div className="mt-4 flex items-center p-2 md:p-4 justify-between gap-3 w-full rounded-xl border-2">
          <div className="relative flex items-center w-full justify-center gap-3">
            <input
              type="text"
              name="social.instagram"
              value={updatedProfile.social.instagram}
              onChange={handleChange}
              className="outline-none w-full"
              placeholder="Instagram"
            />
          </div>
        </div>
      </div>
      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700">Website URL</label>
        <div className="mt-4 flex items-center p-2 md:p-4 justify-between gap-3 w-full rounded-xl border-2">
          <div className="relative flex items-center w-full justify-center gap-3">
            <input
              type="text"
              name="social.website"
              value={updatedProfile.social.website}
              onChange={handleChange}
              className="outline-none w-full"
              placeholder="Website"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="w-full p-6 mx-auto">
      <h1 className="text-gray-800 dark:text-gray-200 text-2xl font-semibold">
        {profile.firstName || profile.lastName 
          ? `${profile.firstName} ${profile.lastName}`
          : 'Edit Profile'}
      </h1>
      <p className='mb-10 text-sm text-slate-600 font-medium'>Update your profile details</p>
      <div className="tab-buttons flex border-b-2 mb-4">
        <button 
          type="button" 
          className={`${activeTab === 'basic' ? 'border-b-2 border-customOrange' : 'border-0'} transition-colors duration-300 px-4 py-2`} 
          onClick={() => setActiveTab('basic')}
        >
          Basic Profile
        </button>
        <button 
          type="button" 
          className={`${activeTab === 'social' ? 'border-b-2 border-customOrange' : 'border-0'} transition-colors duration-300 px-4 py-2`} 
          onClick={() => setActiveTab('social')}
        >
          Social Links
        </button>
        <button 
          type="button" 
          className={`${activeTab === 'mentor' ? 'border-b-2 border-customOrange' : 'border-0'} transition-colors duration-300 px-4 py-2`} 
          onClick={() => setActiveTab('mentor')}
        >
          Mentor Preference
        </button>
      </div>
      {activeTab === 'basic' && renderBasicProfile()}
      {activeTab === 'mentor' && renderMentorPreference()}
      {activeTab === 'social' && renderSocialLinks()}
      {error && <p className="text-red-500 mt-4">{error}</p>}
      <button 
        type="submit" 
        className="bg-customOrange mt-5 text-white py-2 px-4 rounded-md shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-gray-400"
        disabled={loading}
      >
        {loading ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  );
};

export default EditProfile;