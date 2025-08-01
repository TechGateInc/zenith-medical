/**
 * Custom Next.js server with WebSocket support
 * This allows us to run Socket.IO alongside Next.js
 */

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// Initialize Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Initialize WebSocket server
  const { Server: SocketIOServer } = require('socket.io')
  const io = new SocketIOServer(server, {
    path: '/api/socket',
    cors: {
      origin: dev ? 'http://localhost:3000' : false,
      methods: ['GET', 'POST']
    }
  })

  // Import and initialize WebSocket handlers
  try {
    const { initializeWebSocketHandlers } = require('./websocket-handlers.js')
    initializeWebSocketHandlers(io)
    console.log('✅ WebSocket server initialized with handlers')
  } catch (error) {
    console.warn('⚠️ WebSocket handlers not found, basic WebSocket server running:', error.message)
  }

  server
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`🚀 Server ready at http://${hostname}:${port}`)
      console.log('📡 WebSocket server ready at ws://localhost:3000/api/socket')
      console.log('💬 Chat system with real-time updates enabled')
    })
})