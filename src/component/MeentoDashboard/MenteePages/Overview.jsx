import React, { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLongArrowRight, faBars } from "@fortawesome/free-solid-svg-icons";
import { Calendar } from "@/components/ui/calendar";
import { GlobalContext } from "@/component/GlobalStore/GlobalState";
import { userApi } from '../../../lib/api';
import { useAuth } from '@/lib/AuthContext'; // Import useAuth

function Overview() {
  const [stats, setStats] = useState(null);
  const [userData, setUserData] = useState(null);
  const { user, token } = useAuth(); // Get token from useAuth
  const { upDatePage, handleToggleState, acceptedMentors } = useContext(GlobalContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile data
        const profileResponse = await userApi.getProfile(token); // Pass token to API
        setUserData(profileResponse.data);
        console.log('Fetched user data:', profileResponse.data);

        // Fetch user stats
        const statsResponse = await userApi.getStats(token); // Pass token to API
        setStats(statsResponse.data);
        console.log('Fetched stats:', statsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (user?.role === 'mentee') {
      fetchData();
    }
  }, [user?.role, token]);

  // Calculate profile completion percentage based on User model fields
  const calculateProfileStrength = () => {
    if (!userData) return 0;

    const requiredFields = {
      firstName: 1,
      lastName: 1,
      email: 1,
      bio: 1,
      interests: 1,
      title: 1,
      department: 1,
      yearOfStudy: 1,
      profilePicture: 1,
      gender: 1,
      social: {
        linkedIn: 1,
        twitter: 1,
        instagram: 1,
        website: 1
      }
    };

    const totalFields = Object.keys(requiredFields).length;
    let completedFields = 0;

    // Count completed fields
    Object.keys(requiredFields).forEach(field => {
      if (field === 'social') {
        // Check if any social media links are filled
        const hasSocialLinks = Object.values(userData[field] || {}).some(link => link && link.trim() !== '');
        if (hasSocialLinks) completedFields++;
      } else if (userData[field] && (Array.isArray(userData[field]) ? userData[field].length > 0 : true)) {
        completedFields++;
      }
    });

    return Math.round((completedFields / totalFields) * 100);
  };

  return (
    <section className="p-3 md:p-0">
      {/* Header Section */}
      <header className="flex justify-between">
        <div className="flex flex-col w-full lg:flex-row justify-start items-start lg:items-center gap-4 lg:gap-0 lg:justify-between">
          <div className="flex flex-col gap-4">
            <h1 className="text-[32px] font-medium">Welcome, {user?.firstName || 'Mentee'} hiii</h1>
            <p className="text-base font-medium text-slate-600">
              {stats?.upcomingSessions > 0 
                ? `You have ${stats.upcomingSessions} upcoming session${stats.upcomingSessions > 1 ? 's' : ''}`
                : 'You have no upcoming sessions'}
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <img
              onClick={() => upDatePage("Message")}
              src="/image/messageIcon.png"
              className="md:w-12 h-9 md:h-12 cursor-pointer"
              alt=""
              loading="lazy"
            />
            <img
              onClick={() => upDatePage("Setting")}
              src="/image/settingIcon.png"
              className="md:w-12 h-9 md:h-12 cursor-pointer"
              alt=""
              loading="lazy"
            />
          </div>
        </div>

        <div onClick={handleToggleState} className="block lg:hidden mt-3">
          <button>
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <section className="mt-11 flex flex-wrap lg:flex-nowrap gap-5 justify-center">
        {/* Profile Strength Section */}
        <div className="py-4 px-2 md:px-4 lg:px-5 rounded-lg bg-white shadow-2xl lg:w-[33%]">
          <div className="flex justify-between">
            <h1 className="md:text-lg lg:text-2xl font-medium">Your profile strength</h1>

            <button 
              onClick={() => upDatePage("MyProfile")}
              className="h-[30px] w-[30px] flex justify-center items-center bg-slate-200 rounded-full hover:bg-slate-300 transition-colors"
            >
              <FontAwesomeIcon icon={faLongArrowRight} />
            </button>
          </div>

          <div className="mt-3">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Profile Completion</span>
              <span className="text-sm font-medium">{calculateProfileStrength()}%</span>
            </div>
            <progress 
              className="h-2 w-full" 
              value={calculateProfileStrength()} 
              max="100"
            ></progress>
          </div>

          <div className="mt-5 border-2 border-gray-100 w-full"></div>
          <div className="mt-5 flex justify-between">
            <h1 className="text-base lg:text-lg text-gray-500 font-medium">
              Complete your 1st Mentorship Sessions Milestone
            </h1>

            <button className="h-[30px] w-[50px] flex justify-center items-center bg-slate-200 rounded-full">
              <FontAwesomeIcon icon={faLongArrowRight} />
            </button>
          </div>

          <div className="mt-3">
            <progress className="h-2 w-full" value={stats?.totalSessions || 0} max="100"></progress>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="bg-white shadow-2xl rounded-lg md:w-[40%] lg:w-[33%]">
          <Calendar
            mode="single"
            className="rounded-lg w-full h-full"
          />
        </div>

        {/* Upcoming Sessions Section */}
        <div className="bg-white p-5 shadow-2xl rounded-lg md:w-[40%] lg:w-[33%]">
          <h2 className="text-lg font-medium mb-4">Upcoming Sessions</h2>
          {acceptedMentors && acceptedMentors.length > 0 ? (
            <div className="space-y-4">
              {acceptedMentors.map((mentor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src={mentor.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.firstName + ' ' + mentor.lastName)}&background=random`}
                      alt={mentor.firstName + ' ' + mentor.lastName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h3 className="font-medium">{mentor.firstName} {mentor.lastName}</h3>
                      <p className="text-sm text-gray-600">{mentor.title || 'Mentor'}</p>
                    </div>
                  </div>
                  <button className="text-customOrange hover:text-orange-600">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No upcoming sessions</p>
          )}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="mt-9">
        <h1 className="text-base md:text-[22px] font-medium text-customDarkBlue mb-6">Your Statistics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Connected Mentors Card */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Connected Mentors</p>
                <h3 className="text-2xl font-bold mt-1">{acceptedMentors?.length || 0}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
               
              </div>
            </div>
          </div>

          {/* Completed Sessions Card */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed Sessions</p>
                <h3 className="text-2xl font-bold mt-1">{stats?.totalSessions || 0}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
               
              </div>
            </div>
          </div>

          {/* Upcoming Sessions Card */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Upcoming Sessions</p>
                <h3 className="text-2xl font-bold mt-1">{stats?.upcomingSessions || 0}</h3>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
               
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}

export default Overview;