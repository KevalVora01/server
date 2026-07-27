import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void) {
  const token = socket.handshake.auth?.token;
  console.log("🔍 Socket auth attempt, token present:", !!token);

  if (!token) {
    return next(new Error("No token provided"));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET!) as {
      userId: number;
      role: string;
    };
    console.log("✅ Token verified:", decoded);
    (socket as any).user = decoded;
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err);
    next(new Error("Authentication failed"));
  }
}