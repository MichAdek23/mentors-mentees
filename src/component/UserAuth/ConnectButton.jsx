import React from 'react';
import { useAuth } from '../../lib/AuthContext';
import ConnectionRequest from './ConnectionRequest';

const ConnectButton = ({ userId, userName }) => {
  const { user } = useAuth();

  // Don't show connect button if viewing own profile
  if (user._id === userId) {
    return null;
  }

  return (
    <div className="mt-4">
      <ConnectionRequest userId={userId} userName={userName} />
    </div>
  );
};

export default ConnectButton; 