import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, MessageSquare, CheckCircle, XCircle, Plus } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { useContext } from 'react';
import { GlobalContext } from '@/component/GlobalStore/GlobalState';
import { sessionApi } from '@/lib/api';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext'; // Import useAuth

const Sessions = () => {
  const { handleToggleState } = useContext(GlobalContext);
  const { token } = useAuth(); // Get token from useAuth
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchSessions();
  }, [activeTab]);

  const fetchSessions = async () => {
    try {
      let response;
      switch (activeTab) {
        case 'pending':
          response = await sessionApi.getPending(); // Token is automatically added by the interceptor
          break;
        case 'accepted':
          response = await sessionApi.getAccepted(); // Token is automatically added by the interceptor
          break;
        case 'history':
          response = await sessionApi.getHistory(); // Token is automatically added by the interceptor
          break;
        default:
          response = await sessionApi.getPending(); // Token is automatically added by the interceptor
      }

      // Debug: Log the response to verify the API call
      console.log('Fetched sessions:', response.data);

      setSessions(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSessionAction = async (sessionId, action) => {
    try {
      await sessionApi.updateStatus(sessionId, action, token); // Pass token to API
      fetchSessions(); // Refresh sessions after action
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} session`);
    }
  };

  const joinJitsiMeeting = (roomId) => {
    // Open Jitsi Meet in a new window
    window.open(`https://meet.jit.si/${roomId}`, '_blank');
  };

  if (loading) return <div className="flex justify-center items-center h-full">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="h-fit bg-gray-50 dark:bg-gray-900 pb-8">
      <header className="flex mt-4 justify-between px-4 mb-8">
        <div className="flex flex-col w-full lg:flex-row justify-start items-start lg:items-center gap-4 lg:gap-0 lg:justify-between">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-medium">My Session</h1>
            <p className="text-base font-medium text-slate-600">Manage your mentoring sessions</p>
          </div>
          <Link
            to="/mentee/create-session"
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            <Plus className="w-4 h-4" />
            Schedule New Session
          </Link>
        </div>
        <div onClick={handleToggleState} className="block lg:hidden mt-3">
          <button aria-label="Toggle menu">
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'pending'
                ? 'bg-orange-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab('accepted')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'accepted'
                ? 'bg-orange-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Accepted
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'history'
                ? 'bg-orange-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            History
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {sessions.map(session => (
            <div key={session._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={session.mentor.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.mentor.name)}&background=random`}
                    alt={session.mentor.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h2 className="text-xl font-semibold">{session.mentor.name}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{session.topic}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(session.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{session.duration} minutes</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-4">
                {session.status === 'accepted' && (
                  <button
                    onClick={() => joinJitsiMeeting(session.jitsiRoomId)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <Video className="w-4 h-4" />
                    Join Meeting
                  </button>
                )}

                {activeTab === 'pending' && session.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleSessionAction(session._id, 'accept')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleSessionAction(session._id, 'reject')}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </>
                )}

                {session.status === 'accepted' && (
                  <button
                    onClick={() => handleSessionAction(session._id, 'complete')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sessions;