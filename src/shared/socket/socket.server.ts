import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { socketAuthMiddleware, AuthenticatedSocket } from "./socket.middleware";
import { Rooms } from "./socket.rooms";

let io: Server;

export function initSocket(server: HttpServer): Server {
  io = new Server(server, { cors: { origin: "*" } });
  io.use(socketAuthMiddleware);

  io.on("connection", (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    if (authSocket.user) {
      const { userId, role } = authSocket.user;
      socket.join(Rooms.role(role));
      socket.join(Rooms.user(userId));
    }
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}