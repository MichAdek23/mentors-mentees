import React, { useContext, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; 
import { GlobalContext } from '@/component/GlobalStore/GlobalState';
import { userApi } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

// Function to get full image URL
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

function Setting() {
    const [activeTab, setActiveTab] = useState('basicDetails');
    const { upDatePage, handleToggleState, setProfile } = useContext(GlobalContext);
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [profileDetails, setProfileDetails] = useState({
        firstName: '',
        lastName: '',
        profilePicture: '',
        fullName: '',
        mentorshipStatus: '',
        gender: '',
        modeOfContact: '',
        availability: '',
        bio: '',
        overview: '',
        social: {
            twitter: '',
            facebook: '',
            whatsapp: '',
            instagram: '',
            linkedIn: '',
            website: ''
        },
        email: '',
        password: '',
        confirmPassword: '',
        currentPassword: '',
        department: '',
        expertise: [],
        experience: '',
        interests: []
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await userApi.getProfile();
                const userData = response.data;
                
                // Update profile details with user data
                setProfileDetails({
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    profilePicture: userData.profilePicture || '',
                    fullName: userData.fullName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || '',
                    mentorshipStatus: userData.mentorshipStatus || '',
                    gender: userData.gender || '',
                    modeOfContact: userData.modeOfContact || '',
                    availability: userData.availability || '',
                    bio: userData.bio || '',
                    overview: userData.overview || '',
                    social: {
                        twitter: userData.social?.twitter || '',
                        facebook: userData.social?.facebook || '',
                        whatsapp: userData.social?.whatsapp || '',
                        instagram: userData.social?.instagram || '',
                        linkedIn: userData.social?.linkedIn || '',
                        website: userData.social?.website || ''
                    },
                    email: userData.email || '',
                    password: '',
                    confirmPassword: '',
                    currentPassword: '',
                    department: userData.department || '',
                    expertise: userData.expertise || [],
                    experience: userData.experience || '',
                    interests: userData.interests || []
                });
            } catch (error) {
                console.error('Error fetching profile:', error);
                setError(error.response?.data?.message || 'Error fetching profile data');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('social.')) {
            const socialField = name.split('.')[1];
            setProfileDetails(prev => ({
                ...prev,
                social: {
                    ...prev.social,
                    [socialField]: value
                }
            }));
        } else {
            setProfileDetails(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSelectChange = (name, value) => {
        setProfileDetails(prev => ({ ...prev, [name]: value }));
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
                formData.append('file', file);

                const response = await userApi.uploadProfilePicture(formData);
                
                // Update both local state and global context
                setProfileDetails(prev => ({ ...prev, profilePicture: response.data.profilePicture }));
                setProfile(prev => ({ ...prev, profilePicture: response.data.profilePicture }));
                
                // Update user data in localStorage
                const userData = JSON.parse(localStorage.getItem('userData') || '{}');
                userData.profilePicture = response.data.profilePicture;
                localStorage.setItem('userData', JSON.stringify(userData));
                
                setSuccess('Profile picture updated successfully');
            } catch (error) {
                console.error('Error uploading image:', error);
                setError(error.message || 'Failed to upload image. Please try again.');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (activeTab === 'loginAndSecurity') {
                if (profileDetails.password !== profileDetails.confirmPassword) {
                    throw new Error('Passwords do not match');
                }

                await userApi.updatePassword({
                    currentPassword: profileDetails.currentPassword,
                    newPassword: profileDetails.password
                }); // Token is automatically added by the interceptor

                setProfileDetails(prev => ({
                    ...prev,
                    password: '',
                    confirmPassword: '',
                    currentPassword: ''
                }));

                setSuccess('Password Updated Successfully');
            } else {
                const response = await userApi.updateProfile(profileDetails); // Token is automatically added by the interceptor
                setProfileDetails(response.data);
                setProfile(response.data);
                setSuccess('Profile Updated Successfully');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setError(error.message || 'Error updating profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !profileDetails.fullName) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <header className="flex justify-between mb-6">
                <div className="flex flex-col w-full lg:flex-row justify-start items-start lg:items-center gap-4 lg:gap-0 lg:justify-between">
                    <div className="flex flex-col gap-4">
                        <h1 className="text-[32px] font-medium">Settings</h1>
                        <p className="text-base font-medium text-slate-600">Make your Changes</p>
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
            <div className="flex flex-wrap justify-start items-center space-x-4 bg-white py-3 px-3 w-full md:w-fit rounded-md mb-6">
                <button
                    className={`py-2 rounded-lg transition-colors duration-300 px-4 ${activeTab === 'basicDetails' ? 'bg-orange-500 text-white' : 'bg-white text-black'}`}
                    onClick={() => setActiveTab('basicDetails')}
                >
                    Basic Details
                </button>
                <button
                    className={`py-2 rounded-lg transition-colors duration-300 px-4 ${activeTab === 'Social Media' ? 'bg-orange-500 text-white' : 'bg-white text-black'}`}
                    onClick={() => setActiveTab('Social Media')}
                >
                    Social Media
                </button>
                <button
                    className={`py-2 rounded-lg transition-colors duration-300 px-4 ${activeTab === 'loginAndSecurity' ? 'bg-orange-500 text-white' : 'bg-white text-black'}`}
                    onClick={() => setActiveTab('loginAndSecurity')}
                >
                    Login and Security
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{success}</span>
                </div>
            )}

            {activeTab === 'basicDetails' && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Profile Details</h2>
                    <form className="grid grid-cols-1 md:grid-cols-2 items-center gap-4" onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={profileDetails.fullName}
                                onChange={handleInputChange}
                                className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Mentorship Status</label>
                            <Select className="h-full rounded-xl p-2" onValueChange={(value) => handleSelectChange('mentorshipStatus', value)}>
                                <SelectTrigger className="outline-none w-full border-2 rounded-xl h-[60px]">
                                    <SelectValue className="text-lg text-slate-500" placeholder="Select One" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Cordial/Friendly">Cordial/Friendly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Gender</label>
                            <Select className="p-2" onValueChange={(value) => handleSelectChange('gender', value)}>
                                <SelectTrigger className="outline-none w-full border-2 rounded-xl h-[60px]">
                                    <SelectValue className="text-lg text-slate-500" placeholder="Select One" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Male">Male</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Mode of Contact</label>
                            <Select className="h-full" onValueChange={(value) => handleSelectChange('modeOfContact', value)}>
                                <SelectTrigger className="outline-none w-full border-2 rounded-xl h-[60px]">
                                    <SelectValue className="text-lg text-slate-500" placeholder="Select One" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Virtual">Virtual</SelectItem>
                                    <SelectItem value="Physical">Physical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Availability</label>
                            <Select className="h-full" onValueChange={(value) => handleSelectChange('availability', value)}>
                                <SelectTrigger className="outline-none w-full border-2 rounded-xl h-[60px]">
                                    <SelectValue className="text-lg text-slate-500" placeholder="Select One" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Available ASAP">Available ASAP</SelectItem>
                                    <SelectItem value="In a few weeks">In a few weeks</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-1 md:col-span-2 mb-4">
                            <label className="block text-gray-700">Bio</label>
                            <textarea
                                name="bio"
                                value={profileDetails.bio}
                                onChange={handleInputChange}
                                className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1"
                            ></textarea>
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <button 
                                type="submit" 
                                className="bg-orange-500 text-white py-2 px-4 rounded disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'Social Media' && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Social Media</h2>
                    <form className="grid grid-cols-1 md:grid-cols-2 items-center gap-4" onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700">Twitter</label>
                            <input
                                type="text"
                                name="twitter"
                                value={profileDetails.twitter}
                                onChange={handleInputChange}
                                className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1"
                                placeholder="Twitter Handle"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Facebook</label>
                            <input
                                type="text"
                                name="facebook"
                                value={profileDetails.facebook}
                                onChange={handleInputChange}
                                className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1"
                                placeholder="Facebook Profile"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">WhatsApp</label>
                            <input
                                type="text"
                                name="whatsapp"
                                value={profileDetails.whatsapp}
                                onChange={handleInputChange}
                                className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1"
                                placeholder="WhatsApp Number"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Instagram</label>
                            <input
                                type="text"
                                name="instagram"
                                value={profileDetails.instagram}
                                onChange={handleInputChange}
                                className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1"
                                placeholder="Instagram Handle"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={profileDetails.email}
                                onChange={handleInputChange}
                                className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1"
                                placeholder="Email Address"
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <button 
                                type="submit" 
                                className="bg-orange-500 text-white py-2 px-4 rounded disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'loginAndSecurity' && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Login and Security</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700">Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={profileDetails.currentPassword}
                                onChange={handleInputChange}
                                className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 border-orange-500 mt-1"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">New Password</label>
                            <input
                                type="password"
                                name="password"
                                value={profileDetails.password}
                                onChange={handleInputChange}
                                className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 border-orange-500 mt-1"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={profileDetails.confirmPassword}
                                onChange={handleInputChange}
                                className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 border-orange-500 mt-1"
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="bg-orange-500 text-white py-2 px-4 rounded disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Setting;