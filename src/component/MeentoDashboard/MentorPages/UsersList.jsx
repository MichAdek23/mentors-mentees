import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/AuthContext';
import { userApi } from '../../../lib/api';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await (user?.role === 'mentor' ? userApi.getMentees() : userApi.getMentors());
        setUsers(response.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user?.role]);

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">
        {user?.role === 'mentor' ? 'Available Mentees' : 'Available Mentors'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                alt={user.name}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
            
            {user.role === 'mentor' && (
              <div className="mt-4">
                <h4 className="font-medium">Expertise:</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {user.expertise?.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-gray-600">{user.experience}</p>
              </div>
            )}

 

            {user.overview && (
              <div className="mt-4">
                <h4 className="font-medium">Overview:</h4>
                <p className="text-gray-600 mt-1">{user.overview}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersList; 