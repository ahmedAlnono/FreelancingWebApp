import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { environment } from '../config/environment';
import { tokenService } from './token.service';

export interface WebSocketEvent {
  type: string;
  data: unknown;
  timestamp: string;
}

type EventHandler = (event: WebSocketEvent) => void;
type NotificationHandler = (notification: unknown) => void;
type ProposalHandler = (data: unknown) => void;
type MessageHandler = (message: unknown) => void;

class WebSocketService {
  private connection: HubConnection | null = null;
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private notificationHandlers: Set<NotificationHandler> = new Set();
  private proposalHandlers: Set<ProposalHandler> = new Set();
  private messageHandlers: Set<MessageHandler> = new Set();

  async connect(): Promise<void> {
    const token = tokenService.getAccessToken();
    
    this.connection = new HubConnectionBuilder()
      .withUrl(`${environment.wsUrl}/notification`, {
        accessTokenFactory: () => token || ''
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(environment.production ? LogLevel.Error : LogLevel.Information)
      .build();

    this.setupEventHandlers();

    try {
      await this.connection.start();
      console.log('WebSocket connected');
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      throw error;
    }
  }

  disconnect(): void {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Generic message handler
    this.connection.on('ReceiveMessage', (event: WebSocketEvent) => {
      const handlers = this.eventHandlers.get(event.type);
      if (handlers) {
        handlers.forEach(handler => handler(event));
      }
    });

    // Notification handler
    this.connection.on('ReceiveNotification', (notification: unknown) => {
      this.notificationHandlers.forEach(handler => handler(notification));
    });

    // New proposal handler
    this.connection.on('NewProposal', (data: unknown) => {
      this.proposalHandlers.forEach(handler => handler(data));
    });

    // New message handler
    this.connection.on('NewMessage', (message: unknown) => {
      this.messageHandlers.forEach(handler => handler(message));
    });
  }

  // Event subscription
  onMessage(handler: EventHandler): () => void {
    const type = '*';
    if (!this.eventHandlers.has(type)) {
      this.eventHandlers.set(type, new Set());
    }
    this.eventHandlers.get(type)!.add(handler);
    
    return () => {
      this.eventHandlers.get(type)?.delete(handler);
    };
  }

  onNotification(handler: NotificationHandler): () => void {
    this.notificationHandlers.add(handler);
    return () => {
      this.notificationHandlers.delete(handler);
    };
  }

  onNewProposal(handler: ProposalHandler): () => void {
    this.proposalHandlers.add(handler);
    return () => {
      this.proposalHandlers.delete(handler);
    };
  }

  onMessageReceived(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  // Actions
  async joinJobRoom(jobId: number): Promise<void> {
    if (this.connection && this.connection.state === 'Connected') {
      await this.connection.invoke('JoinJobRoom', jobId);
    }
  }

  async leaveJobRoom(jobId: number): Promise<void> {
    if (this.connection && this.connection.state === 'Connected') {
      await this.connection.invoke('LeaveJobRoom', jobId);
    }
  }

  async sendNotification(userId: number, message: string, type: string = 'info'): Promise<void> {
    if (this.connection && this.connection.state === 'Connected') {
      await this.connection.invoke('SendToUser', userId, message, type);
    }
  }

  isConnected(): boolean {
    return this.connection?.state === 'Connected';
  }
}

export const webSocketService = new WebSocketService();
