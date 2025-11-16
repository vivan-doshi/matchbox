import { apiClient } from '../utils/apiClient';

export interface Message {
  _id?: string;
  sender: string | any;
  text: string;
  read?: boolean;
  createdAt: string;
}

export interface Chat {
  _id: string;
  participants: any[];
  messages: Message[];
  lastMessage?: {
    text: string;
    sender: string;
    createdAt: string;
  };
  type?: 'direct' | 'invitation' | 'application';
  relatedProject?: string | any;
  relatedInvitation?: string | any;
  relatedApplication?: string | any;
  status?: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: string;
  updatedAt: string;
}

export const chatService = {
  async getChats(type?: 'direct' | 'invitation' | 'application', tab?: 'active' | 'invitations' | 'requests'): Promise<Chat[]> {
    const params: any = {};
    if (type) params.type = type;
    if (tab) params.tab = tab;
    const response = await apiClient.getChats(params);
    return (response.data as Chat[]) || [];
  },

  async createOrGetChat(participantId: string): Promise<Chat> {
    const response = await apiClient.createChat(participantId);
    return response.data as Chat;
  },

  async getChat(chatId: string): Promise<Chat> {
    const response = await apiClient.getChatById(chatId);
    return response.data as Chat;
  },

  async getMessages(chatId: string): Promise<Message[]> {
    const response = await apiClient.getMessages(chatId);
    return (response.data as Message[]) || [];
  },

  async sendMessage(chatId: string, text: string): Promise<Message | null> {
    const response = await apiClient.sendMessage(chatId, text);
    const chat = response.data as Chat;
    if (!chat || !Array.isArray(chat.messages) || chat.messages.length === 0) {
      return null;
    }

    return chat.messages[chat.messages.length - 1];
  },

  async markAsRead(chatId: string): Promise<void> {
    await apiClient.markChatAsRead(chatId);
  },
};
