import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CreateSession = () => {
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [sessionDetails, setSessionDetails] = useState({
    recipientId: "",
    date: "",
    time: "",
    topic: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConnectedUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/connections`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch connected users");
        }

        const data = await response.json();
        setConnectedUsers(data);
        setFilteredUsers(data);
      } catch (err) {
        console.error("Error fetching connected users:", err);
        setError(err.message || "Failed to fetch connected users");
      } finally {
        setLoading(false);
      }
    };

    fetchConnectedUsers();
  }, []);

  useEffect(() => {
    const filtered = connectedUsers.filter((user) =>
      `${user.requester.firstName} ${user.requester.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      `${user.recipient.firstName} ${user.recipient.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, connectedUsers]);

  const handleCreateSession = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not logged in. Redirecting to login page...");
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/sessions/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(sessionDetails),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create session");
      }

      alert("Session created successfully!");
      navigate("/mentee-dashboard");
    } catch (err) {
      console.error("Error creating session:", err);
      setError(err.message || "Failed to create session. Please try again.");
      setTimeout(() => setError(null), 3000);
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
          <p className="text-lg font-medium">Error loading connected users</p>
          <p className="text-sm">{ error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <h1 className="text-2xl font-bold mb-6">Create a Session</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search connected users..."
          className="w-full p-3 border rounded-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Connected Users List */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Connected Users</h2>
        <ul className="space-y-4">
          {filteredUsers.map((connection) => {
            const user =
              connection.requester._id === sessionDetails.recipientId
                ? connection.recipient
                : connection.requester;

            return (
              <li
                key={user._id}
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() =>
                  setSessionDetails((prev) => ({ ...prev, recipientId: user._id }))
                }
              >
                <p className="font-medium">{`${user.firstName} ${user.lastName}`}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Session Details Form */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Date</label>
        <input
          type="date"
          className="w-full p-3 border rounded-lg"
          value={sessionDetails.date}
          onChange={(e) =>
            setSessionDetails((prev) => ({ ...prev, date: e.target.value }))
          }
        />
      </div>
      <div className="mb-6">
        <label className="block mb-2 font-medium">Time</label>
        <input
          type="time"
          className="w-full p-3 border rounded-lg"
          value={sessionDetails.time}
          onChange={(e) =>
            setSessionDetails((prev) => ({ ...prev, time: e.target.value }))
          }
        />
      </div>
      <div className="mb-6">
        <label className="block mb-2 font-medium">Topic</label>
        <input
          type="text"
          className="w-full p-3 border rounded-lg"
          value={sessionDetails.topic}
          onChange={(e) =>
            setSessionDetails((prev) => ({ ...prev, topic: e.target.value }))
          }
        />
      </div>
      <div className="mb-6">
        <label className="block mb-2 font-medium">Description</label>
        <textarea
          className="w-full p-3 border rounded-lg"
          rows="4"
          value={sessionDetails.description}
          onChange={(e) =>
            setSessionDetails((prev) => ({ ...prev, description: e.target.value }))
          }
        ></textarea>
      </div>

      {/* Create Session Button */}
      <button
        onClick={handleCreateSession}
        className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors"
      >
        Create Session
      </button>
    </div>
  );
};

export default CreateSession;