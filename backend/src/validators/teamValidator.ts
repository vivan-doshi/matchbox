import { body, param } from 'express-validator';

/**
 * Validation rules for creating a team
 */
export const createTeamValidation = [
  param('competitionId').isMongoId().withMessage('Invalid competition ID'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('Team name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Team name must be between 3 and 100 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Team description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('initialMembers')
    .optional()
    .isArray()
    .withMessage('Initial members must be an array'),

  body('initialMembers.*.email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address')
    .matches(/\.edu$/)
    .withMessage('Email must be from an educational institution (.edu)'),
];

/**
 * Validation rules for inviting a team member
 */
export const inviteTeamMemberValidation = [
  param('competitionId').isMongoId().withMessage('Invalid competition ID'),
  param('teamId').isMongoId().withMessage('Invalid team ID'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address')
    .matches(/\.edu$/)
    .withMessage('Email must be from an educational institution (.edu)'),
];

/**
 * Validation rules for updating team progress
 */
export const updateProgressValidation = [
  param('competitionId').isMongoId().withMessage('Invalid competition ID'),
  param('teamId').isMongoId().withMessage('Invalid team ID'),

  body('progressPercentage')
    .notEmpty()
    .withMessage('Progress percentage is required')
    .isInt({ min: 0, max: 100 })
    .withMessage('Progress percentage must be between 0 and 100'),

  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Comment is required')
    .isLength({ min: 5, max: 500 })
    .withMessage('Comment must be between 5 and 500 characters'),
];

/**
 * Validation rules for achieving a milestone
 */
export const achieveMilestoneValidation = [
  param('competitionId').isMongoId().withMessage('Invalid competition ID'),
  param('teamId').isMongoId().withMessage('Invalid team ID'),
  param('milestoneId').isMongoId().withMessage('Invalid milestone ID'),

  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Comment is required')
    .isLength({ min: 5, max: 1000 })
    .withMessage('Comment must be between 5 and 1000 characters'),

  body('deliverables')
    .optional()
    .isArray()
    .withMessage('Deliverables must be an array'),

  body('deliverables.*.type')
    .optional()
    .isIn(['file', 'link', 'document'])
    .withMessage('Invalid deliverable type'),

  body('deliverables.*.title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Deliverable title is required'),

  body('deliverables.*.url')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Deliverable URL is required'),
];

/**
 * Validation rules for final submission
 */
export const finalSubmissionValidation = [
  param('competitionId').isMongoId().withMessage('Invalid competition ID'),
  param('teamId').isMongoId().withMessage('Invalid team ID'),

  body('deliverables')
    .isArray({ min: 1 })
    .withMessage('At least one deliverable is required'),

  body('deliverables.*.type')
    .isIn(['file', 'link', 'document'])
    .withMessage('Invalid deliverable type'),

  body('deliverables.*.title')
    .trim()
    .notEmpty()
    .withMessage('Deliverable title is required'),

  body('deliverables.*.url')
    .trim()
    .notEmpty()
    .withMessage('Deliverable URL is required'),

  body('teamSummary')
    .trim()
    .notEmpty()
    .withMessage('Team summary is required')
    .isLength({ min: 50, max: 5000 })
    .withMessage('Team summary must be between 50 and 5000 characters'),

  body('contributionBreakdown')
    .isArray({ min: 1 })
    .withMessage('Contribution breakdown is required'),

  body('contributionBreakdown.*.userId')
    .isMongoId()
    .withMessage('Invalid user ID in contribution breakdown'),

  body('contributionBreakdown.*.percentage')
    .isInt({ min: 0, max: 100 })
    .withMessage('Contribution percentage must be between 0 and 100'),
];

/**
 * Validation rules for verifying a milestone (host only)
 */
export const verifyMilestoneValidation = [
  param('competitionId').isMongoId().withMessage('Invalid competition ID'),
  param('teamId').isMongoId().withMessage('Invalid team ID'),
  param('milestoneId').isMongoId().withMessage('Invalid milestone ID'),

  body('verified')
    .isBoolean()
    .withMessage('Verified must be a boolean'),

  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Feedback cannot exceed 1000 characters'),
];

/**
 * Validation rules for getting team details
 */
export const getTeamValidation = [
  param('competitionId').isMongoId().withMessage('Invalid competition ID'),
  param('teamId').isMongoId().withMessage('Invalid team ID'),
];

/**
 * Validation rules for listing teams
 */
export const listTeamsValidation = [
  param('competitionId').isMongoId().withMessage('Invalid competition ID'),
];
