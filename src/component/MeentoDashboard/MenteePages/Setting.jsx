
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

function Setting() {
    const [activeTab, setActiveTab] = useState('basicDetails');
    const { upDatePage, handleToggleState, setProfile } = useContext(GlobalContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [profileDetails, setProfileDetails] = useState({
        firstName: '',
        lastName: '',
        email: '',
        gender: '',
        title: '',
        department: '',
        yearOfStudy: '',
        expertise: [],
        experience: '',
        bio: '',
        overview: '',
        social: {
            linkedIn: '',
            twitter: '',
            instagram: '',
            website: ''
        },
        interests: [],
        mentorshipStatus: '',
        currentPassword: '',
        password: '',
        confirmPassword: ''
    });

    // Fetch user profile on component mount
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const response = await userApi.getProfile();
                const userData = response.data;
                setProfileDetails(prev => ({
                    ...prev,
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    email: userData.email || '',
                    gender: userData.gender || '',
                    title: userData.title || '',
                    department: userData.department || '',
                    yearOfStudy: userData.yearOfStudy || '',
                    expertise: userData.expertise || [],
                    experience: userData.experience || '',
                    bio: userData.bio || '',
                    overview: userData.overview || '',
                    social: userData.social || {
                        linkedIn: '',
                        twitter: '',
                        instagram: '',
                        website: ''
                    },
                    interests: userData.interests || [],
                    mentorshipStatus: userData.mentorshipStatus || ''
                }));
                setProfile(userData);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch profile');
                alert('Error fetching profile: ' + (err.response?.data?.message || 'Unknown error'));
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (activeTab === 'loginAndSecurity') {
                if (profileDetails.password !== profileDetails.confirmPassword) {
                    alert('Passwords do not match');
                    return;
                }
                await userApi.updatePassword({
                    currentPassword: profileDetails.currentPassword,
                    newPassword: profileDetails.password
                });
                alert('Password Updated Successfully');
                setProfileDetails(prev => ({
                    ...prev,
                    password: '',
                    confirmPassword: '',
                    currentPassword: ''
                }));
            } else {
                const response = await userApi.updateProfile(profileDetails);
                setProfile(response.data);
                alert('Profile Updated Successfully');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating profile');
            alert('Error updating profile: ' + (err.response?.data?.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

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

            {loading && !profileDetails.firstName && (
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    Loading...
                </div>
            )}

            {error && !profileDetails.firstName && (
                <div className="bg-white p-6 rounded-lg shadow-md text-center text-red-500">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <>
                    {activeTab === 'basicDetails' && (
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold mb-4">Profile Details</h2>
                            <form className="grid grid-cols-1 md:grid-cols-2 items-center gap-4" onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={profileDetails.firstName}
                                        onChange={handleInputChange}
                                        className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={profileDetails.lastName}
                                        onChange={handleInputChange}
                                        className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={profileDetails.title}
                                        onChange={handleInputChange}
                                        className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Department</label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={profileDetails.department}
                                        onChange={handleInputChange}
                                        className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Year of Study</label>
                                    <input
                                        type="text"
                                        name="yearOfStudy"
                                        value={profileDetails.yearOfStudy}
                                        onChange={handleInputChange}
                                        className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Experience</label>
                                    <input
                                        type="text"
                                        name="experience"
                                        value={profileDetails.experience}
                                        onChange={handleInputChange}
                                        className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Gender</label>
                                    <Select 
                                        className="p-2" 
                                        onValueChange={(value) => handleSelectChange('gender', value)}
                                        value={profileDetails.gender}
                                    >
                                        <SelectTrigger className="outline-none w-full border-2 rounded-xl h-[60px]">
                                            <SelectValue className="text-lg text-slate-500" placeholder="Select One" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Mentorship Status</label>
                                    <Select 
                                        className="h-full" 
                                        onValueChange={(value) => handleSelectChange('mentorshipStatus', value)}
                                        value={profileDetails.mentorshipStatus}
                                    >
                                        <SelectTrigger className="outline-none w-full border-2 rounded-xl h-[60px]">
                                            <SelectValue className="text-lg text-slate-500" placeholder="Select One" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="available">Available</SelectItem>
                                            <SelectItem value="unavailable">Unavailable</SelectItem>
                                            <SelectItem value="busy">Busy</SelectItem>
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
                                <div className="col-span-1 md:col-span-2 mb-4">
                                    <label className="block text-gray-700">Overview</label>
                                    <textarea
                                        name="overview"
                                        value={profileDetails.overview}
                                        onChange={handleInputChange}
                                        className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1"
                                    ></textarea>
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <button 
                                        type="submit" 
                                        className="bg-orange-500 text-white py-2 px-4 rounded disabled:bg-gray-400"
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
                                    <label className="block text-gray-700">LinkedIn</label>
                                    <input
                                        type="text"
                                        name="social.linkedIn"
                                        value={profileDetails.social.linkedIn}
                                        onChange={handleInputChange}
                                        className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1"
                                        placeholder="LinkedIn Profile URL"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Twitter</label>
                                    <input
                                        type="text"
                                        name="social.twitter"
                                        value={profileDetails.social.twitter}
                                        onChange={handleInputChange}
                                        className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1"
                                        placeholder="Twitter Handle"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Instagram</label>
                                    <input
                                        type="text"
                                        name="social.instagram"
                                        value={profileDetails.social.instagram}
                                        onChange={handleInputChange}
                                        className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1"
                                        placeholder="Instagram Handle"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Website</label>
                                    <input
                                        type="text"
                                        name="social.website"
                                        value={profileDetails.social.website}
                                        onChange={handleInputChange}
                                        className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1"
                                        placeholder="Personal Website URL"
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <button 
                                        type="submit" 
                                        className="bg-orange-500 text-white py-2 px-4 rounded disabled:bg-gray-400"
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
                                        value={profileDetails.currentPassword || ''}
                                        onChange={handleInputChange}
                                        className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 border-orange-500 mt-1"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">New Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={profileDetails.password || ''}
                                        onChange={handleInputChange}
                                        className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 border-orange-500 mt-1"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Confirm New Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={profileDetails.confirmPassword || ''}
                                        onChange={handleInputChange}
                                        className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 border-orange-500 mt-1"
                                        required
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    className="bg-orange-500 text-white py-2 px-4 rounded disabled:bg-gray-400"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Update Password'}
                                </button>
                            </form>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Setting;