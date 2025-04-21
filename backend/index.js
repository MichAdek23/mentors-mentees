import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import usersRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';

dotenv.config();

const app = express();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from the frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  credentials: true, // Allow cookies and credentials
}));
app.use(express.json());

// Routes
app.use('/api/users', usersRoutes);
app.use('/api/auth', authRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Allow requests from the frontend
    methods: ['GET', 'POST'],
    credentials: true, // Allow cookies and credentials
  },
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a specific namespace or room for messaging
  socket.on('joinRoom', (roomId) => {
    console.log(`User ${socket.id} joined room: ${roomId}`);
    socket.join(roomId);
  });

  socket.on('setOnlineStatus', (isOnline) => {
    console.log(`User ${socket.id} is ${isOnline ? 'online' : 'offline'}`);
  });

  socket.on('sendMessage', (message) => {
    console.log('Message received:', message);
    io.emit('receiveMessage', message); // Broadcast the message to all connected clients
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Add a namespace for messaging if needed
const messageNamespace = io.of('/messages');
messageNamespace.on('connection', (socket) => {
  console.log('A user connected to the messages namespace:', socket.id);

  socket.on('joinRoom', (roomId) => {
    console.log(`User ${socket.id} joined room: ${roomId}`);
    socket.join(roomId);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected from the messages namespace:', socket.id);
  });
});

app.set('io', io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});