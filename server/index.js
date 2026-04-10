const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const paymentRoutes = require('./routes/payments');
const chatRoutes = require('./routes/chat');
const linkedinRoutes = require('./routes/linkedin');
const discoveryRoutes = require('./routes/discovery');
const smartMatchRoutes = require('./routes/smartMatch');
const skillsRoutes = require('./routes/skills');
const searchRoutes = require('./routes/search');
const reviewRoutes = require('./routes/reviews');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || [process.env.CLIENT_URL, 'http://localhost:3000', 'https://wayconnect.vercel.app'].includes(origin) || origin?.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet()); // Set security HTTP headers

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'https://wayconnect.vercel.app'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10kb' })); // Body parser, limiting data size
app.use(mongoSanitize()); // Data sanitization against NoSQL query injection

// Cloudinary/Static uploads
app.use('/uploads', express.static('uploads'));

// Rate limiting
const limiter = rateLimit({
  max: 100, // Limit each IP to 100 requests per windowMs
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/linkedin', linkedinRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/users/smart-match', smartMatchRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/reviews', reviewRoutes);

// Global Error Handler
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Socket.io for real-time chat
const connectedUsers = new Map(); // Track connected users

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-room', (userId) => {
    socket.join(userId);
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} joined room with socket ${socket.id}`);
    console.log('Connected users:', Array.from(connectedUsers.keys()));
  });
  
  socket.on('send-message', (data) => {
    console.log('Received message data:', data);
    console.log('Sender ID:', data.sender?._id);
    console.log('Receiver ID:', data.receiver?._id || data.receiver);
    
    // Ensure we have the correct receiver ID
    const receiverId = data.receiver?._id || data.receiver;
    const senderId = data.sender?._id || data.sender;
    
    if (receiverId && senderId) {
      // Broadcast to receiver's room
      console.log(`Broadcasting to receiver room: ${receiverId}`);
      socket.to(receiverId).emit('receive-message', data);
      
      // Also broadcast to sender's room for multi-device sync (but not to the same socket)
      console.log(`Broadcasting to sender room: ${senderId}`);
      socket.to(senderId).emit('receive-message', data);
      
      console.log('Message broadcasted successfully');
    } else {
      console.error('Missing sender or receiver ID in message data');
    }
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove from connected users
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});