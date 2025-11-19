import { Response } from 'express';
import Invitation from '../models/Invitation';
import Chat from '../models/Chat';
import Project from '../models/Project';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { createNotification } from '../utils/notificationHelper';

// @desc    Get received invitations for user
// @route   GET /api/invitations/received
// @access  Private
export const getReceivedInvitations = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const invitations = await Invitation.find({
      invitee: req.userId,
    })
      .populate('project', 'title description')
      .populate('inviter', 'firstName lastName preferredName profilePicture')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: invitations.length,
      data: invitations,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Accept invitation
// @route   PUT /api/invitations/:id/accept
// @access  Private
export const acceptInvitation = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const invitation = await Invitation.findById(req.params.id)
      .populate('project')
      .populate('inviter', 'firstName lastName preferredName');

    if (!invitation) {
      res.status(404).json({
        success: false,
        message: 'Invitation not found',
      });
      return;
    }

    // Check if user is the invitee
    if (invitation.invitee.toString() !== req.userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to accept this invitation',
      });
      return;
    }

    // Check if already responded
    if (invitation.status !== 'Pending') {
      res.status(400).json({
        success: false,
        message: `Invitation already ${invitation.status.toLowerCase()}`,
      });
      return;
    }

    // Update invitation status
    invitation.status = 'Accepted';
    await invitation.save();

    // Update related chat status
    await Chat.updateOne(
      { relatedInvitation: invitation._id },
      { status: 'Accepted' }
    );

    // Add user to project role if role was specified
    const project = invitation.project as any;
    if (invitation.role && project) {
      const projectDoc = await Project.findById(project._id);
      if (projectDoc) {
        const roleIndex = projectDoc.roles.findIndex(
          (r) => r.title === invitation.role
        );

        if (roleIndex !== -1) {
          // Check if role is already filled
          if (projectDoc.roles[roleIndex].filled) {
            console.warn(`[acceptInvitation] Role "${invitation.role}" already filled for project ${project._id}`);
          } else {
            projectDoc.roles[roleIndex].filled = true;
            projectDoc.roles[roleIndex].user = invitation.invitee;
            await projectDoc.save();
          }
        } else {
          console.warn(`[acceptInvitation] Role "${invitation.role}" not found in project ${project._id}`);
        }
      }
    }

    // Get inviter name for notification
    const inviter = invitation.inviter as any;
    const inviterName =
      inviter.preferredName ||
      `${inviter.firstName ?? ''} ${inviter.lastName ?? ''}`.trim() ||
      'Someone';

    // Notify inviter that invitation was accepted
    await createNotification({
      user: invitation.inviter.toString(),
      type: 'invitation_accepted',
      title: `${req.user?.preferredName || req.user?.firstName} accepted your invitation`,
      message: `Your invitation to join "${(invitation.project as any).title}" was accepted!`,
      actionUrl: `/project/${invitation.project}`,
      metadata: {
        projectId: invitation.project.toString(),
        inviteeId: req.userId,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Invitation accepted',
      data: invitation,
    });
  } catch (error: any) {
    console.error('[acceptInvitation] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Reject invitation
// @route   PUT /api/invitations/:id/reject
// @access  Private
export const rejectInvitation = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Please provide a reason for declining',
      });
      return;
    }

    const invitation = await Invitation.findById(req.params.id)
      .populate('project')
      .populate('inviter', 'firstName lastName preferredName');

    if (!invitation) {
      res.status(404).json({
        success: false,
        message: 'Invitation not found',
      });
      return;
    }

    // Check if user is the invitee
    if (invitation.invitee.toString() !== req.userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to reject this invitation',
      });
      return;
    }

    // Check if already responded
    if (invitation.status !== 'Pending') {
      res.status(400).json({
        success: false,
        message: `Invitation already ${invitation.status.toLowerCase()}`,
      });
      return;
    }

    // Update invitation status and reason
    invitation.status = 'Rejected';
    invitation.declineReason = reason;
    await invitation.save();

    // Update related chat status
    const chat = await Chat.findOne({ relatedInvitation: invitation._id });
    if (chat) {
      chat.status = 'Rejected';
      // Add decline reason as a message
      chat.messages.push({
        sender: req.userId,
        text: `Declined invitation. Reason: ${reason}`,
        read: false,
        createdAt: new Date(),
      } as any);
      await chat.save();
    }

    // Get inviter name for notification
    const inviter = invitation.inviter as any;
    const inviterName =
      inviter.preferredName ||
      `${inviter.firstName ?? ''} ${inviter.lastName ?? ''}`.trim() ||
      'Someone';

    // Notify inviter that invitation was rejected
    await createNotification({
      user: invitation.inviter.toString(),
      type: 'invitation_declined',
      title: `${req.user?.preferredName || req.user?.firstName} declined your invitation`,
      message: `Your invitation to join "${(invitation.project as any).title}" was declined.`,
      actionUrl: `/dashboard/chat?chatId=${chat?._id}`,
      metadata: {
        projectId: invitation.project.toString(),
        inviteeId: req.userId,
        chatId: chat?._id.toString(),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Invitation rejected',
      data: invitation,
    });
  } catch (error: any) {
    console.error('[rejectInvitation] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
