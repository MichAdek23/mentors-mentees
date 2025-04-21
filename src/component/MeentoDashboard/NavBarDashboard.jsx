import React, { useContext } from 'react';
import { GlobalContext } from "@/component/GlobalStore/GlobalState";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDeleteLeft } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from "../../lib/AuthContext";
import { useNavigate } from 'react-router-dom';

function NavBarDashboard() {
  const { upDatePage, activeComponent } = useContext(GlobalContext);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <section className="fixed top-0 left-0 h-full bg-gray-800 text-white pt-10">
      {/* Logo Section */}
      <div className="w-full flex justify-center items-center">
        <img src="/image/logo.png.png" className="h-10" alt="Logo" />
      </div>

      {/* Navigation Links */}
      <div className="mt-14 flex flex-col px-5 gap-6">
        <div
          onClick={() => upDatePage('OverView')}
          className={`${
            activeComponent === 'OverView' ? 'text-orange-500' : 'text-gray-400'
          } flex gap-4 font-medium cursor-pointer items-center hover:text-orange-400`}
        >
          <span>
            <img src="/image/overViewIcon.png" className="h-7" alt="Overview Icon" />
          </span>
          Overview
        </div>
        <div
          onClick={() => upDatePage('Explore')}
          className={`${
            activeComponent === 'Explore' ? 'text-orange-500' : 'text-gray-400'
          } flex gap-4 font-medium cursor-pointer items-center hover:text-orange-400`}
        >
          <span>
            <img src="/image/exploreIcon.png" className="h-7" alt="Explore Icon" />
          </span>
          Explore
        </div>
        <div
          onClick={() => upDatePage('Message')}
          className={`${
            activeComponent === 'Message' ? 'text-orange-500' : 'text-gray-400'
          } flex gap-4 font-medium cursor-pointer items-center hover:text-orange-400`}
        >
          <span>
            <img src="/image/messagenavIcon.png" className="h-7" alt="Message Icon" />
          </span>
          Message
        </div>
        <div
          onClick={() => upDatePage('Booking')}
          className={`${
            activeComponent === 'Booking' ? 'text-orange-500' : 'text-gray-400'
          } flex gap-4 font-medium cursor-pointer items-center hover:text-orange-400`}
        >
          <span>
            <img src="/image/BookingIcon.png" className="h-7" alt="Booking Icon" />
          </span>
          Bookings
        </div>
        <div
          onClick={() => upDatePage('Profile')}
          className={`${
            activeComponent === 'Profile' ? 'text-orange-500' : 'text-gray-400'
          } flex gap-4 font-medium cursor-pointer items-center hover:text-orange-400`}
        >
          <span>
            <img src="/image/ProfileIcon.png" className="h-7" alt="Profile Icon" />
          </span>
          My Profile
        </div>
      </div>

      {/* Manage Account Section */}
      <div className="mt-36 flex flex-col px-5 gap-4">
        <h1 className="text-gray-300 text-lg font-medium">Manage Account</h1>
        <div className="mt-8 flex flex-col gap-6">
          <div
            onClick={() => upDatePage('Setting')}
            className={`${
              activeComponent === 'Setting' ? 'text-orange-500' : 'text-gray-400'
            } flex gap-4 font-medium cursor-pointer items-center hover:text-orange-400`}
          >
            <span>
              <img src="/image/navBarSettingIcon.png" className="h-7" alt="Settings Icon" />
            </span>
            Settings
          </div>
          <div
            onClick={handleLogout}
            className="flex gap-4 font-medium cursor-pointer items-center text-gray-400 hover:text-red-500"
          >
            <span>
              <FontAwesomeIcon icon={faDeleteLeft} />
            </span>
            Log Out
          </div>
        </div>
      </div>
    </section>
  );
}

export default NavBarDashboard;