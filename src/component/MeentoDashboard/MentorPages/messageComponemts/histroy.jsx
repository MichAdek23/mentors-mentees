import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

function History({ sessions }) {
  const { user } = useAuth();
  const isMentor = user?.role === 'mentor';

  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No completed sessions found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sessions.map((session) => {
        const sessionDate = new Date(session.date);
        const otherParticipant = isMentor ? session.mentee : session.mentor;
        
        return (
          <div key={session._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
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
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Session with {otherParticipant?.name || 'Unknown User'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {format(sessionDate, 'PPP p')}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Duration:</span> {session.duration} minutes
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Topic:</span> {session.topic}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Type:</span> {session.type === 'one-on-one' ? 'One-on-One Session' : 'Group Session'}
                </p>
                {session.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Description:</span> {session.description}
                  </p>
                )}
              </div>
              
              {session.feedback && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Feedback</h3>
                  {session.feedback.rating && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Rating: {[...Array(session.feedback.rating)].map((_, i) => (
                        <FontAwesomeIcon key={i} icon={faStar} className="text-yellow-400" />
                      ))}
                    </p>
                  )}
                  {session.feedback.comment && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      "{session.feedback.comment}"
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default History;