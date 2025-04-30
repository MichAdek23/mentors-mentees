import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDeleteLeft } from '@fortawesome/free-solid-svg-icons';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white  p-4">
        {/* Logo Section */}
        <div className="w-full flex justify-center items-center mb-10">
           <h1 className=' text-xl md:text-2xl font-bold text-orange-400 '>Leap Mentorship</h1>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-6">
          <button
            onClick={() => navigate('/mentor-dashboard')}
            className="block w-full text-left px-4 py-2 rounded hover:bg-gray-700 text-gray-400 hover:text-orange-400"
          >
            <img src="/image/overViewIcon.png" className="h-7 inline-block mr-2" alt="Overview Icon" />
            Overview
          </button>
          <button
            onClick={() => navigate('/mentor-dashboard/booking')}
            className="block w-full text-left px-4 py-2 rounded hover:bg-gray-700 text-gray-400 hover:text-orange-400"
          >
            <img src="/image/BookingIcon.png" className="h-7 inline-block mr-2" alt="Booking Icon" />
            Bookings
          </button>
          <button
            onClick={() => navigate('/mentor-dashboard/messages')}
            className="block w-full text-left px-4 py-2 rounded hover:bg-gray-700 text-gray-400 hover:text-orange-400"
          >
            <img src="/image/messagenavIcon.png" className="h-7 inline-block mr-2" alt="Messages Icon" />
            Messages
          </button>
          <button
            onClick={() => navigate('/mentor-dashboard/requests')}
            className="block w-full text-left px-4 py-2 rounded hover:bg-gray-700 text-gray-400 hover:text-orange-400"
          >
            <img src="/image/ProfileIcon.png" className="h-7 inline-block mr-2" alt="Requests Icon" />
            Requests
          </button>
        </nav>

        {/* Manage Account Section */}
        <div className="mt-36">
          <h1 className="text-gray-300 text-lg font-medium px-4">Manage Account</h1>
          <div className="mt-8 space-y-6 px-4">
            <button
              onClick={() => navigate('/mentor-dashboard/settings')}
              className="block w-full text-left px-4 py-2 rounded hover:bg-gray-700 text-gray-400 hover:text-orange-400"
            >
              <img src="/image/navBarSettingIcon.png" className="h-7 inline-block mr-2" alt="Settings Icon" />
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 rounded hover:bg-gray-700 text-gray-400 hover:text-red-500"
            >
              <FontAwesomeIcon icon={faDeleteLeft} className="mr-2" />
              Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-6">{children}</main>
    </div>
  );
};

export default DashboardLayout;
