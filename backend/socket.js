import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Conversation from './models/Conversation.js';

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URLS || 'https://leap-on-ng.vercel.app', 
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['Authorization', 'Content-Type'],
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Define the /messages namespace
  const messageNamespace = io.of('/messages');

  // Middleware for authentication in the /messages namespace
  messageNamespace.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication token is required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.error('Socket authentication error:', err.message);
      next(new Error('Authentication error'));
    }
  });

  // Handle connections in the /messages namespace
  messageNamespace.on('connection', (socket) => {
    console.log(`User connected to /messages namespace: ${socket.user._id}`);

    // Join the user's room
    socket.join(socket.user._id.toString());

    // Handle typing events
    socket.on('typing', (data) => {
      const { conversationId, isTyping } = data;
      socket.to(conversationId).emit('userTyping', {
        userId: socket.user._id,
        isTyping,
      });
    });

    // Handle joining a conversation room
    socket.on('joinRoom', (roomId) => {
      console.log(`User ${socket.user._id} joined room: ${roomId}`);
      socket.join(roomId);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected from /messages namespace: ${socket.user._id}`);
    });
  });

  return io;
};

export default initializeSocket;