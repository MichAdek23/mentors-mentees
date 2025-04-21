import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo, faClock, faCalendar, faCheck, faTimes, faBan } from '@fortawesome/free-solid-svg-icons';
import { sessionApi } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { format } from 'date-fns';

const Pending = ({ sessions, onJoinMeeting, onSessionUpdate }) => {
  const { user } = useAuth();
  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState(null);

  const handleSessionAction = async (sessionId, action) => {
    try {
      setActionLoading(sessionId);
      setActionError(null);

      const response = await sessionApi.updateStatus(sessionId, action);
      
      if (response.data) {
        if (onSessionUpdate) {
          onSessionUpdate();
        }
      }
    } catch (error) {
      console.error(`Failed to ${action} session:`, error);
      setActionError(`Failed to ${action} session. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };

  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No pending sessions found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {actionError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
          {actionError}
        </div>
      )}
      
      {sessions.map((session) => {
        const sessionDate = new Date(session.date);
        const isMentor = user?.role === 'mentor';
        const isCreator = session.mentor?._id === user?.id;
        const otherParticipant = isMentor ? session.mentee : session.mentor;
        const isLoading = actionLoading === session._id;
        
        return (
          <div
            key={session._id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                  <img
                    src={otherParticipant?.profileImage || '/default-avatar.png'}
                    alt={`${otherParticipant?.name || 'User'}'s avatar`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{session.topic}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isMentor ? 'Mentee' : 'Mentor'}: {otherParticipant?.name || 'Unknown User'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {session.type === 'one-on-one' ? 'One-on-One Session' : 'Group Session'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendar} className="w-4 h-4" />
                  <span>{format(sessionDate, 'PPP')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faClock} className="w-4 h-4" />
                  <span>{format(sessionDate, 'p')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faClock} className="w-4 h-4" />
                  <span>{session.duration} minutes</span>
                </div>
              </div>
            </div>

            {session.description && (
              <div className="mt-4 text-gray-600 dark:text-gray-400">
                <p className="text-sm">{session.description}</p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              {session.status === 'accepted' && (
                <button
                  onClick={() => onJoinMeeting(session.jitsiRoomId)}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faVideo} className="w-4 h-4" />
                  Join Meeting
                </button>
              )}

              {session.status === 'pending' && isMentor && !isCreator && (
                <>
                  <button
                    onClick={() => handleSessionAction(session._id, 'accepted')}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                    )}
                    Accept
                  </button>
                  <button
                    onClick={() => handleSessionAction(session._id, 'rejected')}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                    )}
                    Reject
                  </button>
                </>
              )}

              {session.status === 'pending' && isCreator && (
                <button
                  onClick={() => handleSessionAction(session._id, 'cancelled')}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FontAwesomeIcon icon={faBan} className="w-4 h-4" />
                  )}
                  Cancel Session
                </button>
              )}

              {session.status === 'accepted' && isMentor && (
                <button
                  onClick={() => handleSessionAction(session._id, 'completed')}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                  )}
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Pending;