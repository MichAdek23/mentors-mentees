import { useState, useEffect } from 'react';
import { Menu, X, Send, Users, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

// Mock data for connected users
const initialUsers = [
  { id: 1, name: "Jane Smith", status: "online", avatar: "/api/placeholder/40/40" },
  { id: 2, name: "John Doe", status: "online", avatar: "/api/placeholder/40/40" },
  { id: 3, name: "Sarah Parker", status: "away", avatar: "/api/placeholder/40/40" },
  { id: 4, name: "Mike Johnson", status: "offline", avatar: "/api/placeholder/40/40" },
  { id: 5, name: "Alex Wilson", status: "online", avatar: "/api/placeholder/40/40" }
];

// Mock data for messages
const initialMessages = [
  { id: 1, senderId: 1, text: "Hey there! How's everyone doing today?", timestamp: "10:30 AM" },
  { id: 2, senderId: 2, text: "I'm doing great! Just finished that project we were working on.", timestamp: "10:32 AM" },
  { id: 3, senderId: 5, text: "That's awesome John! Can you share some details about it?", timestamp: "10:33 AM" },
  { id: 4, senderId: 2, text: "Sure! I'll send you the docs later today.", timestamp: "10:35 AM" },
  { id: 5, senderId: 3, text: "Count me in too, I'd love to see what you've been working on.", timestamp: "10:38 AM" }
];

export default function Message() {
  const [messages, setMessages] = useState(initialMessages);
  const [users, setUsers] = useState(initialUsers);
  const [newMessage, setNewMessage] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  

  useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (newMessage.trim() === "") return;
    
    const newMsg = {
      id: messages.length + 1,
      senderId: 0, // Current user
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  const toggleSidebar = () => {
   
    if (window.innerWidth < 1024) {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const StatusIndicator = ({ status }) => {
    const statusColors = {
      online: "bg-green-500",
      away: "bg-yellow-500",
      offline: "bg-gray-400"
    };
    
    return (
      <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ${statusColors[status]} ring-2 ring-white`}></span>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
     
      <div 
        className={`${sidebarOpen ? 'w-64' : 'w-0'} hidden md:block lg:w-64 transition-all duration-300 bg-white dark:bg-gray-800 shadow-lg`}
        aria-label="Connected users sidebar"
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="font-semibold text-xl">Connected Users</h2>
            <button 
              onClick={toggleSidebar} 
              className="md:block lg:hidden p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto">
            <ul className="p-2">
              {users.map(user => (
                <li key={user.id} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md my-1 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img src={user.avatar} alt="" className="h-10 w-10 rounded-full" />
                      <StatusIndicator status={user.status} />
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user.status}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
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
          </div>
        </div>
      </div>

      {/* Mobile sidebar (overlay) */}
      <div 
        className={`fixed inset-0 z-50 bg-gray-600 bg-opacity-75 transition-opacity duration-300 ease-in-out ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden="true"
      ></div>

      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Mobile menu"
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="font-semibold text-xl">Connected Users</h2>
            <button 
              onClick={() => setMobileMenuOpen(false)} 
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close mobile menu"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto">
            <ul className="p-2">
              {users.map(user => (
                <li key={user.id} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md my-1 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img src={user.avatar} alt="" className="h-10 w-10 rounded-full" />
                      <StatusIndicator status={user.status} />
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user.status}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
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
              <h1 className="text-xl font-bold" id="main-title"> Mr David </h1>
            </div>
            <button 
              className="hidden md:flex lg:hidden items-center space-x-2 px-3 py-1 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-sm font-medium"
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? "Hide users" : "Show users"}
            >
              <Users size={16} />
              <span>{sidebarOpen ? "Hide Users" : "Show Users"}</span>
            </button>
          </div>
        </header>

        {/* Messages area */}
        <div 
          id="message-container"
          className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900"
          aria-label="Chat messages"
        >
          {messages.map((msg) => {
            const isCurrentUser = msg.senderId === 0;
            const sender = users.find(u => u.id === msg.senderId) || { name: "You" };
            
            return (
              <div 
                key={msg.id} 
                className={`mb-4 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs md:max-w-md lg:max-w-lg ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                  <div className="flex items-end">
                    {!isCurrentUser && (
                      <div className="flex-shrink-0 mr-2">
                        <img src={sender.avatar || "/api/placeholder/32/32"} alt="" className="h-8 w-8 rounded-full" />
                      </div>
                    )}
                    <div 
                      className={`px-4 py-2 rounded-lg ${
                        isCurrentUser 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {!isCurrentUser && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{sender.name}</p>
                      )}
                      <p>{msg.text}</p>
                    </div>
                  </div>
                  <p className={`text-xs mt-1 text-gray-500 ${isCurrentUser ? 'text-right mr-2' : 'ml-10'}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message input */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              aria-label="Type message"
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center"
              aria-label="Send message"
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