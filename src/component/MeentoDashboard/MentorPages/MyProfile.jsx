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

// Function to get the full URL for the profile picture.
// It constructs the URL for the user's picture or the backend default.
const getImageUrl = (imagePath) => {
  const backendDefaultPath = '/uploads/profiles/default-profile.png';

  if (!imagePath || imagePath === backendDefaultPath) {
    // If no imagePath is provided or it's the backend's default path,
    // construct the full URL for the backend default.
    return `${import.meta.env.VITE_API_URL}${backendDefaultPath}`;
  }
  if (imagePath.startsWith('http')) {
    return imagePath; // Return as is if it's a full URL (e.g., from a third-party service)
  }
  // Assume imagePath is a relative path from the backend like '/uploads/profiles/filename.png'
  return `${import.meta.env.VITE_API_URL}${imagePath}`;
};


const Profile = () => {
  const [isEditProfileVisible, setEditProfileVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { profile, setProfile, upDatePage, handleToggleState } = useContext(GlobalContext);
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
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
      console.log('Profile updated successfully:', data);
      // Re-fetch profile after successful update to ensure UI consistency
      fetchProfile();
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

  // Handle image loading errors by falling back to the backend-served default image
  const handleImageError = (e) => {
    const defaultImageUrl = `${import.meta.env.VITE_API_URL}/uploads/profiles/default-profile.png`;
    // If the image load failed and the current source is not already the default,
    // set the source to the backend-served default image.
    if (e.currentTarget.src !== defaultImageUrl) {
      e.currentTarget.src = defaultImageUrl;
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
    <section className="h-fit  dark:bg-gray-900 pb-8">

      <header className="flex justify-between mb-6 px-3 lg:px-0">
        <div className="flex flex-col w-full lg:flex-row justify-start items-start lg:items-center gap-4 lg:gap-0 lg:justify-between">
          <div className="flex flex-col gap-4">
            <h1 className="text-[32px] font-medium">My Profile</h1>

          </div>
          <div className="flex justify-center gap-4">
            <img
              onClick={() => upDatePage("Message")}
              src="/image/messageIcon.png"
              className="md:w-12 h-9 md:h-12 cursor-pointer"
              alt="Message Icon"
              loading="lazy"
            />
            <img
              onClick={() => upDatePage("Setting")}
              src="/image/settingIcon.png"
              className="md:w-12 h-9 md:h-12 cursor-pointer"
              alt="Setting Icon"
              loading="lazy"
            />
          </div>
        </div>
        <div onClick={handleToggleState} className="block lg:hidden mt-3">
          <button aria-label="Toggle menu">
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
      </header>
      <div className="container mx-auto px-4 ">
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
              <div className="flex flex-wrap justify-between items-start">
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
              <div className="mt-12 break-words bg-slate-200 px-3 py-2 md:px-8 md:py-8 rounded-3xl">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center px-3 items-center z-50">
          <div className="dark:bg-gray-800 bg-white w-full max-w-md md:max-w-2xl h-[90vh] overflow-y-auto p-4 md:p-6 rounded-2xl shadow-lg relative"   
          style={{
          overflowY: 'auto',
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none', 
        }}>
            <button
              onClick={toggleEditProfile}
              className="absolute top-3 right-3 bg-customOrange bg-opacity-50 h-6 w-6 rounded-full flex items-center justify-center"
            >
              <FontAwesomeIcon className="text-white text-xs" icon={faRemove} />
            </button>
            <EditProfile
              profile={profile}
              onUpdate={handleProfileUpdate}
              setIsEditProfileVisible={setEditProfileVisible}
            />
          </div>
        </div>
      )}
    </section>




  );
};

export default Profile;
