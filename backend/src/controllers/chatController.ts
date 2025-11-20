import { Response } from 'express';
import Chat from '../models/Chat';
import Group from '../models/Group';
import Match from '../models/Match';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all chats for user
// @route   GET /api/chats?type=direct|invitation|application&status=Pending|Accepted|Rejected&tab=active|invitations|requests
// @access  Private
export const getChats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { type, status, tab } = req.query;

    const query: any = {
      participants: req.userId,
    };

    // Handle tab-based filtering
    if (tab === 'active') {
      // Active tab: Direct messages + Accepted invitations/applications
      query.$or = [
        { type: 'direct' },
        { type: { $in: ['invitation', 'application'] }, status: 'Accepted' }
      ];
    } else if (tab === 'invitations') {
      // Invitations tab: Pending invitations where user is the invitee
      query.type = 'invitation';
      query.status = 'Pending';
    } else if (tab === 'requests') {
      // Requests tab: Pending applications where user is the project creator
      query.type = 'application';
      query.status = 'Pending';
    }

    // Filter by chat type if provided (and no tab is specified)
    if (!tab && type && ['direct', 'invitation', 'application'].includes(type as string)) {
      query.type = type;
    }

    // Filter by status if provided (and no tab is specified)
    if (!tab && status && ['Pending', 'Accepted', 'Rejected'].includes(status as string)) {
      query.status = status;
    }

    const chats = await Chat.find(query)
      .populate('participants', 'firstName lastName preferredName university profilePicture')
      .populate('lastMessage.sender', 'firstName lastName')
      .populate('relatedProject', 'title description creator')
      .populate('relatedInvitation')
      .populate('relatedApplication')
      .sort('-updatedAt');

    res.status(200).json({
      success: true,
      count: chats.length,
      data: chats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get or create chat with another user
// @route   POST /api/chats
// @access  Private
export const createOrGetChat = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
      return;
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.userId, userId] },
    }).populate('participants', 'firstName lastName preferredName university profilePicture');

    if (chat) {
      res.status(200).json({
        success: true,
        data: chat,
      });
      return;
    }

    // Create new chat
    chat = await Chat.create({
      participants: [req.userId, userId],
      messages: [],
    });

    chat = await Chat.findById(chat._id).populate(
      'participants',
      'firstName lastName preferredName university profilePicture'
    );

    res.status(201).json({
      success: true,
      data: chat,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get chat by ID
// @route   GET /api/chats/:id
// @access  Private
export const getChat = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'firstName lastName preferredName university profilePicture')
      .populate('relatedProject', 'title description creator')
      .populate('relatedInvitation')
      .populate('relatedApplication');

    if (!chat) {
      res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
      return;
    }

    // Check if user is a participant
    const isParticipant = chat.participants.some(
      (p: any) => p._id.toString() === req.userId
    );

    if (!isParticipant) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view this chat',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: chat,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Send message in chat
// @route   POST /api/chats/:id/messages
// @access  Private
export const sendMessage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { text } = req.body;

    if (!text) {
      res.status(400).json({
        success: false,
        message: 'Message text is required',
      });
      return;
    }

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
      return;
    }

    // Check if user is a participant
    const isParticipant = chat.participants.some(
      (p: any) => p.toString() === req.userId
    );

    if (!isParticipant) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this chat',
      });
      return;
    }

    chat.messages.push({
      sender: req.userId as any,
      text,
      read: false,
      createdAt: new Date(),
    });

    await chat.save();

    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', 'firstName lastName preferredName university profilePicture')
      .populate('messages.sender', 'firstName lastName preferredName');

    res.status(201).json({
      success: true,
      data: populatedChat,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get messages in chat
// @route   GET /api/chats/:id/messages
// @access  Private
export const getMessages = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const chat = await Chat.findById(req.params.id).populate(
      'messages.sender',
      'firstName lastName preferredName profilePicture'
    );

    if (!chat) {
      res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
      return;
    }

    // Check if user is a participant
    const isParticipant = chat.participants.some(
      (p: any) => p.toString() === req.userId
    );

    if (!isParticipant) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view messages',
      });
      return;
    }

    res.status(200).json({
      success: true,
      count: chat.messages.length,
      data: chat.messages,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chats/:id/read
// @access  Private
export const markAsRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
      return;
    }

    // Mark all messages not sent by current user as read
    chat.messages.forEach((message: any) => {
      if (message.sender.toString() !== req.userId) {
        message.read = true;
      }
    });

    await chat.save();

    res.status(200).json({
      success: true,
      data: chat,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get all groups for user
// @route   GET /api/groups
// @access  Private
export const getGroups = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const groups = await Group.find({
      members: req.userId,
    })
      .populate('members', 'firstName lastName preferredName university profilePicture')
      .populate('project', 'title')
      .sort('-updatedAt');

    res.status(200).json({
      success: true,
      count: groups.length,
      data: groups,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Create group
// @route   POST /api/groups
// @access  Private
export const createGroup = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, members, project } = req.body;

    if (!name || !members || members.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Group name and members are required',
      });
      return;
    }

    // Add creator to members if not already included
    if (!members.includes(req.userId)) {
      members.push(req.userId);
    }

    const group = await Group.create({
      name,
      members,
      project,
      messages: [],
    });

    const populatedGroup = await Group.findById(group._id)
      .populate('members', 'firstName lastName preferredName university profilePicture')
      .populate('project', 'title');

    res.status(201).json({
      success: true,
      data: populatedGroup,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get group by ID
// @route   GET /api/groups/:id
// @access  Private
export const getGroup = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'firstName lastName preferredName university profilePicture')
      .populate('project', 'title');

    if (!group) {
      res.status(404).json({
        success: false,
        message: 'Group not found',
      });
      return;
    }

    // Check if user is a member
    const isMember = group.members.some(
      (m: any) => m._id.toString() === req.userId
    );

    if (!isMember) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view this group',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Send message in group
// @route   POST /api/groups/:id/messages
// @access  Private
export const sendGroupMessage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { text } = req.body;

    if (!text) {
      res.status(400).json({
        success: false,
        message: 'Message text is required',
      });
      return;
    }

    const group = await Group.findById(req.params.id);

    if (!group) {
      res.status(404).json({
        success: false,
        message: 'Group not found',
      });
      return;
    }

    // Check if user is a member
    const isMember = group.members.some(
      (m: any) => m.toString() === req.userId
    );

    if (!isMember) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this group',
      });
      return;
    }

    group.messages.push({
      sender: req.userId as any,
      text,
      createdAt: new Date(),
    });

    await group.save();

    const populatedGroup = await Group.findById(group._id)
      .populate('members', 'firstName lastName preferredName university profilePicture')
      .populate('messages.sender', 'firstName lastName preferredName');

    res.status(201).json({
      success: true,
      data: populatedGroup,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
