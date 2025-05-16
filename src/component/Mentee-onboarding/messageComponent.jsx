import React, { useState, useEffect, useContext } from 'react';
import { Menu, X, Send, Users, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { GlobalContext } from "@/component/GlobalStore/GlobalState";

function Message() {
  const { profile } = useContext(GlobalContext); // Removed unused context values
  const [connectedUsers, setConnectedUsers] = useState([]); // State to hold connected users
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingConnectedUsers, setLoadingConnectedUsers] = useState(true); // Loading state for connected users
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userId = profile?._id; // Get current user's ID from context profile

  // Fetch connected users on component mount
  useEffect(() => {
    const fetchConnectedUsers = async () => {
      if (!userId) return; // Don't fetch if user ID is not available
      setLoadingConnectedUsers(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/connections`, { // Use the connections route
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch connected users");
        }

        const data = await response.json();
        setConnectedUsers(data); // Set the list of connected users

      } catch (err) {
        console.error("Error fetching connected users:", err);
        setError(err.message || "Failed to fetch connected users");
      } finally {
        setLoadingConnectedUsers(false);
      }
    };

    fetchConnectedUsers();
  }, [userId]); // Refetch when userId changes

  // Effect to automatically select the first conversation/user or handle initial state
  // Removed this useEffect to wait for user click to select a conversation

  // Fetch messages when a conversation is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) {
         setMessages([]); // Clear messages if no conversation is selected
         return;
      }
      setLoadingMessages(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/messages/conversations/${selectedConversation._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch messages");
        }

        const data = await response.json();
        // Ensure data.messages is an array before setting messages
        if (Array.isArray(data.messages)) {
            setMessages(data.messages);
        } else {
            console.error("API did not return an array for messages:", data);
            setMessages([]); // Set to empty array if unexpected format
        }

      } catch (err) {
        console.error("Error fetching messages:", err);
        setError(err.message || "Failed to fetch messages");
        setMessages([]); // Clear messages on error
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedConversation]); // Refetch messages when selectedConversation changes

  useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      // Scroll to the bottom after messages are loaded or a new message is sent
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (newMessage.trim() === "" || !selectedConversation) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/messages/conversations/${selectedConversation._id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: newMessage }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send message");
      }

      const sentMessage = await response.json();
      // Add the newly sent message to the messages list
      setMessages((prevMessages) => [...prevMessages, sentMessage]);
      setNewMessage("");

    } catch (err) {
      console.error("Error sending message:", err);
      setError(err.message || "Failed to send message. Please try again.");
      setTimeout(() => setError(null), 3000);
    }
  };

    const handleUserClick = async (user) => {
        if (!userId) return; // Ensure current user ID is available
        setMessages([]); // Clear messages from previous chat
        setSelectedConversation(null); // Clear selected conversation temporarily
        setLoadingMessages(true); // Indicate loading for messages
        setError(null); // Clear any previous errors

        try {
             const token = localStorage.getItem("token");
             // Use the POST /messages/conversations route to get or create a conversation
             const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/conversations`, {
                 method: 'POST',
                 headers: {
                     'Content-Type': 'application/json',
                     Authorization: `Bearer ${token}`,
                 },
                 body: JSON.stringify({ participantId: user._id }),
             });

             if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || 'Failed to get or create conversation');
             }

             const conversation = await response.json();
             setSelectedConversation(conversation); // Set the fetched or created conversation
             // Messages will be fetched by the useEffect triggered by selectedConversation change

             if (window.innerWidth < 1024) {
                setMobileMenuOpen(false); // Close mobile sidebar after selecting user
             }

        } catch (err) {
             console.error('Error getting or creating conversation:', err);
             setError(err.message || 'Failed to load chat. Please try again.');
             setLoadingMessages(false); // Stop loading on error
        }
    };

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
       setSidebarOpen(!sidebarOpen);
    }
  };

  const StatusIndicator = ({ status }) => {
    // Assuming status is available in user object if needed
    // For now, we'll render a placeholder or derive from activity if possible
    return (
      <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full bg-gray-400 ring-2 ring-white`}></span>
    );
  };

  // Find the other participant in the selected conversation
  const getOtherParticipant = (conversation, currentUserId) => {
    if (!currentUserId || !conversation || !conversation.participants) return null;
    // Find the participant whose ID does not match the current user's ID
    const other = conversation.participants.find(p => p && p._id && p._id !== currentUserId);
    return other;
  };


  // Find the selected chat user from the connectedUsers list using the selected conversation
  useEffect(() => {
    if (selectedConversation && connectedUsers.length > 0) {
      const otherParticipant = getOtherParticipant(selectedConversation, userId);
      if (otherParticipant) {
        // Find the full user object from connectedUsers
        const chatUser = connectedUsers.find(user => user._id === otherParticipant._id);
        // We don't need a separate state for selectedChatUser, can derive it
        // But keeping it for clarity or if needed elsewhere
        // setSelectedChatUser(chatUser); // This line is not needed if we derive it in render
      }
    }
  }, [selectedConversation, connectedUsers, userId]);

   // Derive selectedChatUser from selectedConversation and connectedUsers for rendering
  const selectedChatUser = selectedConversation
    ? getOtherParticipant(selectedConversation, userId)
    : null;


  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">

      {/* Desktop Sidebar */}
      <div
        className={`${sidebarOpen ? 'w-64' : 'w-0'} hidden md:block lg:w-64 transition-all duration-300 bg-white dark:bg-gray-800 shadow-lg overflow-x-hidden`}
        aria-label="Connected users sidebar"
      >
         {sidebarOpen && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="font-semibold text-xl">Connected Users</h2> {/* Changed title */}
              <button
                onClick={toggleSidebar}
                className="md:block lg:hidden p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                <ChevronLeft size={20} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto">
              {loadingConnectedUsers ? (
                <div className="p-4">Loading connected users...</div> 
              ) : error ? (
                 <div className="p-4 text-red-500">Error: {error}</div>
              ) : connectedUsers.length === 0 ? (
                 <div className="p-4">No connected users found.</div> 
              ) : (
                <ul className="p-2">
                  {connectedUsers.map(user => ( // Map over connectedUsers
                      <li
                        key={user._id}
                        className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md my-1 cursor-pointer ${selectedChatUser?._id === user._id ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                        onClick={() => handleUserClick(user)} // Call new handler
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <img
                              src={user.profilePicture || "/uploads/profiles/default-profile.png"}
                              alt={`${user.firstName || 'User'}'s avatar`}
                              className="h-10 w-10 rounded-full"
                            />
                            {/* Status Indicator (if status is available) */}
                            {/* <StatusIndicator status={user.status} /> */}
                          </div>
                          <div>
                            <p className="font-medium">{`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User'}</p>
                            {/* Optionally display last message preview or status if available from /connections route */}
                            {/* <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user.lastMessage?.content || 'Connected'}</p> */}
                          </div>
                        </div>
                      </li>
                    ))
                  }
                </ul>
              )}
            </div>

            {/* Settings/Logout - Keep if needed, or remove */}
            {/* <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <button className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Settings">
                  <Settings size={20} />
                  <span>Settings</span>
                </button>
                <button className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500" aria-label="Sign out">
                  <LogOut size={20} />
                  <span>Sign out</span>
                </button>
              </div>
            </div> */}
          </div>
         )}
      </div>

      {/* Mobile sidebar (overlay) */}
      <div
        className={`fixed inset-0 z-50 bg-gray-600 bg-opacity-75 transition-opacity duration-300 ease-in-out ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden="true"
        onClick={() => setMobileMenuOpen(false)} // Close sidebar on overlay click
      ></div>

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Mobile menu"
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="font-semibold text-xl">Connected Users</h2> {/* Changed title */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close mobile menu"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto">
             {loadingConnectedUsers ? (
                <div className="p-4">Loading connected users...</div> 
              ) : error ? (
                 <div className="p-4 text-red-500">Error: {error}</div>
              ) : connectedUsers.length === 0 ? (
                 <div className="p-4">No connected users found.</div>
              ) : (
            <ul className="p-2">
              {connectedUsers.map(user => (
                <li
                  key={user._id}
                  className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md my-1 cursor-pointer ${selectedChatUser?._id === user._id ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                  onClick={() => {handleUserClick(user);}}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                         src={user.profilePicture || "/uploads/profiles/default-profile.png"}
                         alt={`${user.firstName || 'User'}'s avatar`}
                        className="h-10 w-10 rounded-full"
                      />
                      {/* Status Indicator (if status is available) */}
                      {/* <StatusIndicator status={user.status} /> */}
                    </div>
                    <div>
                      <p className="font-medium">{`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User'}</p>
                      {/* Optionally display last message preview or status if available from /connections route */}
                      {/* <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user.lastMessage?.content || 'Connected'}</p> */}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            )}
          </div>

        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                aria-label="Open mobile menu"
              >
                <Menu size={20} />
              </button>
              {selectedChatUser ? (
                 <h1 className="text-xl font-bold" id="main-title">{`${selectedChatUser.firstName || ''} ${selectedChatUser.lastName || ''}`.trim() || 'Select a connected user'}</h1> 
              ) : (
                 <h1 className="text-xl font-bold" id="main-title">Select a connected user</h1> 
              )}
            </div>
            <button
              className="hidden md:flex lg:hidden items-center space-x-2 px-3 py-1 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-sm font-medium"
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? "Hide users" : "Show users"}
            >
              <Users size={16} />
              <span>{sidebarOpen ? "Hide Users" : "Show Users"}</span> {/* Updated text */}
            </button>
             <button
              className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-sm font-medium"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? "Hide conversations" : "Show conversations"}
            >
               {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />} 
              <span>{sidebarOpen ? "Hide Users" : "Show Users"}</span> {/* Updated text */}
            </button>
          </div>
        </header>

        {/* Messages area */}
        <div
          id="message-container"
          className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900"
          aria-label="Chat messages"
        >
          {!selectedConversation && !loadingMessages ? (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              Select a connected user from the sidebar to start chatting.
            </div>
          ) : loadingMessages ? (
             <div className="flex items-center justify-center h-full">Loading messages...</div>
          ) : error ? (
             <div className="flex items-center justify-center h-full text-red-500">Error loading messages: {error}</div>
          ) : messages.length === 0 ? (
            selectedChatUser && (
             <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                No messages yet with {`${selectedChatUser.firstName || ''} ${selectedChatUser.lastName || ''}`.trim() || 'this user'}. Start the conversation!
             </div>
            )
          ) : (
            messages.map((msg) => {
              const isCurrentUser = msg.sender === userId;
              // Find the correct sender object from either profile (current user) or connectedUsers (other user)
              const sender = isCurrentUser ? profile : connectedUsers.find(user => user._id === msg.sender);

              // Add a check for sender before accessing properties
              if (!sender) {
                 console.error("Sender not found for message:", msg);
                 return null; // Skip rendering this message if sender is not found
              }

              return (
                <div
                  key={msg._id} // Use message _id for key
                  className={`mb-4 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs md:max-w-md lg:max-w-lg ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                    <div className="flex items-end">
                      {!isCurrentUser && ( // Only show avatar for the other user
                        <div className="flex-shrink-0 mr-2">
                          <img
                             src={sender?.profilePicture || "/uploads/profiles/default-profile.png"} // Use optional chaining
                            alt={`${sender?.firstName || 'User'}'s avatar`}
                            className="h-8 w-8 rounded-full"
                          />
                        </div>
                      )}
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          isCurrentUser
                            ? 'bg-blue-500 text-white' 
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {/* Only show sender name if not current user */}
                        {!isCurrentUser && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                            {`${sender?.firstName || ''} ${sender?.lastName || ''}`.trim() || 'Unknown User'}
                          </p>
                        )}
                        <p>{msg.content}</p>
                      </div>
                    </div>
                    <p className={`text-xs mt-1 text-gray-500 ${isCurrentUser ? 'text-right mr-2' : 'ml-10'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {/* Use createdAt */} 
                    </p>
                  </div>
                </div>
              );
            })
          )}
           {!selectedConversation && !loadingConnectedUsers && connectedUsers.length > 0 && ( // Message when no conversation selected but users exist
               <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                 Select a connected user from the sidebar to start chatting.
              </div>
           )}
        </div>

        {/* Message input */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder={selectedConversation ? "Type a message..." : "Select a connected user to type"}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              aria-label="Type message"
              disabled={!selectedConversation} // Disable input if no conversation is selected
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
              disabled={!selectedConversation || newMessage.trim() === ""}
            >
              <Send size={18} />
              <span className="ml-2 hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Message;