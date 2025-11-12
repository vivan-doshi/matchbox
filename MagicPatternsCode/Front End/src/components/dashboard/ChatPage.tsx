import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Send, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Chat, Message, chatService } from '../../services/chatService';

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const currentUserId = user?.id || (user as any)?._id;

  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);
      const chatList = await chatService.getChats();
      setChats(chatList);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const openChat = useCallback(
    async (chatId: string) => {
      try {
        const chatData = await chatService.getChat(chatId);
        setSelectedChat(chatData);

        const chatMessages = await chatService.getMessages(chatId);
        setMessages(chatMessages);

        await chatService.markAsRead(chatId);

        navigate(`/dashboard/chat?chatId=${chatId}`, { replace: true });
        setTimeout(scrollToBottom, 0);
      } catch (error) {
        console.error('Error opening chat:', error);
      }
    },
    [navigate]
  );

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    const chatId = searchParams.get('chatId');
    if (chatId) {
      openChat(chatId);
    }
  }, [openChat, searchParams]);

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newMessage.trim() || !selectedChat || sending) return;

    try {
      setSending(true);
      const sentMessage = await chatService.sendMessage(selectedChat._id, newMessage.trim());

      if (sentMessage) {
        setMessages((prev) => [...prev, sentMessage]);
      }

      setNewMessage('');
      scrollToBottom();
      await fetchChats();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (chat: Chat | null) => {
    if (!chat || !currentUserId) return null;
    return chat.participants.find((participant: any) => {
      const participantId = participant?._id || participant?.id || participant;
      return participantId !== currentUserId;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className={`${selectedChat ? 'hidden md:block' : 'block'} w-full md:w-1/3 border-r bg-white`}>
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>

        <div className="overflow-y-auto" style={{ height: 'calc(100vh - 73px)' }}>
          {chats.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No conversations yet</p>
              <p className="text-sm mt-2">Start messaging team members!</p>
            </div>
          ) : (
            chats.map((chat) => {
              const otherUser = getOtherParticipant(chat);
              return (
                <div
                  key={chat._id}
                  onClick={() => openChat(chat._id)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedChat?._id === chat._id ? 'bg-orange-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center text-white font-semibold">
                      {otherUser?.firstName?.[0] || otherUser?.preferredName?.[0] || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {otherUser?.preferredName || `${otherUser?.firstName ?? ''} ${otherUser?.lastName ?? ''}`.trim()}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {chat.lastMessage?.text || chat.messages?.[chat.messages.length - 1]?.text || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className={`${selectedChat ? 'block' : 'hidden md:block'} flex-1 flex flex-col`}>
        {selectedChat ? (
          <>
            <div className="p-4 border-b bg-white flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedChat(null);
                  navigate('/dashboard/chat', { replace: true });
                }}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              {(() => {
                const otherUser = getOtherParticipant(selectedChat);
                return (
                  <>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center text-white font-semibold">
                      {otherUser?.firstName?.[0] || otherUser?.preferredName?.[0] || <UserIcon className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {otherUser?.preferredName || `${otherUser?.firstName ?? ''} ${otherUser?.lastName ?? ''}`.trim()}
                      </p>
                      <p className="text-sm text-gray-500">{otherUser?.university}</p>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message, index) => {
                const senderId =
                  typeof message.sender === 'string'
                    ? message.sender
                    : message.sender?._id || message.sender?.id;
                const isOwnMessage = senderId === currentUserId;

                return (
                  <div
                    key={message._id || index}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwnMessage
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                          : 'bg-white text-gray-800 border'
                      }`}
                    >
                      <p>{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-orange-100' : 'text-gray-500'
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <UserIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
