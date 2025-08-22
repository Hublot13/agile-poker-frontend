import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const serverUrl = import.meta.env.VITE_BACKEND_URL;

    const newSocket = io(serverUrl, {
      transports: ["websocket", "polling"],
      upgrade: true,
      rememberUpgrade: true,
    });

    newSocket.on("connect", () => {
      console.log("✅ Connected to server");
      setConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
      setConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
