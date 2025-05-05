import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons"; // Import LinkedIn icon
import { GlobalContext } from "@/component/GlobalStore/GlobalState";

const PublicProfile = () => {
  const { userId } = useParams(); // Get the user ID from the URL
  const navigate = useNavigate(); // For navigation
  const {  setSelectedUserForSession } = useContext(GlobalContext); // Global context for layout
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null); // Track connection status

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token for authentication
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch user details");
        }

        const data = await response.json();
        setUser(data);

        // Check connection status
        const connectionResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/connections/status/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (connectionResponse.ok) {
          const connectionData = await connectionResponse.json();
          setConnectionStatus(connectionData.status);
        } else if (connectionResponse.status === 404) {
          setConnectionStatus("none"); // No connection exists
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError(err.message || "Failed to fetch user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleConnect = async () => {
    try {
      const token = localStorage.getItem("token"); // Retrieve the token from localStorage
      if (!token) {
        alert("You are not logged in. Redirecting to login page...");
        navigate("/login"); // Redirect to login page if token is missing
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/connections/send-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
          body: JSON.stringify({
            recipientId: userId, // Ensure recipientId is sent correctly
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData); // Log the error response for debugging
        throw new Error(errorData.message || "Failed to send connection request");
      }

      alert("Connection request sent successfully!");
      setConnectionStatus("pending"); // Update status to pending
    } catch (err) {
      console.error("Error sending connection request:", err);
      setError(err.message || "Failed to send connection request. Please try again.");
      setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-red-500 text-center p-4">
          <p className="text-lg font-medium">Error loading profile</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex flex-col items-center">
      {/* Header */}
      <header className="flex items-center justify-between w-full max-w-6xl mb-8">
        <button
          onClick={() => navigate(-1)} // Go back to the previous page
          className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back
        </button>
        <h1 className="text-[32px] font-medium text-gray-900 dark:text-white">
          Public Profile
        </h1>
      </header>

      {/* Profile Card */}
      <div className="w-full max-w-6xl bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row">
        {/* Left Section: Image and Interests */}
        <div className="w-full md:w-1/3 bg-gray-100 dark:bg-gray-700 p-6 flex flex-col items-center">
          <img
            src={
              user.profilePicture?.startsWith("http")
                ? user.profilePicture
                : `${import.meta.env.VITE_BACKEND_URL}${user.profilePicture || "/uploads/profiles/default-profile.png"}`
            }
            alt={`${user.firstName} ${user.lastName}`}
            className="w-full h-48 object-cover border-4 border-white shadow-md mb-4"
            onError={(e) => {
              e.currentTarget.src = `${import.meta.env.VITE_BACKEND_URL}/uploads/profiles/default-profile.png`;
            }}
          />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Interests
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {user.interests?.length > 0 ? (
              user.interests.map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 text-xs rounded-full"
                >
                  {interest}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">No interests available</p>
            )}
          </div>
        </div>

        {/* Right Section: Details */}
        <div className="w-full md:w-2/3 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {`${user.firstName} ${user.lastName}`}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 flex items-center gap-2">
            <FontAwesomeIcon icon={faEnvelope} />
            {user.email}
          </p>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Role
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {user.role}
          </p>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Bio
          </h3>
          <p
            className="text-sm text-gray-600 dark:text-gray-400 mb-6"
            style={{ whiteSpace: "pre-wrap" }} // Ensure line breaks are observed
          >
            {user.bio || "No bio available"}
          </p>

          {/* LinkedIn Link */}
          {user.linkedin && (
            <div className="mb-6">
              <a
                href={user.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faLinkedin} />
                LinkedIn Profile
              </a>
            </div>
          )}

          {/* Connection Button */}
          <div className="mt-6">
            {connectionStatus === "accepted" ? (
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => {
                    setSelectedUserForSession(user._id); // Set the selected user for session creation
                    navigate("/mentor-dashboard/booking"); // Navigate to the Booking page (ensure this route matches your App.jsx)
                  }}
                  className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Create Session
                </button>
                <button
                  onClick={() => {
                    navigate(`/mentor-dashboard/messages?userId=${user._id}`); // Redirect to Messages with the user chat open
                  }}
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Chat
                </button>
              </div>
            ) : connectionStatus === "pending" ? (
              <button
                disabled
                className="w-full bg-gray-400 text-white py-2 rounded-lg cursor-not-allowed"
              >
                Request Pending
              </button>
            ) : (
              <button
                onClick={handleConnect}
                className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Connect
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
