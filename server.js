// 1. Import Dependencies
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http'); // <-- Import http
const { Server } = require('socket.io'); // <-- Import Server from socket.io
const connectDB = require('./config/db');

// 2. Configure Environment Variables
dotenv.config();

// 3. Connect to Database
connectDB();

// 4. Create Express App
const app = express();

// 5. Apply Middleware
app.use(cors());
app.use(express.json());

// 6. Mount API Routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// 7. Define a Basic Route
app.get('/', (req, res) => {
  res.send('API is running successfully!');
});

// 8. Setup for Socket.IO
const server = http.createServer(app); // Create an HTTP server from our Express app
const io = new Server(server, {
  // Configure CORS for Socket.IO to allow our front-end to connect
  cors: {
    origin: "http://localhost:5173", // The URL of your React app
    methods: ["GET", "POST"],
  },
});


// =================================================================
// ============== SOCKET.IO LOGIC STARTS HERE ======================
// =================================================================

// An in-memory object to track users in rooms. 
// For a production app, you might use a database like Redis for this.
const usersInRooms = {};

// This runs whenever a client connects to our server
io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Event listener for when a user joins a room
  socket.on('joinRoom', (data) => {
    const { roomName, user } = data;
    socket.join(roomName);
    console.log(`User ${user.name} (${socket.id}) joined room: ${roomName}`);

    // Add user to our tracking object
    if (!usersInRooms[roomName]) {
      usersInRooms[roomName] = [];
    }
    usersInRooms[roomName].push({ id: socket.id, name: user.name });

    // Broadcast the updated user list to everyone in the room
    io.to(roomName).emit('updateUserList', usersInRooms[roomName]);
  });

  // Event listener for when a user sends a message
  socket.on('chatMessage', (data) => {
    const { room, message, user } = data;
    io.to(room).emit('newMessage', {
      message,
      user,
      timestamp: new Date()
    });
  });

  // This runs when a client disconnects
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Find which room the user was in and remove them
    for (const roomName in usersInRooms) {
      const userIndex = usersInRooms[roomName].findIndex(user => user.id === socket.id);
      
      if (userIndex !== -1) {
        usersInRooms[roomName].splice(userIndex, 1);
        // Broadcast the updated user list to the remaining users in the room
        io.to(roomName).emit('updateUserList', usersInRooms[roomName]);
        break; // Assume user is only in one room
      }
    }
  });
});


// =================================================================
// =============== SOCKET.IO LOGIC ENDS HERE =======================
// =================================================================


// 9. Start the Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});