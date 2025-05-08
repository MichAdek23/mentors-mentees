import React, { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faSearch } from "@fortawesome/free-solid-svg-icons";
import { GlobalContext } from "@/component/GlobalStore/GlobalState";
import PublicProfile from "./PublicProfile"; // Import PublicProfile component
import { useNavigate } from "react-router-dom"; // Import useNavigate

function Explore() {
  // Corrected useContext usage and added setSelectedUserForSession
  const { upDatePage, handleToggleState, setSelectedUserForSession } = useContext(GlobalContext); 
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [connectionStatuses, setConnectionStatuses] = useState({});
  const [selectedUser, setSelectedUser] = useState(null); // State to track selected user for public profile
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Ensure profileImage is selected in the backend route for /users
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data);

        // Fetch connection statuses for all users
        const statuses = {};
        for (const user of data) {
           // Add a check for user._id existence before fetching status
           if (user._id) {
              const statusResponse = await fetch(
                `${import.meta.env.VITE_API_URL}/connections/status/${user._id}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );

              if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                statuses[user._id] = statusData.status;
              } else {
                statuses[user._id] = "none"; // Default to no connection on error
              }
           } else {
               console.warn('Skipping user with missing _id:', user);
           }
        }
        setConnectionStatuses(statuses);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleConnect = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not logged in. Redirecting to login page...");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/connections/send-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            recipientId: userId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send connection request");
      }

      alert("Connection request sent successfully!");
      setConnectionStatuses((prev) => ({ ...prev, [userId]: "pending" }));
    } catch (err) {
      console.error("Error sending connection request:", err);
      setError(err.message || "Failed to send connection request. Please try again.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleViewProfile = (userId) => {
    navigate(`/public-profile/${userId}`); // Navigate to PublicProfile with userId in the URL
  };

  // Added handler for the "Connected" button
  const handleConnectedClick = (userId) => {
      // You can add logic here to show a chat option or directly go to session creation
      // For now, let's set the selected user for session creation and navigate to Booking
      setSelectedUserForSession(userId);
      upDatePage('Booking', 'Create'); // Assuming upDatePage can handle navigating to the 'Create' component in Booking
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
          <p className="text-lg font-medium">Error loading users</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter((user) => {
     // Add a check for user and user._id existence before filtering
     if (!user || !user._id) {
         return false;
     }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        user.firstName?.toLowerCase().includes(query) || // Use optional chaining
        user.lastName?.toLowerCase().includes(query) ||  // Use optional chaining
        user.email?.toLowerCase().includes(query) ||    // Use optional chaining
        user.role?.toLowerCase().includes(query)       // Use optional chaining
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      {/* Header */}
      <header className="flex justify-between mb-8">
        <div className="flex flex-col w-full lg:flex-row justify-start items-start lg:items-center gap-4 lg:gap-0 lg:justify-between">
          <div className="flex flex-col gap-4">
            <h1 className="text-[16px] md:text-[32px] font-medium">
              Connect with Mentors and Mentees
            </h1>
            <p className="text-base font-medium text-slate-600">
              Life-changing encounters for everyone
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <img
              onClick={() => upDatePage("Message")}
              src="/image/messageIcon.png"
              className="md:w-12 h-9 md:h-12 cursor-pointer"
              alt="Message Icon"
              loading="lazy"
            />
            <img
              onClick={() => upDatePage("Setting")}
              src="/image/settingIcon.png"
              className="md:w-12 h-9 md:h-12 cursor-pointer"
              alt="Setting Icon"
              loading="lazy"
            />
          </div>
        </div>

        <div onClick={handleToggleState} className="block lg:hidden mt-3">
          <button aria-label="Toggle menu">
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
      </header>

      {/* Public Profile View */}
      {selectedUser ? (
        <div className="mb-8">
          <button
            onClick={() => setSelectedUser(null)} // Close the public profile view
            className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white mb-4"
          >
            Back to Explore
          </button>
          <PublicProfile userId={selectedUser} /> {/* Render PublicProfile component */}
        </div>
      ) : (
        <>
          {/* Search Section */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by name, email, or expertise..."
                className="w-full pl-12 pr-4 py-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* User Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUsers.map((user) => (
               // Add a check for user and user._id before rendering each grid item
              <div
                key={user._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transform hover:-translate-y-2 transition-all duration-300"
              >
                {/* User Image */}
                <div className="relative h-48">
                  <img
                    src={user.profileImage || "/uploads/profiles/default-profile.png"} // Simplified src
                    alt={`${user.firstName || 'User'}'s avatar`} // Corrected alt text
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/uploads/profiles/default-profile.png"; // Simplified fallback src
                    }}
                  />
                </div>

                {/* User Info */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {`${user.firstName?.toUpperCase() || ''} ${user.lastName?.toUpperCase() || ''}`} {/* Converted names to uppercase with optional chaining */}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Role: {user.role || "N/A"}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {user.interests?.map((interest, index) => (
                       // Add check for interest validity
                       interest && (
                           <span
                             key={index}
                             className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 text-xs rounded-full"
                           >
                             {interest}
                           </span>
                       )
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleViewProfile(user._id)} // Pass user._id to navigate
                      className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      View Profile
                    </button>
                    {connectionStatuses[user._id] === "accepted" ? (
                      <button
                        onClick={() => handleConnectedClick(user._id)} // Call the new handler
                        className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        Connected
                      </button>
                    ) : connectionStatuses[user._id] === "pending" ? (
                      <button
                        disabled
                        className="w-full bg-gray-400 text-white py-2 rounded-lg cursor-not-allowed"
                      >
                        Request Pending
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(user._id)} // Pass user._id to handleConnect
                        className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Explore;