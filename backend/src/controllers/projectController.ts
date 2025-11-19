import { Response } from 'express';
import Project from '../models/Project';
import Application from '../models/Application';
import Invitation from '../models/Invitation';
import User from '../models/User';
import Chat from '../models/Chat';
import { AuthRequest } from '../middleware/auth';
import { createNotification } from '../utils/notificationHelper';

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
export const getProjects = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { search, tags, category, status } = req.query;

    let query: any = {};

    if (search) {
      query.$text = { $search: search as string };
    }

    if (category) {
      query.category = category;
    }

    if (tags) {
      const tagArray = (tags as string).split(',');
      query.tags = { $in: tagArray };
    }

    if (status) {
      query.status = status;
    }

    const projects = await Project.find(query)
      .populate('creator', 'firstName lastName preferredName university profilePicture')
      .populate('roles.user', 'firstName lastName preferredName profilePicture')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
export const getProject = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('creator', 'firstName lastName preferredName university profilePicture bio skills professionalLinks')
      .populate('roles.user', 'firstName lastName preferredName profilePicture university');

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
export const createProject = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      description,
      category,
      tags,
      timeCommitment,
      duration,
      roles,
      creatorRole,
      existingMembers,
      startDate,
      deadline
    } = req.body;

    console.log('[createProject] Creating project with data:', {
      title,
      category,
      timeCommitment,
      duration,
      rolesCount: roles?.length,
      creatorRole,
      existingMembersCount: existingMembers?.length,
    });

    const project = await Project.create({
      title,
      description,
      category,
      tags,
      timeCommitment,
      duration,
      roles,
      creatorRole,
      existingMembers,
      startDate,
      deadline,
      creator: req.userId,
    });

    const populatedProject = await Project.findById(project._id).populate(
      'creator',
      'firstName lastName preferredName university profilePicture'
    );

    console.log('[createProject] Project created successfully:', populatedProject?._id);

    res.status(201).json({
      success: true,
      data: populatedProject,
    });
  } catch (error: any) {
    console.error('[createProject] Error creating project:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found',
      });
      return;
    }

    // Check if user is the project creator
    if (project.creator.toString() !== req.userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this project',
      });
      return;
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('creator', 'firstName lastName preferredName university profilePicture');

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found',
      });
      return;
    }

    // Check if user is the project creator
    if (project.creator.toString() !== req.userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project',
      });
      return;
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Apply to project role
// @route   POST /api/projects/:id/apply
// @access  Private
export const applyToProject = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { roles, message } = req.body;

    if (!Array.isArray(roles) || roles.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Please select at least one role to apply for',
      });
      return;
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found',
      });
      return;
    }

    for (const roleTitle of roles) {
      const existingApplication = await Application.findOne({
        project: req.params.id,
        user: req.userId,
        role: roleTitle,
      });

      if (existingApplication) {
        res.status(400).json({
          success: false,
          message: `You have already applied for the ${roleTitle} role`,
        });
        return;
      }

      const targetRole = project.roles.find((projectRole) => projectRole.title === roleTitle);

      if (!targetRole) {
        res.status(400).json({
          success: false,
          message: `Role ${roleTitle} does not exist for this project`,
        });
        return;
      }

      if (targetRole.filled) {
        res.status(400).json({
          success: false,
          message: `Role ${roleTitle} has already been filled`,
        });
        return;
      }
    }

    // Calculate fit score based on user skills and role requirements
    const user = await User.findById(req.userId);
    let fitScore: 'High' | 'Medium' | 'Low' = 'Medium';

    // Simple fit scoring logic based on number of skills and proficiency levels
    if (user && user.skills && user.skills.length > 0) {
      const proficiencyScore = {
        'Beginner': 1,
        'Intermediate': 2,
        'Fluent': 3,
        'Expert': 4
      };

      const avgScore = user.skills.reduce((sum, skill) =>
        sum + proficiencyScore[skill.proficiency], 0) / user.skills.length;

      if (avgScore >= 3) fitScore = 'High';
      else if (avgScore < 2) fitScore = 'Low';
    }

    const createdApplications = [];

    for (const roleTitle of roles) {
      const application = await Application.create({
        project: req.params.id,
        user: req.userId,
        role: roleTitle,
        message,
        fitScore,
      });

      const populatedApplication = await Application.findById(application._id).populate(
        'user',
        'firstName lastName preferredName university profilePicture skills'
      );

      createdApplications.push(populatedApplication);
    }

    // Create or get existing application chat with project creator
    const applicantName =
      user?.preferredName ||
      `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() ||
      'A user';

    let chat = await Chat.findOne({
      participants: { $all: [req.userId, project.creator] },
      type: 'application',
      relatedProject: project._id,
    });

    const applicationMessage = message || `Hi! I'm interested in joining "${project.title}". I've applied for the following role(s): ${roles.join(', ')}. I'd love to discuss how I can contribute!`;

    if (!chat) {
      chat = await Chat.create({
        participants: [req.userId, project.creator],
        type: 'application',
        relatedProject: project._id,
        relatedApplication: createdApplications[0]?._id,
        messages: [
          {
            sender: req.userId,
            text: applicationMessage,
            read: false,
            createdAt: new Date(),
          },
        ],
      });
    } else {
      // Add new application message to existing chat
      chat.messages.push({
        sender: req.userId,
        text: applicationMessage,
        read: false,
        createdAt: new Date(),
      } as any);
      await chat.save();
    }

    // Send notification to project creator
    await createNotification({
      user: project.creator.toString(),
      type: 'project_application',
      title: `New application for ${project.title}`,
      message: `${applicantName} applied for: ${roles.join(', ')}`,
      actionUrl: `/dashboard/chat?chatId=${chat._id}`,
      metadata: {
        projectId: project._id,
        applicantId: req.userId,
        chatId: chat._id,
        applicationIds: createdApplications.map((app) => app._id),
      },
    });

    res.status(201).json({
      success: true,
      data: createdApplications,
      chatId: chat._id,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get project applicants
// @route   GET /api/projects/:id/applicants
// @access  Private
export const getProjectApplicants = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found',
      });
      return;
    }

    // Check if user is the project creator
    if (project.creator.toString() !== req.userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view applicants',
      });
      return;
    }

    const applicants = await Application.find({
      project: req.params.id,
      status: 'Pending',
    }).populate('user', 'firstName lastName preferredName university profilePicture skills bio');

    res.status(200).json({
      success: true,
      count: applicants.length,
      data: applicants,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get current user's applications for a project
// @route   GET /api/projects/:id/my-applications
// @access  Private
export const getMyApplications = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: 'Not authorized to view applications',
      });
      return;
    }

    const applications = await Application.find({
      project: req.params.id,
      user: req.userId,
    })
      .populate('user', 'firstName lastName preferredName university profilePicture')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Accept/Reject application
// @route   PUT /api/projects/:id/applicants/:applicationId
// @access  Private
export const updateApplicationStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status, declineReason } = req.body;

    if (status === 'Rejected' && (!declineReason || declineReason.trim().length === 0)) {
      res.status(400).json({
        success: false,
        message: 'Please provide a reason for declining',
      });
      return;
    }

    const application = await Application.findById(req.params.applicationId)
      .populate('user', 'firstName lastName preferredName');

    if (!application) {
      res.status(404).json({
        success: false,
        message: 'Application not found',
      });
      return;
    }

    const project = await Project.findById(application.project);

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found',
      });
      return;
    }

    // Check if user is the project creator
    if (project.creator.toString() !== req.userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update application',
      });
      return;
    }

    application.status = status;
    if (status === 'Rejected') {
      application.declineReason = declineReason;
    }
    await application.save();

    // Update related chat status
    const chat = await Chat.findOne({ relatedApplication: application._id });
    if (chat) {
      chat.status = status;

      // Add decline reason as a message if rejected
      if (status === 'Rejected') {
        chat.messages.push({
          sender: req.userId,
          text: `Application declined. Reason: ${declineReason}`,
          read: false,
          createdAt: new Date(),
        } as any);
      }

      await chat.save();
    }

    // If accepted, add user to project role
    if (status === 'Accepted') {
      const roleIndex = project.roles.findIndex(
        (r) => r.title === application.role
      );

      if (roleIndex !== -1) {
        project.roles[roleIndex].filled = true;
        project.roles[roleIndex].user = application.user;
        await project.save();
      }

      // Notify applicant of acceptance
      const applicant = application.user as any;
      await createNotification({
        user: application.user.toString(),
        type: 'application_accepted',
        title: `Application accepted for ${project.title}`,
        message: `Your application for the role of ${application.role} has been accepted!`,
        actionUrl: `/project/${project._id}`,
        metadata: {
          projectId: project._id.toString(),
          applicationId: application._id.toString(),
        },
      });
    } else if (status === 'Rejected') {
      // Notify applicant of rejection
      await createNotification({
        user: application.user.toString(),
        type: 'application_declined',
        title: `Application update for ${project.title}`,
        message: `Your application for the role of ${application.role} was not accepted.`,
        actionUrl: `/dashboard/chat?chatId=${chat?._id}`,
        metadata: {
          projectId: project._id.toString(),
          applicationId: application._id.toString(),
          chatId: chat?._id.toString(),
        },
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error: any) {
    console.error('[updateApplicationStatus] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Remove a team member from a role
// @route   DELETE /api/projects/:id/roles/:roleId/member
// @access  Private (project creator)
export const removeTeamMember = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id: projectId, roleId } = req.params as { id: string; roleId: string };

    const project = await Project.findById(projectId).populate(
      'roles.user',
      'firstName lastName preferredName university profilePicture'
    );

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found',
      });
      return;
    }

    if (project.creator.toString() !== req.userId) {
      res.status(403).json({
        success: false,
        message: 'Only the project creator can remove team members',
      });
      return;
    }

    const role: any = (project.roles as any).id(roleId);

    if (!role) {
      res.status(404).json({
        success: false,
        message: 'Role not found',
      });
      return;
    }

    role.user = undefined;
    role.filled = false;
    await project.save();
    await project.populate('roles.user', 'firstName lastName preferredName university profilePicture');

    res.status(200).json({
      success: true,
      message: 'Team member removed successfully',
      data: project,
    });
  } catch (error: any) {
    console.error('Error removing team member:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get recommended users for project
// @route   GET /api/projects/:id/recommendations
// @access  Private
export const getProjectRecommendations = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found',
      });
      return;
    }

    // Simple recommendation: find users with matching category/interests
    const searchInterests = project.tags && project.tags.length > 0
      ? project.tags
      : [project.category];

    const users = await User.find({
      _id: { $ne: project.creator },
      interests: { $in: searchInterests },
    })
      .select('firstName lastName preferredName university profilePicture skills interests')
      .limit(10);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get user's created projects
// @route   GET /api/projects/my-projects
// @access  Private
export const getMyProjects = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const projects = await Project.find({ creator: req.userId })
      .populate('creator', 'firstName lastName preferredName university profilePicture')
      .populate('roles.user', 'firstName lastName preferredName profilePicture university')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get projects the user has joined (as a team member)
// @route   GET /api/projects/joined
// @access  Private
export const getJoinedProjects = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
      return;
    }

    const projects = await Project.find({
      'roles.user': req.userId,
      creator: { $ne: req.userId },
    })
      .populate('creator', 'firstName lastName preferredName university profilePicture')
      .populate('roles.user', 'firstName lastName preferredName profilePicture university')
      .sort('-updatedAt');

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error: any) {
    console.error('[getJoinedProjects] Error fetching joined projects:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Invite a user to join a project
// @route   POST /api/projects/:id/invite
// @access  Private (project creator)
export const inviteUserToProject = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
      return;
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found',
      });
      return;
    }

    if (project.creator.toString() !== req.userId) {
      res.status(403).json({
        success: false,
        message: 'Only the project creator can send invitations',
      });
      return;
    }

    const { inviteeId, message, role } = req.body;

    if (!inviteeId) {
      res.status(400).json({
        success: false,
        message: 'Invitee ID is required',
      });
      return;
    }

    if (inviteeId === req.userId) {
      res.status(400).json({
        success: false,
        message: 'You cannot invite yourself',
      });
      return;
    }

    // Validate role if provided
    if (role) {
      const roleExists = project.roles.some((r) => r.title === role);
      if (!roleExists) {
        res.status(400).json({
          success: false,
          message: `Role "${role}" does not exist in this project`,
        });
        return;
      }

      // Check if role is already filled
      const roleData = project.roles.find((r) => r.title === role);
      if (roleData?.filled) {
        res.status(400).json({
          success: false,
          message: `Role "${role}" is already filled`,
        });
        return;
      }
    }

    const invitee = await User.findById(inviteeId).select('firstName lastName preferredName');

    if (!invitee) {
      res.status(404).json({
        success: false,
        message: 'Invitee not found',
      });
      return;
    }

    const inviterName =
      req.user?.preferredName ||
      `${req.user?.firstName ?? ''} ${req.user?.lastName ?? ''}`.trim() ||
      'A teammate';

    // Check if invitation already exists
    const existingInvitation = await Invitation.findOne({
      project: project._id,
      invitee: inviteeId,
    });

    if (existingInvitation) {
      res.status(400).json({
        success: false,
        message: 'An invitation to this user already exists for this project',
      });
      return;
    }

    // Create invitation record with role
    const invitation = await Invitation.create({
      project: project._id,
      inviter: req.userId,
      invitee: inviteeId,
      role: role || undefined,
      message,
      status: 'Pending',
    });

    // Create or get existing invitation chat
    let chat = await Chat.findOne({
      participants: { $all: [req.userId, inviteeId] },
      type: 'invitation',
      relatedProject: project._id,
    });

    const roleText = role ? ` for the role of ${role}` : '';
    const defaultMessage = `Hi! I'd like to invite you to join my project "${project.title}"${roleText}. I think you'd be a great fit!`;

    if (!chat) {
      chat = await Chat.create({
        participants: [req.userId, inviteeId],
        type: 'invitation',
        relatedProject: project._id,
        relatedInvitation: invitation._id,
        status: 'Pending',
        messages: [
          {
            sender: req.userId,
            text: message || defaultMessage,
            read: false,
            createdAt: new Date(),
          },
        ],
      });
    } else {
      // Update chat with new invitation reference
      chat.relatedInvitation = invitation._id;
      chat.status = 'Pending';
      // Add new invitation message to existing chat
      chat.messages.push({
        sender: req.userId,
        text: message || defaultMessage,
        read: false,
        createdAt: new Date(),
      } as any);
      await chat.save();
    }

    // Create notification with link to chat
    await createNotification({
      user: inviteeId,
      type: 'project_invite',
      title: `Invitation to join ${project.title}${roleText}`,
      message:
        message ||
        `${inviterName} invited you to join "${project.title}"${roleText}.`,
      actionUrl: `/dashboard/chat?chatId=${chat._id}`,
      metadata: {
        projectId: project._id,
        inviterId: req.userId,
        chatId: chat._id,
        invitationId: invitation._id.toString(),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Invitation sent successfully',
      data: { chatId: chat._id },
    });
  } catch (error: any) {
    console.error('[inviteUserToProject] Error sending invitation:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
