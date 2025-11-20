import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Send, User as UserIcon, Briefcase, UserCircle, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Chat, Message, chatService } from '../../services/chatService';
import { apiClient } from '../../utils/apiClient';
import DeclineReasonModal from './DeclineReasonModal';

type ChatTab = 'active' | 'invitations' | 'requests';

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<ChatTab>('active');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentUserId = user?.id || (user as any)?._id;

  const fetchChats = useCallback(async (tab: ChatTab = 'active') => {
    try {
      setLoading(true);
      const chatList = await chatService.getChats(undefined, tab);
      setChats(chatList);
      setFilteredChats(chatList);
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
    fetchChats(activeTab);
  }, [fetchChats, activeTab]);

  useEffect(() => {
    const chatId = searchParams.get('chatId');
    if (chatId) {
      openChat(chatId);
    }
  }, [openChat, searchParams]);

  const handleTabChange = (tab: ChatTab) => {
    setActiveTab(tab);
    setSelectedChat(null);
    navigate('/dashboard/chat', { replace: true });
  };

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
      await fetchChats(activeTab);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async () => {
    if (!selectedChat) return;

    try {
      setIsProcessing(true);

      if (selectedChat.type === 'invitation' && selectedChat.relatedInvitation) {
        const invitationId = typeof selectedChat.relatedInvitation === 'string'
          ? selectedChat.relatedInvitation
          : (selectedChat.relatedInvitation as any)?._id;

        await apiClient.acceptInvitation(invitationId);
        alert('Invitation accepted successfully! Redirecting to your projects...');

        // Navigate to Projects Joined tab
        setTimeout(() => {
          navigate('/my-projects?tab=joined');
        }, 1000);
      } else if (selectedChat.type === 'application' && selectedChat.relatedApplication) {
        const projectId = typeof selectedChat.relatedProject === 'string'
          ? selectedChat.relatedProject
          : (selectedChat.relatedProject as any)?._id;
        const applicationId = typeof selectedChat.relatedApplication === 'string'
          ? selectedChat.relatedApplication
          : (selectedChat.relatedApplication as any)?._id;

        await apiClient.updateApplicationStatus(projectId, applicationId, 'Accepted');
        alert('Application accepted successfully!');

        // Refresh chat and messages
        await openChat(selectedChat._id);
        await fetchChats(activeTab);
      }
    } catch (error: any) {
      console.error('Error accepting:', error);
      alert(error.response?.data?.message || 'Failed to accept');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async (reason: string) => {
    if (!selectedChat) return;

    try {
      setIsProcessing(true);

      if (selectedChat.type === 'invitation' && selectedChat.relatedInvitation) {
        const invitationId = typeof selectedChat.relatedInvitation === 'string'
          ? selectedChat.relatedInvitation
          : (selectedChat.relatedInvitation as any)?._id;

        await apiClient.rejectInvitation(invitationId, reason);
        alert('Invitation declined');
      } else if (selectedChat.type === 'application' && selectedChat.relatedApplication) {
        const projectId = typeof selectedChat.relatedProject === 'string'
          ? selectedChat.relatedProject
          : (selectedChat.relatedProject as any)?._id;
        const applicationId = typeof selectedChat.relatedApplication === 'string'
          ? selectedChat.relatedApplication
          : (selectedChat.relatedApplication as any)?._id;

        await apiClient.updateApplicationStatus(projectId, applicationId, 'Rejected', reason);
        alert('Application declined');
      }

      setShowDeclineModal(false);
      // Refresh chat and messages
      await openChat(selectedChat._id);
      await fetchChats(activeTab);
    } catch (error: any) {
      console.error('Error declining:', error);
      alert(error.response?.data?.message || 'Failed to decline');
    } finally {
      setIsProcessing(false);
    }
  };

  const getOtherParticipant = (chat: Chat | null) => {
    if (!chat || !currentUserId) return null;
    return chat.participants.find((participant: any) => {
      const participantId = participant?._id || participant?.id || participant;
      return participantId !== currentUserId;
    });
  };

  const isInvitee = (chat: Chat | null) => {
    if (!chat || chat.type !== 'invitation') return false;
    const otherParticipant = getOtherParticipant(chat);
    const otherParticipantId = otherParticipant?._id || otherParticipant?.id || otherParticipant;
    // In invitation chat, the invitee is the one who receives it (other participant is inviter)
    // So we check if the selected chat has the current user as invitee
    const project = chat.relatedProject as any;
    return project && project.creator !== currentUserId;
  };

  const isProjectCreator = (chat: Chat | null) => {
    if (!chat || !chat.relatedProject) return false;
    const project = chat.relatedProject as any;
    const projectCreatorId = typeof project.creator === 'string'
      ? project.creator
      : project.creator?._id || project.creator?.id;
    return projectCreatorId === currentUserId;
  };

  const shouldShowAcceptDeclineButtons = () => {
    if (!selectedChat || selectedChat.status !== 'Pending') return false;

    if (selectedChat.type === 'invitation') {
      // Show buttons to invitee only
      return isInvitee(selectedChat);
    } else if (selectedChat.type === 'application') {
      // Show buttons to project creator only
      return isProjectCreator(selectedChat);
    }

    return false;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cardinal"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className={`${selectedChat ? 'hidden md:block' : 'block'} w-full md:w-1/3 border-r bg-white`}>
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold mb-3">Messages</h1>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => handleTabChange('active')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'active'
                  ? 'bg-cardinal text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => handleTabChange('invitations')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'invitations'
                  ? 'bg-cardinal text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Invitations
            </button>
            <button
              onClick={() => handleTabChange('requests')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'requests'
                  ? 'bg-cardinal text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Requests
            </button>
          </div>
        </div>

        <div className="overflow-y-auto" style={{ height: 'calc(100vh - 145px)' }}>
          {filteredChats.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No conversations yet</p>
              <p className="text-sm mt-2">
                {activeTab === 'invitations'
                  ? 'Your project invitations will appear here'
                  : activeTab === 'requests'
                  ? 'Project applications will appear here'
                  : 'Start messaging team members!'}
              </p>
            </div>
          ) : (
            filteredChats.map((chat) => {
              const otherUser = getOtherParticipant(chat);
              const project = chat.relatedProject as any;
              return (
                <div
                  key={chat._id}
                  onClick={() => openChat(chat._id)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedChat?._id === chat._id ? 'bg-red-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cardinal to-cardinal-light flex items-center justify-center text-white font-semibold">
                      {otherUser?.firstName?.[0] || otherUser?.preferredName?.[0] || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {otherUser?.preferredName || `${otherUser?.firstName ?? ''} ${otherUser?.lastName ?? ''}`.trim()}
                      </p>
                      {project && (
                        <p className="text-xs text-cardinal font-medium truncate">
                          {chat.type === 'invitation' ? '📩 Invitation: ' : '📝 Application: '}
                          {project.title}
                        </p>
                      )}
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
            <div className="p-4 border-b bg-white">
              <div className="flex items-center gap-3 mb-3">
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
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cardinal to-cardinal-light flex items-center justify-center text-white font-semibold">
                        {otherUser?.firstName?.[0] || otherUser?.preferredName?.[0] || <UserIcon className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">
                          {otherUser?.preferredName || `${otherUser?.firstName ?? ''} ${otherUser?.lastName ?? ''}`.trim()}
                        </p>
                        <p className="text-sm text-gray-500">{otherUser?.university}</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Accept/Decline buttons for pending invitations/applications */}
              {shouldShowAcceptDeclineButtons() && (
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={handleAccept}
                    disabled={isProcessing}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="h-4 w-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => setShowDeclineModal(true)}
                    disabled={isProcessing}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="h-4 w-4" />
                    Decline
                  </button>
                </div>
              )}

              {/* Action buttons for invitation and application chats */}
              {selectedChat.relatedProject && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      let projectId: string | undefined;

                      if (typeof selectedChat.relatedProject === 'string') {
                        projectId = selectedChat.relatedProject;
                      } else if (selectedChat.relatedProject) {
                        // Handle populated project object - try both _id and id
                        projectId = (selectedChat.relatedProject as any)?._id || (selectedChat.relatedProject as any)?.id;
                      }

                      if (projectId) {
                        navigate(`/project/${projectId}`);
                      } else {
                        console.error('Project ID not found in chat:', selectedChat);
                        alert('Unable to navigate to project - project ID not found');
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-cardinal text-white rounded-lg hover:bg-cardinal-light transition-colors text-sm font-medium"
                  >
                    <Briefcase className="h-4 w-4" />
                    View Project
                  </button>
                  <button
                    onClick={() => {
                      const otherUser = getOtherParticipant(selectedChat);
                      const userId = otherUser?._id || otherUser?.id || otherUser;
                      navigate(`/profile/${userId}`);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-cardinal text-cardinal rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                  >
                    <UserCircle className="h-4 w-4" />
                    View Profile
                  </button>
                </div>
              )}
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
                          ? 'bg-gradient-to-r from-cardinal to-cardinal-light text-white'
                          : 'bg-white text-gray-800 border'
                      }`}
                    >
                      <p>{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-red-100' : 'text-gray-500'
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
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cardinal"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-6 py-2 bg-gradient-to-r from-cardinal to-cardinal-light text-white rounded-lg hover:from-cardinal-light hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Decline Reason Modal */}
      <DeclineReasonModal
        isOpen={showDeclineModal}
        onClose={() => !isProcessing && setShowDeclineModal(false)}
        onSubmit={handleDecline}
        title={selectedChat?.type === 'invitation' ? 'Decline Invitation' : 'Decline Application'}
        isSubmitting={isProcessing}
      />
    </div>
  );
};

export default ChatPage;
