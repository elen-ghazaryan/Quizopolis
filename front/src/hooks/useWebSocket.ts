import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@app-types/live-quiz-types';

const WS_URL = import.meta.env.VITE_API_URL;

export const useWebSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const listenersRef = useRef<Map<string, Function[]>>(new Map());

  useEffect(() => {
    socketRef.current = io(WS_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null
      }
    };
  }, []);

  const emit = useCallback(<K extends keyof ClientToServerEvents>(
    event: K,
    data: ClientToServerEvents[K]
  ) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.error('WebSocket not connected');
    }
  }, []);

  const on = useCallback(<K extends keyof ServerToClientEvents>(
    event: K,
    callback: (data: ServerToClientEvents[K]) => void
  ) => {
    if (socketRef.current) {
      socketRef.current.on(event as string, callback);
      
      const listeners = listenersRef.current.get(event as string) || [];
      listeners.push(callback);
      listenersRef.current.set(event as string, listeners);
    }
  }, []);

  const off = useCallback(<K extends keyof ServerToClientEvents>(
    event: K,
    callback?: (data: ServerToClientEvents[K]) => void
  ) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event as string, callback);
        
        const listeners = listenersRef.current.get(event as string) || [];
        const filtered = listeners.filter(fn => fn !== callback);
        listenersRef.current.set(event as string, filtered);
      } else {
        socketRef.current.off(event as string);
        listenersRef.current.delete(event as string);
      }
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    emit,
    on,
    off,
    disconnect
  };
};