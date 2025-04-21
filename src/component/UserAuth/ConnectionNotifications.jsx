import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { io } from 'socket.io-client';

const ConnectionNotifications = () => {
  const { user } = useAuth();
  const [pendingConnections, setPendingConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const socketRef = React.useRef();

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(import.meta.env.VITE_API_URL, {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    // Listen for new connection requests
    socketRef.current.on('newConnectionRequest', (data) => {
      if (data.recipient === user._id) {
        fetchPendingConnections();
      }
    });

    // Listen for connection status updates
    socketRef.current.on('connectionAccepted', (data) => {
      if (data.recipient === user._id || data.requester === user._id) {
        fetchPendingConnections();
      }
    });

    socketRef.current.on('connectionRejected', (data) => {
      if (data.recipient === user._id || data.requester === user._id) {
        fetchPendingConnections();
      }
    });

    // Fetch initial pending connections
    fetchPendingConnections();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user._id]);

  const fetchPendingConnections = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/connections/pending`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setPendingConnections(data);
    } catch (err) {
      setError('Failed to fetch pending connections');
      console.error('Error fetching pending connections:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptConnection = async (connectionId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/connections/${connectionId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to accept connection');
      }

      fetchPendingConnections();
    } catch (err) {
      setError('Failed to accept connection');
      console.error('Error accepting connection:', err);
    }
  };

  const handleRejectConnection = async (connectionId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/connections/${connectionId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to reject connection');
      }

      fetchPendingConnections();
    } catch (err) {
      setError('Failed to reject connection');
      console.error('Error rejecting connection:', err);
    }
  };

  if (isLoading) {
    return <div className="text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (pendingConnections.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-md">
        <h3 className="text-lg font-semibold mb-4">Connection Requests</h3>
        <div className="space-y-4">
          {pendingConnections.map((connection) => (
            <div
              key={connection._id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faUserPlus} className="text-customOrange" />
                <div>
                  <p className="font-medium">{connection.requester.name}</p>
                  <p className="text-sm text-gray-500">wants to connect with you</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAcceptConnection(connection._id)}
                  className="p-2 text-green-500 hover:bg-green-50 rounded-full"
                >
                  <FontAwesomeIcon icon={faCheck} />
                </button>
                <button
                  onClick={() => handleRejectConnection(connection._id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConnectionNotifications; 