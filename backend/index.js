"use strict"
const upload = require("express-fileupload")
require("dotenv").config()
const express = require("express")
const cors = require("cors")
const http = require("http")
const socketIo = require("socket.io")
const connectDB = require("./config/dbConfig")
const Router = require("./routes/index")
const subscriptionController = require("./controllers/subscription.controller") // Import webhook handler
require("./trialCheckCron") // or the correct path
require("./trialEmailCron") // Initialize trial email cron job
const { registerDeepgramSocket } = require("./sockets/deepgram.socket")
const { registerClaudeSocket } = require("./sockets/claude.socket")

const app = express()

// allow origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://staging.robo-apply.com",
  "https://staging.roboapply.co",
  "https://app.roboapply.co",
  "https://app.roboapply.co/ai",
  "https://staging.robo-apply.com/ai"
]

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}

app.use(cors(corsOptions))

// ✅ This ensures preflight requests respond correctly
app.options("*", cors(corsOptions))

// Create HTTP server and Socket.IO
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
})

// Removde the stripe webhook route from here, it's moved to stripe.route.js
// app.post(
//   "/api/handleWebhook",
//   express.raw({ type: "application/json" }),
//   subscriptionController.handleWebhook
// )

app.post("/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  subscriptionController.handleWebhook
);

// increase the size of the request body
app.use(express.json({ limit: "50mb" })) // ✅ Regular JSON parsing for other routes
app.use(upload())
app.use("/api", Router)

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id)

  // Handle user joining a room
  socket.on('join', (userId) => {
    socket.join(userId)
    console.log(`User ${socket.id} joined room ${userId}`)
  })

  // Handle user disconnecting
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id)
  })

  // Example: Handle custom events
  socket.on('message', (data) => {
    console.log('Received message:', data)
    // Broadcast to all connected clients
    socket.broadcast.emit('message', data)
  })
})

const port = process.env.PORT || 3001
const env = process.env.NODE_ENV

const startServer = async () => {
  try {
    await connectDB()
    console.log(`Running in ${env} mode`)
    server.listen(port, (err) => {
      if (err) console.error("Error starting server:", err)
      console.log(`Server is running on port ${port}`)
      console.log(`Socket.IO is ready and listening for connections`)
    })
  } catch (err) {
    console.error("Failed to start server", err)
  }
}

// Register sockets
registerDeepgramSocket(io)
registerClaudeSocket(io)

startServer()
