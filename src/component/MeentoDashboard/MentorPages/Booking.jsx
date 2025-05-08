import { GlobalContext } from '@/component/GlobalStore/GlobalState';
import React, { useContext, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, } from '@fortawesome/free-solid-svg-icons';
import Pending from './messageComponemts/Pending';
import Histroy from './messageComponemts/histroy';
import SessionNotification from './messageComponemts/SessionNotification';
import { sessionApi } from '@/lib/api'; 
import { useNavigate } from 'react-router-dom';

function Booking() {
  const { upDatePage, handleToggleState, userRole, selectedUserForSession, user } = useContext(GlobalContext); 
  const [components, setComponents] = useState('Pending');
  const [pendingSessions, setPendingSessions] = useState([]);
  const [historySessions, setHistorySessions] = useState([]);
  // Renamed mentors to connectedUsers
  const [connectedUsers, setConnectedUsers] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    mentor: '', // This field still holds the recipient's ID
    date: '',
    time: '',
    duration: 60,
    topic: '',
    type: 'one-on-one',
    description: '',
    notes: ''
  });
  const [connectionRequests, setConnectionRequests] = useState([]);
  const navigate = useNavigate();
   const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (components === 'Pending') {
          const response = await sessionApi.getPending();
          setPendingSessions(response.data);
        } else if (components === 'History') {
          const response = await sessionApi.getHistory();
          setHistorySessions(response.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [components]);

  useEffect(() => {
    const fetchConnectedUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/connections`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch connected users");
        }
        const data = await response.json();
        
        // Corrected logic: Backend now returns an array of user objects directly.
        // Filter out any null/undefined entries and ensure each user object has an _id.
        setConnectedUsers(data.filter(user => user && user._id)); 

      } catch (err) {
        setError(err.message || "Failed to fetch connected users");
        setConnectedUsers([]); // Use setConnectedUsers
      } finally {
        setLoading(false);
      }
    };
    if (components === 'Create') {
      fetchConnectedUsers();
    } else {
      setConnectedUsers([]); // Use setConnectedUsers
    }
  }, [components]);

  useEffect(() => {
    const fetchConnectionRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        if (components === 'Pending') {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/connections/pending`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch connection requests");
          }

          const data = await response.json();
          setConnectionRequests(data);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch connection requests");
      } finally {
        setLoading(false);
      }
    };
    fetchConnectionRequests();
  }, [components]);

  useEffect(() => {
    if (selectedUserForSession && components === "Create") {
      setFormData((prev) => ({
        ...prev,
        mentor: selectedUserForSession, 
      }));
    }
  }, [selectedUserForSession, components]);

  useEffect(() => {
    if (selectedUserForSession) {
      setComponents("Create"); 
      setFormData((prev) => ({
        ...prev,
        mentor: selectedUserForSession, 
      }));
    }
  }, [selectedUserForSession]);

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/connections/${requestId}/accept`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to accept request");
      }

      setConnectionRequests((prev) => prev.filter((req) => req._id !== requestId));
      // TODO: Trigger in-app notification for request acceptance for both users
      // TODO: Consider triggering a push notification to the request initiator

    } catch (err) {
      console.error("Error accepting request:", err);
      setError(err.message || "Failed to accept request. Please try again.");
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/connections/${requestId}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reject request");
      }
      setConnectionRequests((prev) => prev.filter((req) => req._id !== requestId));
       // TODO: Trigger in-app notification for request rejection for both users

    } catch (err) {
      console.error("Error rejecting request:", err);
      setError(err.message || "Failed to reject request. Please try again.");
    }
  };

  const changeStateToPending = () => setComponents('Pending');
  const changeStateToHistory = () => setComponents('History');
  const changeStateToCreate = () => setComponents('Create');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.mentor) {
      setError('Please select a user to create a session with'); // Updated validation message
      return false;
    }
    if (!formData.date || !formData.time) {
      setError('Please select date and time');
      return false;
    }
    if (!formData.topic) {
      setError('Please enter a topic');
      return false;
    }
    if (formData.duration < 30 || formData.duration > 180) {
      setError('Duration must be between 30 and 180 minutes');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(''); // Clear any previous success message

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not logged in. Redirecting to login page...");
        navigate("/login");
        return;
      }

      const dateTime = new Date(`${formData.date}T${formData.time}`);
      const sessionDataToCreate = {
        ...formData,
         mentee: user?._id, // The logged-in user is the initiator
         mentor: formData.mentor, // This is the ID of the selected user (recipient)
        date: dateTime.toISOString(),
        duration: parseInt(formData.duration),
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/sessions/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sessionDataToCreate),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create session");
      }

      const createdSession = await response.json(); 
       setSuccessMessage("Session created successfully! Waiting for recipient's confirmation."); // Set success message

      // Placeholder for sending a push notification to the recipient via backend
      if (createdSession && createdSession.session && createdSession.session._id && formData.mentor) {
        try {
          const notifyResponse = await fetch(`${import.meta.env.VITE_API_URL}/notifications/send-session-request`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              recipientId: formData.mentor, 
              sessionId: createdSession.session._id,
              message: `You have a new session request for "${formData.topic}" from ${user?.firstName || 'a user'}.`,
            }),
          });
          if (!notifyResponse.ok) {
            console.error("Failed to send push notification request to backend");
          }
        } catch (notifyError) {
          console.error("Error trying to send push notification request:", notifyError);
        }
      }

      setComponents("Pending");
      setFormData({
        mentor: "", date: "", time: "", duration: 60, topic: "",
        type: "one-on-one", description: "", notes: "",
      });
    } catch (err) {
      setError(err.message || "Failed to create session. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const joinJitsiMeeting = (roomId) => {
    window.open(`https://meet.jit.si/${roomId}`, '_blank');
  };

  const getCreateButtonText = () => {
    return userRole === 'mentor' ? 'Connect with User' : 'Create Session'; // Simplified button text
  };

  const displayComponent = () => {
    if (loading && components === 'Create') {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-red-500 text-center py-4 bg-red-50 rounded-lg">
          {error}
        </div>
      );
    }
    switch (components) {
      case 'Pending':
        return (
          <>
            {/* SessionNotification is for browser notifications, doesn't render UI here */}
            <SessionNotification sessions={pendingSessions} /> 
            {/* Pending component displays the list of pending sessions */}
            <Pending sessions={pendingSessions} onJoinMeeting={joinJitsiMeeting} onSessionUpdate={() => fetchData()} />
            <div className="mt-6">
              <h2 className="text-lg font-medium mb-4">Connection Requests</h2>
              {connectionRequests.length === 0 ? (
                <p className="text-gray-600">No pending connection requests</p>
              ) : (
                <ul className="space-y-4">
                  {connectionRequests.map((request) => (
                    <li
                      key={request._id}
                      className="p-4 border rounded-lg bg-white dark:bg-gray-800"
                    >
                      <p className="font-medium">
                        {`${request.requester.firstName} ${request.requester.lastName}`} wants to connect with you.
                      </p>
                      <p className="text-sm text-gray-600">{request.requester.email}</p>
                      <div className="mt-4 flex gap-4 items-center">
                        <button
                          onClick={() => handleAcceptRequest(request._id)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request._id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        );
      case 'History':
        return <Histroy sessions={historySessions} />;
      case 'Create':
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
           {successMessage && (
                <div className="text-green-500 text-center py-2 bg-green-50 rounded-lg">
                  {successMessage}
                </div>
              )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select a User to Create Session With
              </label>
              <select
                name="mentor" // Keeping as 'mentor' to match backend API expected field name
                value={formData.mentor}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Choose a connected user</option>
                {/* Iterate over connectedUsers instead of mentors */}
                {connectedUsers.length === 0 && !loading && (
                  <option value="" disabled>No connected users found.</option>
                )}
                {connectedUsers.map(user => (
                  <option key={user._id} value={user._id}>
                    {`${user.firstName} ${user.lastName}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                min="30"
                max="180"
                step="30"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic
              </label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                required
                placeholder="What would you like to discuss?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="one-on-one">One-on-One</option>
                <option value="group">Group Session</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Provide more details about what you want to discuss..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Any additional information you'd like to share..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {userRole === 'mentor' ? 'Creating session...' : 'Creating Session...'} // Simplified text
                  </>
                ) : (
                  'Create Session' // Simplified button text
                )}
              </button>
            </div>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <section className="p-3 md:p-0">
      {/* Header Section */}
      <header className="flex justify-between">
        <div className="flex flex-col w-full lg:flex-row justify-start items-start lg:items-center gap-4 lg:gap-0 lg:justify-between">
          <div className="flex flex-col gap-4">
            <h1 className="text-[32px] font-medium">Bookings</h1>
            <p className="text-base font-medium text-slate-600">Manage your mentoring sessions</p>
          </div>
          <div className="flex items-center gap-4">
            <img
              onClick={() => upDatePage('Message')}
              src="/image/messageIcon.png"
              className="md:w-12 h-9 md:h-12 cursor-pointer"
              alt="Message Icon"
              loading="lazy"
            />
            <img
              onClick={() => upDatePage('Setting')}
              src="/image/settingIcon.png"
              className="md:w-12 h-9 md:h-12 cursor-pointer"
              alt="Setting Icon"
              loading="lazy"
            />
          </div>
        </div>
        <div onClick={handleToggleState} className="block lg:hidden mt-3">
          <button><FontAwesomeIcon icon={faBars} /></button>
        </div>
      </header>

      <main className="mt-14">
        <div className="p-2 bg-white w-[300px]  md:w-fit flex flex-wrap items-center gap-2 rounded-md cursor-pointer shadow-sm">
          <button
            onClick={changeStateToPending}
            className={`h-10 w-28 rounded-md text-black font-semibold transition-colors duration-300 ${
              components === 'Pending' ? 'bg-orange-500 text-white' : 'bg-slate-100 hover:bg-slate-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={changeStateToHistory}
            className={`h-10 w-28 rounded-md text-black font-semibold transition-colors duration-300 ${
              components === 'History' ? 'bg-orange-500 text-white' : 'bg-slate-100 hover:bg-slate-200'
            }`}
          >
            History
          </button>
          <button
            onClick={changeStateToCreate}
            className={`h-10 px-4 rounded-md text-black font-semibold transition-colors duration-300 ${
              components === 'Create' ? 'bg-orange-500 text-white' : 'bg-slate-100 hover:bg-slate-200'
            }`}
          >
            {getCreateButtonText()}
          </button>
        </div>

        <section className="w-full h-full overflow-scroll bg-white mt-4 p-6 rounded-lg shadow-sm">
          {displayComponent()}
        </section>
      </main>
    </section>
  );
}

export default Booking;
