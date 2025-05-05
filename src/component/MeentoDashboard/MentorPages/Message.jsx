import React, { useState, useEffect, useRef, useContext } from 'react';
import { useAuth } from '../../../lib/AuthContext';
import { io } from 'socket.io-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPaperPlane, 
  faBars, 
  faPaperclip, 
  faSearch, 
  faEllipsisV, 
  faArrowLeft,
  faImage,
  faFile,
  faLink,
  faReply,
  faEdit,
  faTrash,
  faArchive,
  faBan,
  faCheck,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { GlobalContext } from '@/component/GlobalStore/GlobalState';
import { formatDistanceToNow } from 'date-fns';
import { useDebounce } from '../../../hooks/useDebounce';
import { useSearchParams } from 'react-router-dom'; // Import useSearchParams
import "./Message.css";

const socket = io(`${import.meta.env.VITE_API_URL}/messages`, {
  transports: ['websocket', 'polling'], // Use WebSocket and fallback to polling
  auth: {
    token: localStorage.getItem('token'), // Pass the token for authentication
  },
  withCredentials: true, // Allow credentials (cookies, etc.)
});

const Message = () => {
  const { user } = useAuth();
  const { handleToggleState, upDatePage, selectedChatUser, setSelectedChatUser } = useContext(GlobalContext);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showMessageMenu, setShowMessageMenu] = useState(null);
  const [showConversationMenu, setShowConversationMenu] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const debouncedTyping = useDebounce(isTyping, 500);
  const [searchParams] = useSearchParams(); // Get query parameters
  const userIdFromQuery = searchParams.get('userId'); // Extract userId from query

  // Helper function to get the other participant
  const getOtherParticipant = (conversation) => {
    if (!conversation?.participants) return null;
    return conversation.participants.find((p) => p?._id && p._id !== user?._id) || {
      firstName: 'Unknown',
      lastName: 'User',
      profilePicture: null,
    };
  };

  const fetchUserDetails = async (userId) => {
    if (!userId) {
      console.error('User ID is undefined. Skipping fetchUserDetails.');
      return { firstName: 'Unknown', lastName: 'User', profilePicture: null };
    }
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error fetching user details:', error);
      return { firstName: 'Unknown', lastName: 'User', profilePicture: null };
    }
  };
  
  useEffect(() => {
    const updateConversationsWithDetails = async () => {
      const updatedConversations = await Promise.all(
        conversations.map(async (conversation) => {
          const otherParticipant = getOtherParticipant(conversation);
          if (otherParticipant && (!otherParticipant.firstName || !otherParticipant.profilePicture)) {
            const userDetails = await fetchUserDetails(otherParticipant._id);
            return {
              ...conversation,
              participants: conversation.participants.map((p) =>
                p._id === otherParticipant._id ? { ...p, ...userDetails } : p
              ),
            };
          }
          return conversation;
        })
      );
      setConversations(updatedConversations);
    };
  
    if (conversations.length > 0) {
      updateConversationsWithDetails();
    }
  }, [conversations]);
  
  const renderParticipantName = (participant) => {
    return participant ? `${participant.firstName} ${participant.lastName}` : 'Unknown User';
  };
  
  const renderParticipantProfilePicture = (participant) => {
    const defaultProfilePicture = `${import.meta.env.VITE_BACKEND_URL}/uploads/profiles/default-profile.png`;
    return participant?.profilePicture
      ? participant.profilePicture.startsWith('http')
        ? participant.profilePicture
        : `${import.meta.env.VITE_BACKEND_URL}${participant.profilePicture}`
      : defaultProfilePicture;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Initialize socket connection to the /messages namespace
    socketRef.current = io(`${import.meta.env.VITE_API_URL}/messages`, {
      transports: ['websocket', 'polling'], // Use WebSocket and fallback to polling
      auth: {
        token: localStorage.getItem('token'),
      },
      withCredentials: true,
    });

    // Handle connection errors
    socketRef.current.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err.message);
      alert('Failed to connect to the messaging server. Please try again later.');
    });

    // Join the selected conversation room
    if (selectedConversation && selectedConversation._id) {
      socketRef.current.emit('joinRoom', selectedConversation._id);
    }

    // Listen for new messages
    socketRef.current.on('newMessage', (message) => {
      if (selectedConversation && message.conversationId === selectedConversation._id) {
        setMessages((prev) => [...prev, message]);
      }
    });

    // Listen for typing events
    socketRef.current.on('userTyping', ({ userId, isTyping }) => {
      if (selectedConversation && selectedConversation.participants.some((p) => p._id === userId)) {
        setTypingUsers((prev) => {
          const updated = new Set(prev);
          if (isTyping) {
            updated.add(userId);
          } else {
            updated.delete(userId);
          }
          return updated;
        });
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages();
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (debouncedTyping) {
      socketRef.current.emit('typing', {
        conversationId: selectedConversation?._id,
        isTyping: true
      });
    } else {
      socketRef.current.emit('typing', {
        conversationId: selectedConversation?._id,
        isTyping: false
      });
    }
  }, [debouncedTyping, selectedConversation]);

  // Update selectedConversation when selectedChatUser changes
  useEffect(() => {
    if (selectedChatUser) {
      const conversation = conversations.find(conv => 
        conv.participants.some(p => p._id === selectedChatUser._id)
      );
      if (conversation) {
        setSelectedConversation(conversation);
      } else {
        createConversation(selectedChatUser); // Create a new conversation if it doesn't exist
      }
    }
  }, [selectedChatUser, conversations]);

  useEffect(() => {
    // Load connected users as conversations on component mount
    const loadConversations = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/connections`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Failed to load connected users');
        }
  
        const data = await response.json();
        const connectedUsers = data.map((connection) =>
          connection.requester._id === localStorage.getItem('userId')
            ? connection.recipient
            : connection.requester
        );
  
        // Format connected users as conversations
        const formattedConversations = connectedUsers.map((user) => ({
          _id: user._id,
          participants: [user],
          lastMessage: null, // Placeholder for last message
        }));
  
        setConversations(formattedConversations);
      } catch (err) {
        console.error('Error loading connected users:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    loadConversations();
  }, []);

  useEffect(() => {
    if (userIdFromQuery && conversations.length > 0) {
      const conversation = conversations.find((conv) =>
        conv.participants.some((p) => p._id === userIdFromQuery)
      );
      if (conversation) {
        setSelectedConversation(conversation);
        setSelectedChatUser(conversation.participants.find((p) => p._id === userIdFromQuery));
      }
    }
  }, [userIdFromQuery, conversations]);

  const loadMessages = async () => {
    if (!selectedConversation || !selectedConversation._id) {
      console.error('Selected conversation or conversation ID is undefined.');
      return;
    }
  
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/messages/conversations/${selectedConversation._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
  
      if (response.status === 404) {
        console.warn('Conversation not found. Creating a new one.');
        if (!selectedChatUser || !selectedChatUser._id) {
          console.error('Selected chat user is undefined. Cannot create a new conversation.');
          return;
        }
  
        const newConversationResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/messages/conversations`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
              participantId: selectedChatUser._id, // Ensure selectedChatUser is valid
            }),
          }
        );
  
        if (!newConversationResponse.ok) {
          throw new Error('Failed to create a new conversation');
        }
  
        const newConversation = await newConversationResponse.json();
        setConversations((prev) => [...prev, newConversation]);
        setSelectedConversation(newConversation); // Set the new conversation as selected
      } else if (!response.ok) {
        throw new Error('Failed to load messages');
      } else {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      setError(err.message);
    }
  };

  const createConversation = async (participant) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          participantId: participant._id
        })
      });
      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }
      const conversation = await response.json();
      setConversations(prev => [...prev, conversation]);
      setSelectedConversation(conversation);
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError(err.message);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const formData = new FormData();
      formData.append('content', newMessage);
      formData.append('type', 'text');
      if (replyTo) {
        formData.append('replyTo', replyTo._id);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/messages/conversations/${selectedConversation._id}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setNewMessage('');
      setReplyTo(null);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
    }
  };

  const handleFileUpload = async (files) => {
    if (!selectedConversation) return;

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('attachments', file);
        formData.append('type', file.type.startsWith('image/') ? 'image' : 'file');
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/messages/conversations/${selectedConversation._id}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload files');
      }

      setShowAttachMenu(false);
    } catch (err) {
      console.error('Error uploading files:', err);
      setError(err.message);
    }
  };

  const handleEditMessage = async (messageId, newContent) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: newContent })
      });
      if (!response.ok) {
        throw new Error('Failed to edit message');
      }
      setEditingMessage(null);
    } catch (err) {
      console.error('Error editing message:', err);
      setError(err.message);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to delete message');
      }
      setShowMessageMenu(null);
    } catch (err) {
      console.error('Error deleting message:', err);
      setError(err.message);
    }
  };

  const handleArchiveConversation = async (conversationId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/messages/conversations/${conversationId}/archive`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      if (!response.ok) {
        throw new Error('Failed to archive conversation');
      }
      setShowConversationMenu(null);
      setConversations(prev => prev.filter(conv => conv._id !== conversationId));
    } catch (err) {
      console.error('Error archiving conversation:', err);
      setError(err.message);
    }
  };

  const handleBlockConversation = async (conversationId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/messages/conversations/${conversationId}/block`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      if (!response.ok) {
        throw new Error('Failed to block conversation');
      }
      setShowConversationMenu(null);
      setConversations(prev => prev.filter(conv => conv._id !== conversationId));
    } catch (err) {
      console.error('Error blocking conversation:', err);
      setError(err.message);
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    setSelectedChatUser(conversation.participants.find(p => p._id !== user._id));
    setMessages([]); // Clear messages while loading new ones
  };

  const handleBack = () => {
    setSelectedConversation(null);
    setSelectedChatUser(null);
  };

  const filteredConversations = conversations.filter(conv => {
    if (!conv?.participants) return false;
    // Find the other user (not the current user)
    const otherUser = conv.participants.find(p => p?._id !== user?._id);
    if (!otherUser?.name) return false;
    // If there's no search query, show all conversations
    if (!searchQuery) return true;
    // Search in user name
    return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
          <p className="text-lg font-medium">Error loading messages</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900">
      <header className="flex justify-between p-4 border-b dark:border-gray-700">
        <div className="flex flex-col w-full lg:flex-row justify-start items-start lg:items-center gap-4 lg:gap-0 lg:justify-between">
          <div className="flex flex-col gap-4">
            <h1 className="text-[32px] font-medium">
              {user?.role === 'mentor' ? 'Mentees' : 'Mentors'}
            </h1>
            <p className="text-base font-medium text-slate-600">
              {user?.role === 'mentor' ? 'Connect with Mentees' : 'Find a Mentor'}
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

      <div className="flex flex-col lg:flex-row h-[calc(100dvh-180px)]">
  {/* Conversations List - Mobile Behavior */}
  <div className={`w-full lg:w-1/3 border-r dark:border-gray-700 flex flex-col ${selectedConversation ? 'hidden lg:flex' : 'flex'}`}>
    {/* Search bar with larger touch targets */}
    <div className="p-3 border-b dark:border-gray-700">
      <div className="relative">
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
    </div>

    {/* Conversation list with larger touch targets */}
    <div className="flex-1 overflow-y-auto">
      {filteredConversations.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No conversations found
        </div>
      ) : (
        filteredConversations.map((conv) => {
          const otherUser = conv.participants.find(p => p._id !== user._id);
          const unreadCount = conv.unreadCounts?.[user._id] || 0;
          const isOnline = onlineUsers.has(otherUser._id);

          return (
            <div
              key={conv._id}
              onClick={() => handleConversationSelect(conv)}
              className={`flex items-center p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 ${selectedConversation?._id === conv._id ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
            >
              <div className="relative">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}&background=random`}
                  alt={otherUser.name}
                  className="w-12 h-12 rounded-full"
                />
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                )}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium truncate">{otherUser.name}</h3>
                  {conv.lastMessage && (
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: true })}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {conv.lastMessage?.content || 'No messages yet'}
                </p>
              </div>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConversationMenu(showConversationMenu === conv._id ? null : conv._id);
                  }}
                  className="p-3 text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faEllipsisV} />
                </button>
                {showConversationMenu === conv._id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchiveConversation(conv._id);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FontAwesomeIcon icon={faArchive} className="mr-2" />
                      Archive
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBlockConversation(conv._id);
                      }}
                      className="w-full px-4 py-3 text-left text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FontAwesomeIcon icon={faBan} className="mr-2" />
                      Block
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  </div>

  {/* Chat Area - Mobile Optimized */}
  <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden lg:flex' : 'flex'}`}>
    {selectedConversation ? (
      <>
        {/* Mobile-friendly Chat Header with back button */}
        <div className="p-3 border-b dark:border-gray-700 flex items-center">
          <button
            onClick={handleBack}
            className="lg:hidden mr-3 p-2 text-gray-600 hover:text-gray-800"
          >
            <FontAwesomeIcon icon={faArrowLeft} size="lg" />
          </button>
          <div className="flex items-center flex-1 min-w-0">
            <div className="relative">
              {getOtherParticipant(selectedConversation) && (
                <>
                  <img
                    src={renderParticipantProfilePicture(getOtherParticipant(selectedConversation))}
                    alt={renderParticipantName(getOtherParticipant(selectedConversation))}
                    className="w-10 h-10 rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = `${import.meta.env.VITE_BACKEND_URL}/uploads/profiles/default-profile.png`;
                    }}
                  />
                  {onlineUsers.has(getOtherParticipant(selectedConversation)?._id) && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </>
              )}
            </div>
            <div className="ml-3 min-w-0">
              <h3 className="font-medium truncate">
                {renderParticipantName(getOtherParticipant(selectedConversation))}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {onlineUsers.has(getOtherParticipant(selectedConversation)?._id)
                  ? 'Online'
                  : 'Offline'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages with larger touch areas */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${message.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`relative group max-w-[85%] lg:max-w-[70%] ${message.sender._id === user._id ? 'ml-auto' : 'mr-auto'}`}>
                <div
                  className={`rounded-lg p-3 ${message.sender._id === user._id ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                >
                  {message.replyTo && (
                    <div className="text-xs opacity-70 mb-1 border-l-2 pl-2">
                      <p className="font-medium truncate">
                        {message.replyTo.sender._id === user._id ? 'You' : message.replyTo.sender.name}
                      </p>
                      <p className="truncate">{message.replyTo.content}</p>
                    </div>
                  )}
                  {editingMessage === message._id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={message.content}
                        onChange={(e) => handleEditMessage(message._id, e.target.value)}
                        className="flex-1 bg-transparent border-b focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => setEditingMessage(null)}
                        className="text-xs hover:text-gray-300 p-1"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm break-words">{message.content}</p>
                      {message.attachments?.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <FontAwesomeIcon
                                icon={
                                  attachment.type.startsWith('image/')
                                    ? faImage
                                    : attachment.type === 'application/pdf'
                                    ? faFile
                                    : faLink
                                }
                              />
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs underline truncate"
                              >
                                {attachment.name}
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs opacity-70">
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {message.sender._id === user._id && (
                          <div className="flex items-center gap-1">
                            {message.read && (
                              <span className="text-xs">
                                <FontAwesomeIcon icon={faCheck} />
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowMessageMenu(showMessageMenu === message._id ? null : message._id);
                              }}
                              className="opacity-70 group-hover:opacity-100 transition-opacity p-1"
                            >
                              <FontAwesomeIcon icon={faEllipsisV} className="text-xs" />
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
                {showMessageMenu === message._id && (
                  <div className={`absolute mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 ${message.sender._id === user._id ? 'right-0' : 'left-0'}`}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setReplyTo(message);
                        setShowMessageMenu(null);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FontAwesomeIcon icon={faReply} className="mr-2" />
                      Reply
                    </button>
                    {message.sender._id === user._id && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingMessage(message._id);
                            setShowMessageMenu(null);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <FontAwesomeIcon icon={faEdit} className="mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMessage(message._id);
                          }}
                          className="w-full px-4 py-3 text-left text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <FontAwesomeIcon icon={faTrash} className="mr-2" />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Indicator */}
        {typingUsers.size > 0 && (
          <div className="px-4 py-2 text-sm text-gray-500">
            {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
          </div>
        )}

        {/* Mobile-optimized Message Input */}
        <form onSubmit={sendMessage} className="p-3 border-t dark:border-gray-700">
          {replyTo && (
            <div className="flex items-center justify-between mb-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FontAwesomeIcon icon={faReply} className="text-xs" />
                <span className="text-sm truncate">
                  Replying to {replyTo.sender._id === user._id ? 'yourself' : replyTo.sender.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FontAwesomeIcon icon={faPaperclip} />
              </button>
              {showAttachMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10">
                  <label className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => handleFileUpload(e.target.files)}
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      className="hidden"
                    />
                    <FontAwesomeIcon icon={faImage} className="mr-2" />
                    Image
                  </label>
                  <label className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => handleFileUpload(e.target.files)}
                      multiple
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                    />
                    <FontAwesomeIcon icon={faFile} className="mr-2" />
                    Document
                  </label>
                </div>
              )}
            </div>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                setIsTyping(true);
              }}
              onBlur={() => setIsTyping(false)}
              placeholder="Type a message..."
              className="flex-1 p-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="submit"
              className="p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        </form>
      </>
    ) : (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-4 p-4">
        <p className="text-lg text-center">No conversation selected</p>
        <p className="text-sm text-center">
          Visit the{' '}
          <button
            onClick={() => upDatePage('Explore')}
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            Explore page
          </button>{' '}
          to find and chat with {user?.role === 'mentor' ? 'mentees' : 'mentors'}
        </p>
      </div>
    )}
  </div>
     </div>
    </div>
  );
};

export default Message;


