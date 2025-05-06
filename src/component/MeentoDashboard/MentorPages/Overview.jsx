import React, { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faLongArrowRight, faBars } from "@fortawesome/free-solid-svg-icons";
import { Calendar } from "@/components/ui/calendar";
import { GlobalContext } from "@/component/GlobalStore/GlobalState";
import { userApi } from '../../../lib/api';
import { useAuth } from '@/lib/AuthContext';

// Function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return "/image/default-profile.png";
  
  // For Cloudinary URLs
  if (imagePath.includes('cloudinary.com')) {
    console.log('Using Cloudinary URL:', imagePath);
    return imagePath;
  }
  
  // For uploaded images from the database
  if (imagePath.startsWith('/uploads/')) {
    const url = `${import.meta.env.VITE_API_URL || 'https://leapon.onrender.com'}${imagePath}`;
    console.log('Using local server URL:', url);
    return url;
  }
  
  // For static images in the public directory
  console.log('Using static image:', imagePath);
  return imagePath;
};

function Overview() {
  const [stats, setStats] = useState(null);
  const [connections, setConnections] = useState([]);
  const [upcomingSessionsCount, setUpcomingSessionsCount] = useState(0);
  const [userData, setUserData] = useState(null);
  const { user } = useAuth(); // Get user from useAuth
  const { upDatePage, handleToggleState, acceptedMentees } = useContext(GlobalContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile
        const profileResponse = await userApi.getProfile();
        setUserData(profileResponse.data);

        // Fetch user statistics
        if (userApi.getStats) {
          const statsResponse = await userApi.getStats();
          setStats(statsResponse.data);
        } else {
          console.error("userApi.getStats is not defined");
        }

        // Fetch connections
        const connectionsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/connections`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const connectionsData = await connectionsResponse.json();
        setConnections(connectionsData);

        // Fetch upcoming sessions count
        const upcomingResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/sessions/upcoming/count`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const upcomingData = await upcomingResponse.json();
        setUpcomingSessionsCount(upcomingData.count);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

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
      expertise: 1,
      experience: 1,
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

  const Title = [
    "#1 Tips for Success",
    "#2 Tips for Success",
    "#3 Tips for Success",
    "#4 Tips for Success",
  ];
  const Heading = [
    "How to prepare for your first meeting",
    "What should we talk about during our meeting?",
    "Be on time!",
    "After the session, stay connected!",
  ];
  const Message = [
    "Plan an agenda! Plan out the questions and topics you'd like to discuss. If you'd like to work together on long-term goals, set some time to discuss expectations for each other.",
    "Learn about each other's backgrounds to see if there's a fit. You can discuss your goals, challenges, recent successes, or a specific topic you need help with - it's up to you.",
    "You will receive multiple reminders for your session, don't be late! Get off to a good start by showing up on time.",
    "After your session, don't be a stranger! Keep your mentor updated on your progress - they are more invested in your success than you think!",
  ];

  const [index, setIndex] = useState(0);
  const [date, setDate] = useState(new Date());
  

  const nextMessage = () => {
    setIndex((prevIndex) => (prevIndex + 1) % Title.length);
  };

  const prevMessage = () => {
    setIndex((prevIndex) => (prevIndex - 1 + Title.length) % Title.length);
  };

  return (
    <section className="p-3 md:p-0">
      {/* Header Section */}
      <header className="flex justify-between">
        <div className="flex flex-col w-full lg:flex-row justify-start items-start lg:items-center gap-4 lg:gap-0 lg:justify-between">
          <div className="flex flex-col gap-4">
            <h1 className="text-[32px] font-medium">Welcome, {user?.firstName || 'Mentor'}</h1>
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

        <div className="bg-white shadow-2xl rounded-lg md:w-[40%] lg:w-[33%]">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-lg w-full h-full"
          />
        </div>

        <div className="bg-white p-5 shadow-2xl rounded-lg md:w-[40%] lg:w-[33%] flex flex-col justify-between">
          <div>
            <div className="flex justify-between">
              <div>
                <h1 className="md:text-lg font-medium text-gray-600">{Title[index]}</h1>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={prevMessage}
                  className="h-[30px] w-[30px] flex justify-center items-center bg-slate-200 rounded-full"
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                </button>

                <button
                  onClick={nextMessage}
                  className="h-[30px] w-[30px] flex justify-center items-center bg-slate-200 rounded-full"
                >
                  <FontAwesomeIcon icon={faLongArrowRight} />
                </button>
              </div>
            </div>

            <h2 className="text-xl font-semibold mt-2">{Heading[index]}</h2>
            <p className="text-sm md:text-lg text-gray-500 mt-2">{Message[index]}</p>
          </div>
        </div>

        {/* Upcoming Sessions Section */}
        {/* <div className="bg-white p-5 shadow-2xl rounded-lg md:w-[40%] lg:w-[33%]">
          <h2 className="text-lg font-medium mb-4">Upcoming Sessions</h2>
          <p className="text-gray-600">
            You have <strong>{upcomingSessionsCount}</strong> upcoming session
            {upcomingSessionsCount !== 1 ? "s" : ""}.
          </p>
        </div>
      </section> */}

      {/* Statistics Section */}
      <section className="mt-9">
        <h1 className="text-base md:text-[22px] font-medium text-customDarkBlue mb-6">Your Statistics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Connections Card */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Connections</p>
                <h3 className="text-2xl font-bold mt-1">{connections.length}</h3>
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

          {/* Total Messages Card */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Messages</p>
                <h3 className="text-2xl font-bold mt-1">{stats?.totalMessages || 0}</h3>
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
