// hooks/useWebSocket.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { webSocketService, WebSocketEvent } from '../services/websocket.service';

interface UseWebSocketOptions {
  onMessage?: (event: WebSocketEvent) => void;
  onNotification?: (notification: unknown) => void;
  onNewProposal?: (data: unknown) => void;
  onMessageReceived?: (message: unknown) => void;
  autoConnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const subscriptions = useRef<(() => void)[]>([]);

  useEffect(() => {
    if (options.autoConnect !== false) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, []);

  const connect = useCallback(async () => {
    try {
      await webSocketService.connect();
      setIsConnected(true);
      setConnectionError(null);

      // Subscribe to events
      if (options.onMessage) {
        subscriptions.current.push(
          webSocketService.onMessage(options.onMessage)
        );
      }
      
      if (options.onNotification) {
        subscriptions.current.push(
          webSocketService.onNotification(options.onNotification)
        );
      }
      
      if (options.onNewProposal) {
        subscriptions.current.push(
          webSocketService.onNewProposal(options.onNewProposal)
        );
      }
      
      if (options.onMessageReceived) {
        subscriptions.current.push(
          webSocketService.onMessageReceived(options.onMessageReceived)
        );
      }
    } catch (error) {
      setConnectionError('Failed to connect to WebSocket');
      console.error('WebSocket connection error:', error);
    }
  }, [options]);

  const disconnect = useCallback(() => {
    subscriptions.current.forEach(unsubscribe => unsubscribe());
    subscriptions.current = [];
    webSocketService.disconnect();
    setIsConnected(false);
  }, []);

  const joinJobRoom = useCallback((jobId: number) => {
    webSocketService.joinJobRoom(jobId);
  }, []);

  const leaveJobRoom = useCallback((jobId: number) => {
    webSocketService.leaveJobRoom(jobId);
  }, []);

  const sendNotification = useCallback((userId: number, message: string, type?: string) => {
    webSocketService.sendNotification(userId, message, type);
  }, []);

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
    joinJobRoom,
    leaveJobRoom,
    sendNotification
  };
}
