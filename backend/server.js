import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import initializeSocket from './socket.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { promises as fs } from 'fs';

// Import routes
import userRoutes from './routes/users.js';
import messageRoutes from './routes/messages.js';
import sessionRoutes from './routes/sessions.js';
import profileRoutes from './routes/profile.js';
import resourcesRouter from './routes/resources.js';
import progressRouter from './routes/progress.js';
import conversationsRouter from './routes/conversations.js';
import paymentRoutes from './routes/payments.js';
import emailVerificationRoutes from './routes/emailVerificationRoutes.js';
import authRoutes from './routes/auth.js';
import connectionRoutes from './routes/connections.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Add this middleware to parse JSON request bodies
app.use(express.json());

// Initialize socket.io
const io = initializeSocket(httpServer);
app.set('io', io);

// Middleware
const allowedOrigins = [
  'https://leap-on-ng.vercel.app',
  'https://leap-on-ng.onrender.com',
  'https://leapon.com.ng' 
];

app.use(cors({
  origin: process.env.FRONTEND_URL, // Allow requests from the frontend URL
  credentials: true, // Allow cookies and credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Authorization', 'Content-Type']
}));

// WebSocket configuration
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinRoom', (roomId) => {
    console.log(`User ${socket.id} joined room: ${roomId}`);
    socket.join(roomId);
  });

  socket.on('sendMessage', (message) => {
    console.log('Message received:', message);
    io.emit('receiveMessage', message); // Broadcast the message to all connected clients
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Add a namespace for messaging
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

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/image', express.static(path.join(__dirname, 'public', 'image')));

// Create uploads directory if it doesn't exist
try {
  await fs.mkdir(path.join(__dirname, 'uploads', 'profiles'), { recursive: true });
  await fs.mkdir(path.join(__dirname, 'public', 'image', 'mentors'), { recursive: true });
} catch (err) {
  console.error('Error creating directories:', err);
}

// Database connection
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://Michadek23:Michadek23@leap-on-shard-00-00.6hskc.mongodb.net:27017,leap-on-shard-00-01.6hskc.mongodb.net:27017,leap-on-shard-00-02.6hskc.mongodb.net:27017/?replicaSet=atlas-11k2m6-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Leap-ON', {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      w: 'majority',
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
      retryReads: true,
      autoIndex: true,
      autoCreate: true
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
      console.error('MongoDB connection error stack:', err.stack);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
      setTimeout(connectDB, 5000);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected');
    });

  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.error('MongoDB connection error stack:', err.stack);
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Leap-ON Mentorship Program API' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/resources', resourcesRouter);
app.use('/api/progress', progressRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/payments', paymentRoutes);
app.use('/api/emailVerification', emailVerificationRoutes);
app.use('/api/connections', connectionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: err.message
  });
  next();
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});