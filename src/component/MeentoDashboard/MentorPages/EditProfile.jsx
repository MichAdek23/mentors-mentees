import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { userApi } from '@/lib/api';

const getImageUrl = (imagePath) => {
  if (!imagePath) return "/image/Subtract.png";
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/uploads')) {
    return `${import.meta.env.VITE_API_URL || 'https://leapon.onrender.com'}${imagePath}`;
  }
  if (imagePath.startsWith('/api/uploads')) {
    return `${import.meta.env.VITE_API_URL || 'https://leapon.onrender.com'}${imagePath.replace('/api', '')}`;
  }
  return imagePath;
};

const EditProfile = ({ profile, onUpdate, setIsEditProfileVisible }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatedProfile, setUpdatedProfile] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    profilePicture: profile?.profilePicture || '',
    interests: profile?.interests || [],
    preferredIndustry: profile?.preferredIndustry || '',
    preferredSkills: profile?.preferredSkills || '',
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 12 * 1024 * 1024) {
        setError('File size must be less than 12MB');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('profilePicture', file);

        const response = await userApi.uploadProfilePicture(formData);

        setUpdatedProfile(prev => ({ ...prev, profilePicture: response.data.profilePicture }));

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
      onUpdate(data.user);
      setIsEditProfileVisible(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className=" w-full  px-3 ">
      <h2 className="text-2xl font-bold text-cyan-700">Edit Profile</h2>
      {error && <p className="text-red-600 font-medium">{error}</p>}

      <div>
        <p className='text-lg font-medium text-cyan-600'>Upload Profile Photo*</p>
        <div className='flex gap-4 items-center mt-4'>
          <img
            src={getImageUrl(updatedProfile.profilePicture)}
            alt="Profile Preview"
            className='h-20 w-20 rounded-full object-cover border'
          />
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>
        <p className='text-sm text-gray-600 mt-2'>Max size: 12MB</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <input name="firstName" value={updatedProfile.firstName} onChange={handleChange} placeholder="First Name" className="p-2 outline-none  border rounded" />
        <input name="lastName" value={updatedProfile.lastName} onChange={handleChange} placeholder="Last Name" className="p-2 outline-none  border rounded" />
        <input name="email" type="email" value={updatedProfile.email} onChange={handleChange} placeholder="Email" className="p-2 outline-none  border rounded" />
        <input name="title" value={updatedProfile.title} onChange={handleChange} placeholder="Title" className="p-2 border outline-none rounded" />
      </div>

      <textarea
        name="overview"
        value={updatedProfile.overview}
        onChange={handleChange}
        placeholder="Tell about yourself"
        className="w-full p-2 border rounded h-28 my-3"
      />

      <div className="grid md:grid-cols-2 gap-4">
        <input name="preferredIndustry" value={updatedProfile.preferredIndustry} onChange={handleChange} placeholder="Preferred Industry" className="p-2 my-3 outline-none border rounded" />
        <input name="preferredSkills" value={updatedProfile.preferredSkills} onChange={handleChange} placeholder="Preferred Skills" className="p-2 my-3 outline-none border rounded" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <input name="social.linkedIn" value={updatedProfile.social.linkedIn} onChange={handleChange} placeholder="LinkedIn URL" className="p-2 my-3 outline-none border rounded" />
        <input name="social.twitter" value={updatedProfile.social.twitter} onChange={handleChange} placeholder="Twitter URL" className="p-2 my-3 outline-none border rounded" />
        <input name="social.instagram" value={updatedProfile.social.instagram} onChange={handleChange} placeholder="Instagram URL" className="p-2 my-3 outline-none border rounded" />
        <input name="social.website" value={updatedProfile.social.website} onChange={handleChange} placeholder="Personal Website" className="p-2 my-3 outline-none border rounded" />
      </div>

      <button type="submit" disabled={loading} className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700">
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
};

export default EditProfile;
