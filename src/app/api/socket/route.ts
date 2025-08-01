import { NextRequest } from 'next/server'

// Note: WebSocket logic is handled in websocket-handlers.js file
// This API route is just for documentation purposes

// Simple API route to indicate WebSocket endpoint
export async function GET(request: NextRequest) {
  return new Response('WebSocket endpoint - use Socket.IO client to connect to /api/socket', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  })
}

export async function POST(request: NextRequest) {
  return new Response('WebSocket endpoint - use Socket.IO client to connect to /api/socket', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  })
}