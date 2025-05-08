import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sessionApi } from '../../../lib/api'; // Corrected Import path for sessionApi
import { AuthContext } from '../../../lib/AuthContext'; // Keep AuthContext import as is

const SessionActionPage = () => {
  const { sessionId, action } = useParams();
  const [message, setMessage] = useState('Processing session action...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = useContext(AuthContext); // Get user from AuthContext

  useEffect(() => {
    const handleSessionAction = async () => {
      if (!sessionId || (action !== 'accept' && action !== 'reject')) {
        setMessage('Invalid session link.');
        setError(new Error('Invalid parameters in URL'));
        setLoading(false);
        return;
      }

      // Prevent unauthorized actions (optional, but good practice)
      // You might want more robust checks on the backend too
      if (!user) {
          setMessage('You need to be logged in to perform this action.');
          setLoading(false);
          // Optionally redirect to login page here
          // navigate('/login');
          return;
      }

      try {
        // Determine the status to send based on the action parameter
        const statusToSend = action === 'accept' ? 'accepted' : 'rejected';

        // Call the backend API to update the session status using sessionApi.updateStatus
        const response = await sessionApi.updateStatus(sessionId, statusToSend);

        // Check for a successful response from the API (status code 2xx)
        if (response.status >= 200 && response.status < 300) {
          setMessage(`Session ${statusToSend} successfully.`);
        } else {
          // Handle non-successful status codes or unexpected response structure
          setMessage(`Failed to ${action} session.`);
          console.error('API Error Response:', response);
          setError(new Error(`API returned status: ${response.status}`));
        }

      } catch (err) {
        // Handle network errors or exceptions during the API call
        setMessage(`An error occurred while trying to ${action} the session.`);
        setError(err);
        console.error('Caught API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Only run the effect if user is loaded (to prevent API call before auth context is ready)
    if (user !== undefined) { // Check if user is explicitly defined (not just null)
        handleSessionAction();
    }

  }, [sessionId, action, user]); // Add user to dependency array

  // Determine the dashboard path based on user role
  const dashboardPath = user?.role === 'mentor' ? '/mentor-dashboard' : '/mentee-dashboard';

  return (
    <div className="container mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-4">Session Action</h1>
      {loading && <p>{message}</p>}
      {!loading && error && (
        <div className="text-red-500">
          <p>{message}</p>
          {/* Optional: Display error details in development */}
          {/* <p className="text-sm">{error.message}</p> */}
        </div>
      )}
      {!loading && !error && (
        <div className="text-green-600">
          <p>{message}</p>
        </div>
      )}
      {/* Add a link to redirect the user to their specific dashboard */}
      {!loading && (
         <div className="mt-4">
           <Link to={dashboardPath} className="text-blue-500 hover:underline">Go to Dashboard</Link>
         </div>
      )}
    </div>
  );
};

export default SessionActionPage;