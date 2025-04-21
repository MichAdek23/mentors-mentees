import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faRemove } from '@fortawesome/free-solid-svg-icons';
import { faTwitter, faFacebook, faWhatsapp, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import EditProfile from './EditProfile';
import { useContext } from 'react';
import { GlobalContext } from '@/component/GlobalStore/GlobalState';
import { useAuth } from '@/lib/AuthContext'; // Import useAuth

// Add icons to the library
library.add(faBars, faRemove, faTwitter, faFacebook, faWhatsapp, faInstagram, faLinkedin);

// Function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return "/image/default-profile.png"; // Default image if no profile picture is provided
  if (imagePath.startsWith('http')) {
    return imagePath; 
  }
  return `${import.meta.env.VITE_BACKEND_URL}${imagePath}`; 
};

const Profile = () => {
  const [isEditProfileVisible, setEditProfileVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { profile, setProfile } = useContext(GlobalContext);
  const { token } = useAuth(); // Get token from useAuth

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token'); // Retrieve the token from localStorage
      console.log('Token:', token); // Debug: Log the token to verify its value

      if (!token) {
        throw new Error('Authentication token is missing. Please log in again.');
      }

      const apiUrl = `${import.meta.env.VITE_API_URL}/users/profile`;
      console.log('Fetching profile from API:', apiUrl); // Log the API URL

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Use token from localStorage
          'Content-Type': 'application/json'
        }
      });
 console.log(response, 'response');
   
      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const profileData = await response.json();
      setProfile(profileData);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to fetch profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedProfile) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, { // Corrected URL
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`, // Use token from useAuth
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProfile),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      console.log('Profile updated successfully:', data);
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const toggleEditProfile = () => {
    setEditProfileVisible(!isEditProfileVisible);
  };

  const handleImageError = (e) => {
    const originalSrc = e.currentTarget.src;
    if (!originalSrc.includes('default-profile.png')) {
      e.currentTarget.src = '/image/default-profile.png';
    }
  };

  const renderSocialLinks = () => {
    const socialLinks = [
      { icon: faLinkedin, url: profile?.social?.linkedIn, color: 'text-blue-600' },
      { icon: faTwitter, url: profile?.social?.twitter, color: 'text-blue-400' },
      { icon: faInstagram, url: profile?.social?.instagram, color: 'text-pink-500' },
      { icon: faWhatsapp, url: profile?.social?.website, color: 'text-green-500' }
    ];

    return (
      <div className="flex gap-4">
        {socialLinks.map((social, index) => (
          social.url && (
            <a
              key={index}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${social.color} hover:opacity-80 transition-opacity`}
            >
              <FontAwesomeIcon icon={social.icon} className="text-xl" />
            </a>
          )
        ))}
      </div>
    );
  };

  return (
    <div className="h-fit bg-gray-50 dark:bg-gray-900 pb-8">
      <header className="flex mt-4 justify-between px-4 mb-8">
        <h1 className="text-2xl font-medium">My Profile</h1>
      </header>
      <div className="container mx-auto px-4 max-w-6xl">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="bg-white pb-8 dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="h-48 rounded-t-xl bg-gradient-to-r from-blue-400 to-blue-600 relative">
              <div className="absolute -bottom-16 left-8 flex items-end">
                <img
                  src={getImageUrl(profile?.profilePicture)}
                  alt={`${profile?.firstName || ''} ${profile?.lastName || ''}`}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800"
                  onError={handleImageError}
                />
              </div>
            </div>
            <div className="pt-20 px-8">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h1 className="text-gray-800 dark:text-gray-200 text-2xl font-semibold">
                    {profile?.firstName || 'N/A'} {profile?.lastName || 'N/A'}
                  </h1>
                  {profile?.title && <p className="text-gray-600 dark:text-gray-400">{profile.title}</p>}
                  {profile?.email && <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>}
                  {profile?.department && <p className="text-gray-600 dark:text-gray-400">{profile.department}</p>}
                  {profile?.yearOfStudy && <p className="text-gray-600 dark:text-gray-400">{profile.yearOfStudy}</p>}
                  {profile?.gender && <p className="text-gray-600 dark:text-gray-400">{profile.gender}</p>}
                  {profile?.mentorshipStatus && <p className="text-gray-600 dark:text-gray-400">{profile.mentorshipStatus}</p>}
                 
                  <h2 className="text-xl font-bold mb-4 mt-6">Social Media</h2>
                  {renderSocialLinks()}
                </div>
                <button
                  className="text-orange-500 hover:text-orange-600 font-medium"
                  onClick={toggleEditProfile}
                >
                  Edit Profile
                </button>
              </div>
              <div className="mt-12 bg-slate-200 px-8 py-8 rounded-3xl">
                <h2 className="text-lg font-semibold mb-2">Overview</h2>
                <div className="space-y-6">
                  <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
                    {profile?.overview || 'No overview provided.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isEditProfileVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="dark:bg-gray-800 bg-white p-2 lg:w-fit border rounded-2xl shadow-lg">
            <button onClick={toggleEditProfile} className="bg-customOrange bg-opacity-50 h-6 w-6 rounded-full float-right">
              <FontAwesomeIcon className='text-slate-50' icon={faRemove} />
            </button>
            <EditProfile profile={profile} onUpdate={handleProfileUpdate} setIsEditProfileVisible={setEditProfileVisible} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;