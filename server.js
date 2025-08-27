const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Explicitly configure CORS for all Express API routes
app.use(cors({
  origin: 'https://chat-app-frontend-beta-ochre.vercel.app'
}));

app.use(express.json());

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('API is running successfully!');
});

const server = http.createServer(app);

// Explicitly configure CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: "https://chat-app-frontend-beta-ochre.vercel.app",
    methods: ["GET", "POST"],
  },
});

const usersInRooms = {};

io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  socket.on('joinRoom', (data) => {
    const { roomName, user } = data;
    socket.join(roomName);
    console.log(`User ${user.name} (${socket.id}) joined room: ${roomName}`);
    if (!usersInRooms[roomName]) {
      usersInRooms[roomName] = [];
    }
    usersInRooms[roomName].push({ id: socket.id, name: user.name });
    io.to(roomName).emit('updateUserList', usersInRooms[roomName]);
  });

  socket.on('chatMessage', (data) => {
    const { room, message, user } = data;
    io.to(room).emit('newMessage', { message, user, timestamp: new Date() });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const roomName in usersInRooms) {
      const userIndex = usersInRooms[roomName].findIndex(user => user.id === socket.id);
      if (userIndex !== -1) {
        usersInRooms[roomName].splice(userIndex, 1);
        io.to(roomName).emit('updateUserList', usersInRooms[roomName]);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port: ${PORT}`);
});