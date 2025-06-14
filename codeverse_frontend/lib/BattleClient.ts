"use client";

import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

interface BattleUpdate {
  players: string[];
  status: 'waiting' | 'ready' | 'ended';
}

interface OpponentSubmit {
  isCorrect: boolean;
  timestamp: number;
}

interface BattleSubmission {
  problemId: string;
  code: string;
  language: string;
  roomId: string;
  userId: string;
}

interface BattleResult {
  winnerId: string;
  results: any;
}

interface BattleError {
  message: string;
}

class BattleClient {
  private socket: Socket | null = null;
  private roomId: string;
  private onUpdateCallback: ((data: BattleUpdate) => void) | null = null;
  private onOpponentSubmitCallback: ((data: OpponentSubmit) => void) | null = null;
  private onResultCallback: ((result: BattleResult) => void) | null = null;
  private onFailCallback: ((result: any) => void) | null = null;
  private onErrorCallback: ((error: BattleError) => void) | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private isConnecting = false;

  constructor(roomId: string) {
    this.roomId = roomId;
    this.initializeSocket();
  }

  private initializeSocket() {
    if (this.isConnecting) return;
    this.isConnecting = true;

    const token = document.cookie.split('; ').find(row => row.startsWith('client_token='))?.split('=')[1];
    if (!token) {
      console.error("No authentication token found");
      this.isConnecting = false;
      window.location.href = '/login';
      return;
    }

    try {
      this.socket = io(SOCKET_URL, {
        auth: {
          token: token
        },
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 10000,
        transports: ['websocket', 'polling']
      });

      this.setupSocketListeners();
    } catch (error) {
      console.error("Failed to initialize socket:", error);
      this.isConnecting = false;
    }
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Connected to battle server");
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      this.joinRoom();
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      this.reconnectAttempts++;
      this.isConnecting = false;

      if (error.message.includes("jwt expired") || error.message.includes("invalid token")) {
        this.handleTokenExpiration();
        return;
      }

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("Max reconnection attempts reached");
        this.disconnect();
        if (this.onUpdateCallback) {
          this.onUpdateCallback({
            players: [],
            status: 'ended'
          });
        }
      }
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
      this.isConnecting = false;
    });

    this.socket.on("battle:update", (data: BattleUpdate) => {
      if (this.onUpdateCallback) {
        this.onUpdateCallback(data);
      }
    });

    this.socket.on("battle:opponent_submit", (data: OpponentSubmit) => {
      if (this.onOpponentSubmitCallback) {
        this.onOpponentSubmitCallback(data);
      }
    });

    this.socket.on("battle:result", (result: BattleResult) => {
      if (this.onResultCallback) {
        this.onResultCallback(result);
      }
    });

    this.socket.on("battle:fail", (result: any) => {
      if (this.onFailCallback) {
        this.onFailCallback(result);
      }
    });

    this.socket.on("battle:error", (error: BattleError) => {
      if (this.onErrorCallback) {
        this.onErrorCallback(error);
      }
    });
  }

  private async handleTokenExpiration() {
    try {
      const response = await fetch("http://localhost:5000/api/auth/refresh", {
        method: "POST",
        credentials: "include"
      });

      if (!response.ok) {
        this.disconnect();
        return false;
      }

      return true;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      this.disconnect();
      return false;
    }
  }

  private joinRoom() {
    if (this.socket?.connected) {
      this.socket.emit("battle:join", { roomId: this.roomId });
    }
  }

  public onUpdate(callback: (data: BattleUpdate) => void) {
    this.onUpdateCallback = callback;
  }

  public onOpponentSubmit(callback: (data: OpponentSubmit) => void) {
    this.onOpponentSubmitCallback = callback;
  }

  public onResult(callback: (result: BattleResult) => void) {
    this.onResultCallback = callback;
  }

  public onFail(callback: (result: any) => void) {
    this.onFailCallback = callback;
  }

  public onError(callback: (error: BattleError) => void) {
    this.onErrorCallback = callback;
  }

  public submit(submission: BattleSubmission) {
    if (this.socket?.connected) {
      this.socket.emit("battle:submit", submission);
    } else {
      console.error("Cannot submit: Socket not connected");
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
  }
}

export default BattleClient; 