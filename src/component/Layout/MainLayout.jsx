import React from 'react';
import { useAuth } from '../../lib/AuthContext';
import ConnectionNotifications from '../UserAuth/ConnectionNotifications';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faUser, 
  faComments, 
  faSignOutAlt,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <button
                onClick={toggleSidebar}
                className="px-4 text-gray-500 focus:outline-none focus:text-gray-700 md:hidden"
              >
                <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} />
              </button>
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold text-customOrange">
                  Leap-ON
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <div className="ml-3 relative">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}
        >
          <div className="h-full flex flex-col">
            <div className="flex-1 px-3 py-4 space-y-1">
              <Link
                to="/"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <FontAwesomeIcon icon={faHome} className="mr-3" />
                Home
              </Link>
              <Link
                to={`/profile/${user._id}`}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <FontAwesomeIcon icon={faUser} className="mr-3" />
                Profile
              </Link>
              <Link
                to={user.role === 'mentor' ? '/mentor/messages' : '/messages'}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <FontAwesomeIcon icon={faComments} className="mr-3" />
                Messages
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 md:ml-64">
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Connection Notifications */}
      {user && <ConnectionNotifications />}
    </div>
  );
};

export default MainLayout; 