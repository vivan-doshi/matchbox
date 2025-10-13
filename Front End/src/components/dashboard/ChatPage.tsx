import React, { useState, Component } from 'react';
import { SendIcon, CheckIcon, UsersIcon, PlusIcon, XIcon, MessageSquareIcon, UserPlusIcon } from 'lucide-react';
type Chat = {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    university: string;
    role?: string;
  };
  lastMessage: {
    text: string;
    time: string;
    read: boolean;
    sentByMe: boolean;
  };
  matched: boolean;
  approved: {
    byMe: boolean;
    byThem: boolean;
  };
};
const SAMPLE_CHATS: Chat[] = [{
  id: '1',
  user: {
    id: '101',
    name: 'Jamie Chen',
    avatar: 'https://i.pravatar.cc/150?img=21',
    university: 'Stanford',
    role: 'UI/UX Designer'
  },
  lastMessage: {
    text: "I'd love to join your project team!",
    time: '2:30 PM',
    read: true,
    sentByMe: false
  },
  matched: false,
  approved: {
    byMe: true,
    byThem: false
  }
}, {
  id: '2',
  user: {
    id: '102',
    name: 'Alex Morgan',
    avatar: 'https://i.pravatar.cc/150?img=22',
    university: 'MIT',
    role: 'Backend Developer'
  },
  lastMessage: {
    text: 'When can we schedule our first team meeting?',
    time: '11:45 AM',
    read: false,
    sentByMe: false
  },
  matched: true,
  approved: {
    byMe: true,
    byThem: true
  }
}, {
  id: '3',
  user: {
    id: '103',
    name: 'Taylor Reed',
    avatar: 'https://i.pravatar.cc/150?img=23',
    university: 'NYU',
    role: 'Product Manager'
  },
  lastMessage: {
    text: "I've attached my portfolio for you to review.",
    time: 'Yesterday',
    read: true,
    sentByMe: false
  },
  matched: false,
  approved: {
    byMe: false,
    byThem: true
  }
}];
// Add sample groups
type Group = {
  id: string;
  name: string;
  members: {
    id: string;
    name: string;
    avatar: string;
    role?: string;
  }[];
  lastMessage?: {
    text: string;
    time: string;
    sender: string;
  };
};
const SAMPLE_GROUPS: Group[] = [{
  id: 'g1',
  name: 'AI Study Assistant Team',
  members: [{
    id: '102',
    name: 'Alex Morgan',
    avatar: 'https://i.pravatar.cc/150?img=22',
    role: 'Backend Developer'
  }, {
    id: '104',
    name: 'Jordan Smith',
    avatar: 'https://i.pravatar.cc/150?img=24',
    role: 'ML Engineer'
  }],
  lastMessage: {
    text: 'I pushed the new API endpoints to GitHub',
    time: '9:15 AM',
    sender: 'Alex Morgan'
  }
}];
// Sample open positions that can be filled
const OPEN_POSITIONS = [{
  id: 'pos1',
  projectId: 'p1',
  projectName: 'AI Study Assistant',
  title: 'UI/UX Designer',
  description: 'Create user flows, wireframes, and high-fidelity designs'
}, {
  id: 'pos2',
  projectId: 'p1',
  projectName: 'AI Study Assistant',
  title: 'Frontend Developer',
  description: 'Implement the UI designs and integrate with the backend API'
}, {
  id: 'pos3',
  projectId: 'p2',
  projectName: 'Campus Events Platform',
  title: 'Backend Developer',
  description: 'Build the API and database architecture'
}];
const ChatItem: React.FC<{
  chat: Chat;
  active: boolean;
  onClick: () => void;
  onApprove: () => void;
}> = ({
  chat,
  active,
  onClick,
  onApprove
}) => {
  return <div className={`p-4 rounded-lg cursor-pointer transition-all ${active ? 'bg-orange-50' : 'hover:bg-slate-50'}`} onClick={onClick}>
      <div className="flex items-center">
        <div className="relative">
          <img src={chat.user.avatar} alt={chat.user.name} className="w-12 h-12 rounded-full" />
          {!chat.lastMessage.read && !chat.lastMessage.sentByMe && <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full"></div>}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold text-sm">{chat.user.name}</h3>
            <span className="text-xs text-slate-500">
              {chat.lastMessage.time}
            </span>
          </div>
          <p className="text-sm text-slate-700 line-clamp-1 mb-1">
            {chat.lastMessage.sentByMe ? 'You: ' : ''}
            {chat.lastMessage.text}
          </p>
          <div className="flex items-center">
            <span className="text-xs text-slate-500 mr-2">
              {chat.user.university}
            </span>
            {chat.user.role && <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full">
                {chat.user.role}
              </span>}
          </div>
        </div>
      </div>
      {!chat.matched && <div className="mt-3 flex items-center">
          <button className={`flex-1 py-1.5 rounded-l-md text-xs font-medium ${chat.approved.byMe ? 'bg-orange-500 text-white' : 'bg-white border border-orange-200 text-orange-500'}`} onClick={e => {
        e.stopPropagation();
        onApprove();
      }}>
            {chat.approved.byMe && <CheckIcon className="h-3 w-3 inline mr-1" />}
            Approve
          </button>
          <button className={`flex-1 py-1.5 rounded-r-md text-xs font-medium ${chat.approved.byThem ? 'bg-blue-500 text-white' : 'bg-white border border-blue-200 text-blue-500'}`} disabled>
            {chat.approved.byThem && <CheckIcon className="h-3 w-3 inline mr-1" />}
            They Approve
          </button>
        </div>}
      {chat.matched && <div className="mt-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium rounded-md text-center">
          BOXED! 🎉
        </div>}
    </div>;
};
const GroupItem: React.FC<{
  group: Group;
  active: boolean;
  onClick: () => void;
}> = ({
  group,
  active,
  onClick
}) => {
  return <div className={`p-4 rounded-lg cursor-pointer transition-all ${active ? 'bg-orange-50' : 'hover:bg-slate-50'}`} onClick={onClick}>
      <div className="flex items-center">
        <div className="relative bg-gradient-to-r from-orange-500 to-red-500 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold">
          {group.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold text-sm">{group.name}</h3>
            {group.lastMessage && <span className="text-xs text-slate-500">
                {group.lastMessage.time}
              </span>}
          </div>
          {group.lastMessage && <p className="text-sm text-slate-700 line-clamp-1 mb-1">
              {group.lastMessage.sender}: {group.lastMessage.text}
            </p>}
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {group.members.slice(0, 3).map(member => <img key={member.id} src={member.avatar} alt={member.name} className="w-5 h-5 rounded-full border border-white" />)}
            </div>
            <span className="text-xs text-slate-500 ml-2">
              {group.members.length} members
            </span>
          </div>
        </div>
      </div>
    </div>;
};
type Message = {
  id: string;
  text: string;
  time: string;
  sentByMe: boolean;
};
const SAMPLE_MESSAGES: Record<string, Message[]> = {
  '2': [{
    id: 'm1',
    text: 'Hi Alex! Thanks for reaching out about my project.',
    time: '11:30 AM',
    sentByMe: true
  }, {
    id: 'm2',
    text: "Hey there! I'm really interested in the backend role for your campus events platform.",
    time: '11:35 AM',
    sentByMe: false
  }, {
    id: 'm3',
    text: "That's great! Your experience with Node.js and databases is exactly what we're looking for.",
    time: '11:38 AM',
    sentByMe: true
  }, {
    id: 'm4',
    text: "I'm excited to contribute. I've built similar systems before for my department's website.",
    time: '11:40 AM',
    sentByMe: false
  }, {
    id: 'm5',
    text: "Perfect! I've approved you for the team. Let's set up a meeting with everyone.",
    time: '11:42 AM',
    sentByMe: true
  }, {
    id: 'm6',
    text: 'Sounds good! When can we schedule our first team meeting?',
    time: '11:45 AM',
    sentByMe: false
  }],
  g1: [{
    id: 'gm1',
    text: 'Welcome to the AI Study Assistant team!',
    time: '9:00 AM',
    sentByMe: true
  }, {
    id: 'gm2',
    text: 'Thanks for adding me! Looking forward to working with everyone.',
    time: '9:05 AM',
    sentByMe: false
  }, {
    id: 'gm3',
    text: "I've started working on the API endpoints for the study scheduler.",
    time: '9:10 AM',
    sentByMe: false
  }, {
    id: 'gm4',
    text: 'Great! Let me know if you need any help with the database schema.',
    time: '9:12 AM',
    sentByMe: true
  }, {
    id: 'gm5',
    text: 'I pushed the new API endpoints to GitHub',
    time: '9:15 AM',
    sentByMe: false
  }]
};
const ChatPage: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>('2');
  const [newMessage, setNewMessage] = useState('');
  const [chats, setChats] = useState(SAMPLE_CHATS);
  const [groups, setGroups] = useState(SAMPLE_GROUPS);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showFillPositions, setShowFillPositions] = useState(false);
  const [activeTab, setActiveTab] = useState<'direct' | 'groups'>('direct');
  const boxedConnections = chats.filter(chat => chat.matched);
  const activeChat = selectedChat && selectedChat.startsWith('g') ? null : chats.find(chat => chat.id === selectedChat);
  const activeGroup = selectedChat && selectedChat.startsWith('g') ? groups.find(group => group.id === selectedChat) : null;
  const messages = selectedChat ? SAMPLE_MESSAGES[selectedChat] || [] : [];
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
    // In a real app, this would send the message to the backend
    setNewMessage('');
  };
  const handleApprove = (chatId: string) => {
    setChats(chats.map(chat => {
      if (chat.id === chatId) {
        // If both approve, it's a match
        const willBeMatched = chat.approved.byThem && !chat.approved.byMe;
        return {
          ...chat,
          approved: {
            ...chat.approved,
            byMe: true
          },
          matched: willBeMatched
        };
      }
      return chat;
    }));
  };
  const createGroup = (groupName: string, selectedMembers: string[]) => {
    if (!groupName.trim() || selectedMembers.length === 0) return;
    const newGroup: Group = {
      id: `g${groups.length + 1}`,
      name: groupName,
      members: boxedConnections.filter(conn => selectedMembers.includes(conn.user.id)).map(conn => ({
        id: conn.user.id,
        name: conn.user.name,
        avatar: conn.user.avatar,
        role: conn.user.role
      }))
    };
    setGroups([...groups, newGroup]);
    setShowCreateGroup(false);
    setSelectedChat(newGroup.id);
    setActiveTab('groups');
  };
  const fillPosition = (positionId: string, userId: string) => {
    // In a real app, this would update the position with the selected user
    alert(`Position ${positionId} filled with user ${userId}`);
    setShowFillPositions(false);
  };
  return <div className="flex h-[calc(100vh-13rem)]">
      <div className="w-full md:w-1/3 bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden mr-0 md:mr-6 mb-6 md:mb-0">
        <div className="p-4 border-b border-slate-100">
          <div className="flex justify-between items-center">
            <h2 className="font-bold">Messages</h2>
            <div className="flex space-x-2">
              <button onClick={() => setShowFillPositions(true)} className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 transition-colors" title="Fill Positions">
                <UserPlusIcon className="h-4 w-4" />
              </button>
              <button onClick={() => setShowCreateGroup(true)} className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 transition-colors" title="Create Group">
                <UsersIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex mt-4 border-b border-slate-200">
            <button className={`flex-1 py-2 text-sm font-medium ${activeTab === 'direct' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-slate-600'}`} onClick={() => setActiveTab('direct')}>
              Direct Messages
            </button>
            <button className={`flex-1 py-2 text-sm font-medium ${activeTab === 'groups' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-slate-600'}`} onClick={() => setActiveTab('groups')}>
              Groups
            </button>
          </div>
        </div>
        <div className="overflow-y-auto h-[calc(100%-8rem)]">
          {activeTab === 'direct' && chats.map(chat => <ChatItem key={chat.id} chat={chat} active={selectedChat === chat.id} onClick={() => setSelectedChat(chat.id)} onApprove={() => handleApprove(chat.id)} />)}
          {activeTab === 'groups' && groups.map(group => <GroupItem key={group.id} group={group} active={selectedChat === group.id} onClick={() => setSelectedChat(group.id)} />)}
          {activeTab === 'groups' && groups.length === 0 && <div className="p-4 text-center text-slate-500">
              <p>No groups yet</p>
              <button onClick={() => setShowCreateGroup(true)} className="mt-2 px-3 py-1 bg-orange-500 text-white rounded-md text-sm hover:bg-orange-600 transition-colors">
                Create Group
              </button>
            </div>}
        </div>
      </div>
      {selectedChat && (activeChat || activeGroup) ? <div className="hidden md:flex md:flex-col w-2/3 bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center">
            {activeChat ? <>
                <img src={activeChat.user.avatar} alt={activeChat.user.name} className="w-10 h-10 rounded-full mr-3" />
                <div>
                  <h3 className="font-bold">{activeChat.user.name}</h3>
                  <div className="flex items-center">
                    <span className="text-xs text-slate-500 mr-2">
                      {activeChat.user.university}
                    </span>
                    {activeChat.user.role && <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full">
                        {activeChat.user.role}
                      </span>}
                  </div>
                </div>
                {activeChat.matched && <div className="ml-auto px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium rounded-full">
                    BOXED! 🎉
                  </div>}
              </> : <>
                <div className="bg-gradient-to-r from-orange-500 to-red-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  {activeGroup!.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold">{activeGroup!.name}</h3>
                  <div className="flex items-center">
                    <span className="text-xs text-slate-500">
                      {activeGroup!.members.length} members
                    </span>
                  </div>
                </div>
              </>}
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
            <div className="space-y-4">
              {messages.map(message => <div key={message.id} className={`flex ${message.sentByMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-lg ${message.sentByMe ? 'bg-orange-500 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none'}`}>
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${message.sentByMe ? 'text-orange-100' : 'text-slate-400'}`}>
                      {message.time}
                    </p>
                  </div>
                </div>)}
            </div>
          </div>
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 flex">
            <input type="text" placeholder="Type a message..." className="flex-1 px-4 py-2 rounded-l-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" value={newMessage} onChange={e => setNewMessage(e.target.value)} />
            <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded-r-lg hover:bg-orange-600 transition-colors">
              <SendIcon className="h-5 w-5" />
            </button>
          </form>
        </div> : <div className="hidden md:flex md:flex-col md:justify-center md:items-center w-2/3 bg-white rounded-lg shadow-sm border border-slate-100">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquareIcon className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-bold mb-2">Select a conversation</h3>
            <p className="text-slate-600 max-w-md">
              Choose a conversation from the left to start chatting with
              potential teammates.
            </p>
          </div>
        </div>}
      {/* Create Group Modal */}
      {showCreateGroup && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Create Group</h3>
              <button onClick={() => setShowCreateGroup(false)} className="text-slate-500 hover:text-slate-700">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <CreateGroupForm boxedConnections={boxedConnections.map(c => c.user)} onSubmit={createGroup} onCancel={() => setShowCreateGroup(false)} />
          </div>
        </div>}
      {/* Fill Positions Modal */}
      {showFillPositions && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Fill Open Positions</h3>
              <button onClick={() => setShowFillPositions(false)} className="text-slate-500 hover:text-slate-700">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <FillPositionsForm positions={OPEN_POSITIONS} boxedConnections={boxedConnections.map(c => c.user)} onFill={fillPosition} onCancel={() => setShowFillPositions(false)} />
          </div>
        </div>}
    </div>;
};
// Component for creating a new group
const CreateGroupForm: React.FC<{
  boxedConnections: {
    id: string;
    name: string;
    avatar: string;
    role?: string;
  }[];
  onSubmit: (groupName: string, selectedMembers: string[]) => void;
  onCancel: () => void;
}> = ({
  boxedConnections,
  onSubmit,
  onCancel
}) => {
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const toggleMember = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(groupName, selectedMembers);
  };
  return <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="groupName" className="block text-sm font-medium text-slate-700 mb-1">
          Group Name
        </label>
        <input type="text" id="groupName" value={groupName} onChange={e => setGroupName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Enter group name" required />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Select Boxed Members
        </label>
        {boxedConnections.length === 0 ? <p className="text-sm text-slate-500 italic">
            You don't have any boxed connections yet. Box with users first to
            create a group.
          </p> : <div className="space-y-2 max-h-60 overflow-y-auto">
            {boxedConnections.map(user => <div key={user.id} className={`flex items-center p-2 rounded-md cursor-pointer ${selectedMembers.includes(user.id) ? 'bg-orange-50 border border-orange-200' : 'hover:bg-slate-50'}`} onClick={() => toggleMember(user.id)}>
                <div className="flex items-center flex-1">
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full mr-3" />
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    {user.role && <p className="text-xs text-slate-500">{user.role}</p>}
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border ${selectedMembers.includes(user.id) ? 'bg-orange-500 border-orange-500 flex items-center justify-center' : 'border-slate-300'}`}>
                  {selectedMembers.includes(user.id) && <CheckIcon className="h-3 w-3 text-white" />}
                </div>
              </div>)}
          </div>}
      </div>
      <div className="flex justify-end space-x-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50">
          Cancel
        </button>
        <button type="submit" disabled={!groupName || selectedMembers.length === 0} className={`px-4 py-2 rounded-md text-white ${!groupName || selectedMembers.length === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-md'}`}>
          Create Group
        </button>
      </div>
    </form>;
};
// Component for filling positions with boxed connections
const FillPositionsForm: React.FC<{
  positions: {
    id: string;
    projectId: string;
    projectName: string;
    title: string;
    description: string;
  }[];
  boxedConnections: {
    id: string;
    name: string;
    avatar: string;
    role?: string;
  }[];
  onFill: (positionId: string, userId: string) => void;
  onCancel: () => void;
}> = ({
  positions,
  boxedConnections,
  onFill,
  onCancel
}) => {
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const handleFill = () => {
    if (selectedPosition && selectedUser) {
      onFill(selectedPosition, selectedUser);
    }
  };
  return <div>
      {boxedConnections.length === 0 ? <p className="text-sm text-slate-500 italic mb-4">
          You don't have any boxed connections yet. Box with users first to fill
          positions.
        </p> : <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Open Position
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
              {positions.map(position => <div key={position.id} className={`p-3 rounded-md cursor-pointer ${selectedPosition === position.id ? 'bg-orange-50 border border-orange-200' : 'border border-slate-200 hover:bg-slate-50'}`} onClick={() => setSelectedPosition(position.id)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{position.title}</p>
                      <p className="text-xs text-slate-500">
                        {position.projectName}
                      </p>
                      <p className="text-sm mt-1">{position.description}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border mt-1 ${selectedPosition === position.id ? 'bg-orange-500 border-orange-500 flex items-center justify-center' : 'border-slate-300'}`}>
                      {selectedPosition === position.id && <CheckIcon className="h-3 w-3 text-white" />}
                    </div>
                  </div>
                </div>)}
            </div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Boxed Member
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {boxedConnections.map(user => <div key={user.id} className={`flex items-center p-2 rounded-md cursor-pointer ${selectedUser === user.id ? 'bg-orange-50 border border-orange-200' : 'hover:bg-slate-50 border border-slate-200'}`} onClick={() => setSelectedUser(user.id)}>
                  <div className="flex items-center flex-1">
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full mr-3" />
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      {user.role && <p className="text-xs text-slate-500">{user.role}</p>}
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border ${selectedUser === user.id ? 'bg-orange-500 border-orange-500 flex items-center justify-center' : 'border-slate-300'}`}>
                    {selectedUser === user.id && <CheckIcon className="h-3 w-3 text-white" />}
                  </div>
                </div>)}
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="button" disabled={!selectedPosition || !selectedUser} onClick={handleFill} className={`px-4 py-2 rounded-md text-white ${!selectedPosition || !selectedUser ? 'bg-slate-300 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-md'}`}>
              Fill Position
            </button>
          </div>
        </>}
    </div>;
};
export default ChatPage;