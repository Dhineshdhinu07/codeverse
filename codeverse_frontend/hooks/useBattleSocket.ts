"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export const useBattleSocket = (roomId: string) => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Don't attempt to connect if still loading or no user
    if (loading || !user) {
      return;
    }

    const socket = io("http://localhost:5000", {
      query: { roomId },
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      forceNew: true,
      path: '/socket.io/',
      upgrade: true,
      rememberUpgrade: true,
      rejectUnauthorized: false
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setIsConnected(true);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
      if (error.message === 'Authentication error') {
        router.push('/login');
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        socket.connect();
      }
    });

    socket.on("opponent:submitted", () => {
      setOpponentSubmitted(true);
    });

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [roomId, user, loading, router]);

  const notifySubmission = () => {
    if (!socketRef.current?.connected) {
      console.error("Socket not connected");
      return;
    }

    try {
      socketRef.current.emit("code:submit", { roomId });
    } catch (error) {
      console.error("Error emitting code:submit:", error);
    }
  };

  return { 
    opponentSubmitted, 
    notifySubmission, 
    isConnected,
    isAuthenticated: !!user,
    isLoading: loading
  };
};
