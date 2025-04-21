import React, { useState, useEffect } from "react";

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
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
          throw new Error(errorData.message || "Failed to fetch requests");
        }

        const data = await response.json();
        setRequests(data);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError(err.message || "Failed to fetch requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleAccept = async (requestId) => {
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

      alert("Request accepted successfully!");
      setRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (err) {
      console.error("Error accepting request:", err);
      setError(err.message || "Failed to accept request. Please try again.");
    }
  };

  const handleReject = async (requestId) => {
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

      alert("Request rejected successfully!");
      setRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (err) {
      console.error("Error rejecting request:", err);
      setError(err.message || "Failed to reject request. Please try again.");
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
          <p className="text-lg font-medium">Error loading requests</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <h1 className="text-2xl font-bold mb-6">Pending Requests</h1>
      {requests.length === 0 ? (
        <p className="text-gray-600">No pending requests at the moment.</p>
      ) : (
        <ul className="space-y-4">
          {requests.map((request) => (
            <li
              key={request._id}
              className="p-4 border rounded-lg bg-white dark:bg-gray-800"
            >
              <p className="font-medium">
                {`${request.requester.firstName} ${request.requester.lastName}`} wants to connect with you.
              </p>
              <p className="text-sm text-gray-600">{request.requester.email}</p>
              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => handleAccept(request._id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleReject(request._id)}
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
  );
};

export default Requests;
