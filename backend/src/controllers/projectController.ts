import { Response } from 'express';
import Project from '../models/Project';
import Application from '../models/Application';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
export const getProjects = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { search, tags, status } = req.query;

    let query: any = {};

    if (search) {
      query.$text = { $search: search as string };
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
    const { title, description, tags, roles, startDate, deadline } = req.body;

    const project = await Project.create({
      title,
      description,
      tags,
      roles,
      startDate,
      deadline,
      creator: req.userId,
    });

    const populatedProject = await Project.findById(project._id).populate(
      'creator',
      'firstName lastName preferredName university profilePicture'
    );

    res.status(201).json({
      success: true,
      data: populatedProject,
    });
  } catch (error: any) {
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
    const { role, message } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found',
      });
      return;
    }

    // Check if user already applied for this role
    const existingApplication = await Application.findOne({
      project: req.params.id,
      user: req.userId,
      role,
    });

    if (existingApplication) {
      res.status(400).json({
        success: false,
        message: 'You have already applied for this role',
      });
      return;
    }

    // Calculate fit score based on user skills and role requirements
    const user = await User.findById(req.userId);
    let fitScore: 'High' | 'Medium' | 'Low' = 'Medium';

    // Simple fit scoring logic (can be enhanced)
    if (user) {
      const avgSkill =
        (user.skills.programming +
          user.skills.design +
          user.skills.marketing +
          user.skills.writing +
          user.skills.research) /
        5;
      if (avgSkill >= 7) fitScore = 'High';
      else if (avgSkill < 4) fitScore = 'Low';
    }

    const application = await Application.create({
      project: req.params.id,
      user: req.userId,
      role,
      message,
      fitScore,
    });

    const populatedApplication = await Application.findById(
      application._id
    ).populate('user', 'firstName lastName preferredName university profilePicture skills');

    res.status(201).json({
      success: true,
      data: populatedApplication,
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

    // Simple recommendation: find users with matching tags/skills
    const users = await User.find({
      _id: { $ne: project.creator },
      interests: { $in: project.tags },
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
