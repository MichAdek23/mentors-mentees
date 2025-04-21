import React from 'react';
import { sessionApi } from '@/lib/api';

function Pending({ sessions }) {
  const handleAccept = async (sessionId) => {
    try {
      await sessionApi.update(sessionId, { status: 'accepted' });
      // You might want to add a refresh mechanism here
    } catch (error) {
      console.error('Failed to accept session:', error);
    }
  };

  const handleReject = async (sessionId) => {
    try {
      await sessionApi.update(sessionId, { status: 'rejected' });
      // You might want to add a refresh mechanism here
    } catch (error) {
      console.error('Failed to reject session:', error);
    }
  };

  if (!sessions?.length) {
    return <div className="text-center py-4">No pending sessions found</div>;
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <div key={session._id} className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{session.title}</h3>
              <p className="text-gray-600">{session.description}</p>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Date: {new Date(session.scheduledDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  Time: {new Date(session.scheduledDate).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleAccept(session._id)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Accept
              </button>
              <button
                onClick={() => handleReject(session._id)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Pending; 