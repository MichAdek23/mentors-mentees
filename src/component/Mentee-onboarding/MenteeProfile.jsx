import React, { useState, useEffect } from 'react';
import { Star, BookOpen, Users } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faRemove } from '@fortawesome/free-solid-svg-icons';
import EditProfile from '../MeentoDashboard/MentorPages/EditProfile';
import { useAuth } from '../../lib/AuthContext';
import { useContext } from 'react';
import { GlobalContext } from '@/component/GlobalStore/GlobalState';

const MenteeProfile = () => {
  const [isEditProfileVisible, setEditProfileVisible] = useState(false);
  const { upDatePage, handleToggleState } = useContext(GlobalContext);
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || "",
    role: user?.role || "",
    overview: user?.overview || "",
    interests: user?.interests || "",
    email: user?.email || "",
    image: "",
    linkedIn: user?.linkedIn || "",
    twitter: user?.twitter || "",
    instagram: user?.instagram || "",
    website: user?.website || "",
    department: user?.department || "",
    yearOfStudy: user?.yearOfStudy || ""
  });

  console.log(user, 'user');

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        role: user.role || "",
        overview: user.overview || "",
        interests: user.interests || "",
        email: user.email || "",
        image: "",
        linkedIn: user.linkedIn || "",
        twitter: user.twitter || "",
        instagram: user.instagram || "",
        website: user.website || "",
        department: user.department || "",
        yearOfStudy: user.yearOfStudy || ""
      });
    }
  }, [user]);

  const toggleEditProfile = () => {
    setEditProfileVisible(!isEditProfileVisible);
  };

  const handleImageError = (e) => {
    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(e.currentTarget.alt)}&background=random`;
  };

  const handleProfileUpdate = async (updatedProfile) => {
    try {
      const apiUrl = '/api/users/me';
      console.log('Updating profile via API:', apiUrl); // Log the API URL

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedProfile)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      setProfile(updatedUser);
      setEditProfileVisible(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="h-fit bg-gray-50 dark:bg-gray-900 pb-8">
      <header className="flex mt-4 justify-between px-4 mb-8">
        <div className="flex flex-col w-full lg:flex-row justify-start items-start lg:items-center gap-4 lg:gap-0 lg:justify-between">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-medium">My profile</h1>
            <p className="text-base font-medium text-slate-600">Eas Communication with everyone</p>
          </div>
          <div className="flex justify-center gap-4">
            <img
              onClick={() => upDatePage("Message")}
              src="/image/messageIcon.png"
              className="md:w-12 h-9 md:h-12 cursor-pointer"
              alt="Message Icon"
            />
            <img
              onClick={() => upDatePage("Setting")}
              src="/image/settingIcon.png"
              className="md:w-12 h-9 md:h-12 cursor-pointer"
              alt="Setting Icon"
            />
          </div>
        </div>
        <div onClick={handleToggleState} className="block lg:hidden mt-3">
          <button aria-label="Toggle menu">
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
      </header>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white pb-8 dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="h-48 rounded-t-xl bg-gradient-to-r from-blue-400 to-blue-600 relative" style={{ backgroundImage: 'url(/image/backImage.png)' }}>
            <div className="absolute -bottom-16 left-8 flex items-end"> {/* Updated position to match mentor */}
              <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
                <img
                  src={profile.image || "/image/young-people-working-from-modern-place 1.png"} // Use profile.image or fallback to default
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              </div>
              {console.log('Profile Image URL:', profile.image)}
            </div>
          </div>
          <div className="pt-20 px-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white"> NAME: {profile.name}</h1>
                <p className="text-gray-600 dark:text-gray-400"> ROLE: {profile.role}</p>
                <p className="text-gray-600 dark:text-gray-400"> EMAIL {profile.email}</p>
                <p className="text-gray-600 dark:text-gray-400">  {profile.department}</p>
                <p className="text-gray-600 dark:text-gray-400">Year {profile.yearOfStudy}</p>
              </div>
              <button
                className="text-orange-500 hover:text-orange-600 font-medium"
                onClick={toggleEditProfile}
              >
                Edit Profile
              </button>
            </div>
       
            <div className="mt-8 flex gap-8">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total learning time</p>
                  <p className="font-semibold">1,570 hrs</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sessions completed</p>
                  <p className="font-semibold">25</p>
                </div>
              </div>
            </div>

            {profile.interests && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-4">Interests</h2>
                <p className="text-gray-600 dark:text-gray-400">{profile.interests}</p>
              </div>
            )}

            <div className="mt-12 bg-slate-200 px-8 py-8 rounded-3xl">
              <h2 className="text-lg font-semibold mb-2">Overview</h2>
              <div className="space-y-6">
                <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
                  {profile.overview}
                </p>
              </div>
            </div>

            {(profile.linkedIn || profile.twitter || profile.instagram || profile.website) && (
              <div className="mt-12">
                <h2 className="text-lg font-semibold mb-4">Social Links</h2>
                <div className="flex gap-4">
                  {profile.linkedIn && (
                    <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      LinkedIn
                    </a>
                  )}
                  {profile.twitter && (
                    <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">
                      Twitter
                    </a>
                  )}
                  {profile.instagram && (
                    <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800">
                      Instagram
                    </a>
                  )}
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800">
                      Website
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditProfileVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
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

export default MenteeProfile;