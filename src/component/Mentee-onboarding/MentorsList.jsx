import React, { useState, useEffect } from 'react';
import { Star, BookOpen, Users, MessageSquare } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { useContext } from 'react';
import { GlobalContext } from '@/component/GlobalStore/GlobalState';
import { userApi } from '../../../lib/api';

const MentorsList = () => {
  const { handleToggleState } = useContext(GlobalContext);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('all');

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const response = await userApi.getMentors();
      setMentors(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesExpertise = selectedExpertise === 'all' || 
                            mentor.expertise.includes(selectedExpertise);
    return matchesSearch && matchesExpertise;
  });

  const handleConnect = async (mentorId) => {
    try {
      const response = await fetch('/api/connections/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ mentorId })
      });

      if (!response.ok) {
        throw new Error('Failed to send connection request');
      }

      // Update UI to show pending request
      setMentors(mentors.map(mentor => 
        mentor._id === mentorId 
          ? { ...mentor, connectionStatus: 'pending' }
          : mentor
      ));
    } catch (err) {
      console.error('Error sending connection request:', err);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-full">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  const expertiseOptions = ['all', ...new Set(mentors.flatMap(mentor => mentor.expertise))];

  return (
    <div className="h-fit bg-gray-50 dark:bg-gray-900 pb-8">
      <header className="flex mt-4 justify-between px-4 mb-8">
        <div className="flex flex-col w-full lg:flex-row justify-start items-start lg:items-center gap-4 lg:gap-0 lg:justify-between">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-medium">Find a Mentor</h1>
            <p className="text-base font-medium text-slate-600">Connect with experienced mentors</p>
          </div>
        </div>
        <div onClick={handleToggleState} className="block lg:hidden mt-3">
          <button aria-label="Toggle menu">
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search mentors..."
            className="flex-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            value={selectedExpertise}
            onChange={(e) => setSelectedExpertise(e.target.value)}
          >
            {expertiseOptions.map(expertise => (
              <option key={expertise} value={expertise}>
                {expertise === 'all' ? 'All Expertise' : expertise}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map(mentor => (
            <div key={mentor._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={mentor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=random`}
                  alt={mentor.name}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h2 className="text-xl font-semibold">{mentor.name}</h2>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>{mentor.rating || '4.5'}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-medium mb-2">Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise.map((exp, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-medium mb-2">Experience</h3>
                <p className="text-gray-600 dark:text-gray-400">{mentor.experience} years</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {mentor.menteesCount || 0} mentees
                  </span>
                </div>
                <button
                  onClick={() => handleConnect(mentor._id)}
                  disabled={mentor.connectionStatus === 'pending'}
                  className={`px-4 py-2 rounded-lg ${
                    mentor.connectionStatus === 'pending'
                      ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  {mentor.connectionStatus === 'pending' ? 'Request Sent' : 'Connect'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MentorsList; 