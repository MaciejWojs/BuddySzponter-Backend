import { Server } from "socket.io"
import { Server as Engine } from "@socket.io/bun-engine"

let io: Server
let engine: Engine

export function initSocket() {
  if (io) return { io, engine }

  io = new Server()
  engine = new Engine()

  io.bind(engine)

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id)
    
    socket.on('message', (message) => {
       console.log('Received message:', message);
       socket.send('Message received: ' + message);
     });
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id)
    })
  })


  return { io, engine }
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.IO not initialized")
  }
  return io
}

export function getEngine() {
  if (!engine) {
    throw new Error("Engine not initialized")
  }
  return engine
}