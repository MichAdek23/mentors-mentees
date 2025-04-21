import React from 'react';

function History({ sessions }) {
  if (!sessions?.length) {
    return <div className="text-center py-4">No session history found</div>;
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
                <p className={`text-sm mt-2 ${
                  session.status === 'accepted' ? 'text-green-500' : 
                  session.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'
                }`}>
                  Status: {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default History; 