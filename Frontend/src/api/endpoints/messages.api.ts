// api/endpoints/messages.api.ts
import { apiClient } from '../client';
import { ApiResponse, PagedResult } from '../types/api.types';

export interface Conversation {
  userId: number;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

export interface Message {
  id: number;
  senderId: number;
  senderName: string;
  senderAvatar: string;
  receiverId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
  attachmentUrl?: string;
}

export interface SendMessageRequest {
  receiverId: number;
  jobId?: number;
  content: string;
  attachment?: File;
}

class MessagesApi {
  async getConversations(): Promise<ApiResponse<Conversation[]>> {
    return apiClient.get<Conversation[]>('/messages/conversations');
  }

  async getMessages(userId: number, page: number = 1, pageSize: number = 50): Promise<ApiResponse<PagedResult<Message>>> {
    return apiClient.get<PagedResult<Message>>(`/messages/${userId}`, { 
      params: { page, pageSize } 
    });
  }

  async sendMessage(request: SendMessageRequest): Promise<ApiResponse<Message>> {
    const formData = new FormData();
    formData.append('receiverId', request.receiverId.toString());
    formData.append('content', request.content);
    if (request.jobId) formData.append('jobId', request.jobId.toString());
    if (request.attachment) formData.append('attachment', request.attachment);
    
    return apiClient.post<Message>('/messages/send', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  async markAsRead(userId: number): Promise<ApiResponse<boolean>> {
    return apiClient.put<boolean>(`/messages/mark-read/${userId}`, {});
  }

  async deleteMessage(messageId: number): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/messages/${messageId}`);
  }

  async getUnreadCount(): Promise<ApiResponse<number>> {
    return apiClient.get<number>('/messages/unread-count');
  }
}

export const messagesApi = new MessagesApi();
