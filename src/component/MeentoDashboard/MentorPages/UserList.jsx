import React, { useState, useEffect } from 'react';
import { userApi } from '../../../lib/api';
import { useAuth } from '../../../lib/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faGraduationCap, faBriefcase } from '@fortawesome/free-solid-svg-icons';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = user.role === 'mentor' 
          ? await userApi.getMentees()
          : await userApi.getMentors();
        setUsers(response.data);
      } catch (err) {
        setError('Failed to fetch users');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user.role]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-customOrange"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {user.role === 'mentor' ? 'My Mentees' : 'Available Mentors'}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div
            key={user._id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="text-gray-500 text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            {user.role === 'student' ? (
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <FontAwesomeIcon icon={faGraduationCap} className="mr-2" />
                  <span>{user.department}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span>Year {user.yearOfStudy}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
                  <span>{user.experience}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.expertise.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user.overview && (
              <div className="mt-4">
                <p className="text-gray-600 text-sm line-clamp-2">{user.overview}</p>
              </div>
            )}

            <button
              className="mt-4 w-full bg-customOrange text-white py-2 rounded-lg hover:bg-orange-600 transition-colors"
              onClick={() => {
                // TODO: Implement connection/chat functionality
                console.log('Connect with user:', user._id);
              }}
            >
              Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList; 