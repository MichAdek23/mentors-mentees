import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { io } from 'socket.io-client';

const ConnectionRequest = ({ userId, userName }) => {
  const { user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const socketRef = React.useRef();

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(import.meta.env.VITE_API_URL, {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    // Listen for connection status updates
    socketRef.current.on('connectionAccepted', (data) => {
      if (data.recipient === user._id || data.requester === user._id) {
        setConnectionStatus('accepted');
      }
    });

    socketRef.current.on('connectionRejected', (data) => {
      if (data.recipient === user._id || data.requester === user._id) {
        setConnectionStatus('rejected');
      }
    });

    // Check existing connection status
    checkConnectionStatus();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId, user._id]);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/connections`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const connections = await response.json();
      
      const existingConnection = connections.find(conn => 
        (conn.requester._id === user._id && conn.recipient._id === userId) ||
        (conn.requester._id === userId && conn.recipient._id === user._id)
      );

      if (existingConnection) {
        setConnectionStatus(existingConnection.status);
      }
    } catch (err) {
      console.error('Error checking connection status:', err);
    }
  };

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/connections/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ recipientId: userId })
      });

      if (!response.ok) {
        throw new Error('Failed to send connection request');
      }

      setConnectionStatus('pending');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptConnection = async (connectionId) => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/connections/${connectionId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to accept connection');
      }

      setConnectionStatus('accepted');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectConnection = async (connectionId) => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/connections/${connectionId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to reject connection');
      }

      setConnectionStatus('rejected');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  if (connectionStatus === 'accepted') {
    return (
      <button
        onClick={() => window.location.href = `/messages?userId=${userId}`}
        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
      >
        Message
      </button>
    );
  }

  if (connectionStatus === 'pending') {
    return (
      <div className="text-orange-500 text-sm">
        Connection request pending
      </div>
    );
  }

  if (connectionStatus === 'rejected') {
    return (
      <button
        onClick={handleConnect}
        disabled={isLoading}
        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
      >
        {isLoading ? 'Sending...' : 'Connect Again'}
      </button>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isLoading}
      className="bg-customOrange text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
    >
      <FontAwesomeIcon icon={faUserPlus} />
      {isLoading ? 'Sending...' : 'Connect'}
    </button>
  );
};

export default ConnectionRequest; 