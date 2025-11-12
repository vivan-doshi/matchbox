import { Response } from 'express';
import Project from '../models/Project';
import Application from '../models/Application';
import User from '../models/User';
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

    res.status(201).json({
      success: true,
      data: createdApplications,
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
    const { status } = req.body;

    const application = await Application.findById(req.params.applicationId);

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
    await application.save();

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
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error: any) {
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

    const { inviteeId, message } = req.body;

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

    await createNotification({
      user: inviteeId,
      type: 'project_invite',
      title: `Invitation to join ${project.title}`,
      message:
        message ||
        `${inviterName} invited you to join "${project.title}".`,
      actionUrl: `/project/${project._id}`,
      metadata: {
        projectId: project._id,
        inviterId: req.userId,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Invitation sent successfully',
    });
  } catch (error: any) {
    console.error('[inviteUserToProject] Error sending invitation:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
