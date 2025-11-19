import { body, param, query } from 'express-validator';

/**
 * Validation rules for creating a competition
 */
export const createCompetitionValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 20, max: 5000 })
    .withMessage('Description must be between 20 and 5000 characters'),

  body('type')
    .notEmpty()
    .withMessage('Competition type is required')
    .isIn(['hackathon', 'case-competition', 'group-project'])
    .withMessage('Invalid competition type'),

  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Invalid start date format')
    .custom((value) => {
      const startDate = new Date(value);
      const now = new Date();
      if (startDate < now) {
        throw new Error('Start date must be in the future');
      }
      return true;
    }),

  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('Invalid end date format')
    .custom((value, { req }) => {
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(value);
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  body('maxTeamSize')
    .notEmpty()
    .withMessage('Maximum team size is required')
    .isInt({ min: 1, max: 20 })
    .withMessage('Maximum team size must be between 1 and 20'),

  body('minTeamSize')
    .notEmpty()
    .withMessage('Minimum team size is required')
    .isInt({ min: 1 })
    .withMessage('Minimum team size must be at least 1')
    .custom((value, { req }) => {
      if (value > req.body.maxTeamSize) {
        throw new Error('Minimum team size must be less than or equal to maximum team size');
      }
      return true;
    }),

  body('maxTeams')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum teams must be at least 1'),

  body('rules')
    .trim()
    .notEmpty()
    .withMessage('Competition rules are required')
    .isLength({ max: 5000 })
    .withMessage('Rules cannot exceed 5000 characters'),

  body('objectives')
    .trim()
    .notEmpty()
    .withMessage('Competition objectives are required')
    .isLength({ max: 5000 })
    .withMessage('Objectives cannot exceed 5000 characters'),

  body('evaluationCriteria')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Evaluation criteria cannot exceed 5000 characters'),

  body('prize')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Prize description cannot exceed 500 characters'),

  body('milestones')
    .isArray({ min: 1 })
    .withMessage('At least one milestone is required'),

  body('milestones.*.order')
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage('Milestone order must be a positive integer'),

  body('milestones.*.title')
    .trim()
    .notEmpty()
    .withMessage('Milestone title is required'),

  body('milestones.*.description')
    .trim()
    .notEmpty()
    .withMessage('Milestone description is required'),

  body('milestones.*.dueDate')
    .notEmpty()
    .isISO8601()
    .withMessage('Invalid milestone due date format'),

  body('milestones.*.weight')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Milestone weight must be between 0 and 100'),

  body('milestones.*.isRequired')
    .optional()
    .isBoolean()
    .withMessage('isRequired must be a boolean'),

  body('requiresHostApproval')
    .optional()
    .isBoolean()
    .withMessage('requiresHostApproval must be a boolean'),

  body('allowSelfTeams')
    .optional()
    .isBoolean()
    .withMessage('allowSelfTeams must be a boolean'),
];

/**
 * Validation rules for updating a competition
 */
export const updateCompetitionValidation = [
  param('id').isMongoId().withMessage('Invalid competition ID'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Description must be between 20 and 5000 characters'),

  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),

  body('rules')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Rules cannot exceed 5000 characters'),

  body('objectives')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Objectives cannot exceed 5000 characters'),

  body('evaluationCriteria')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Evaluation criteria cannot exceed 5000 characters'),

  body('prize')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Prize description cannot exceed 500 characters'),
];

/**
 * Validation rules for getting competition by ID
 */
export const getCompetitionByIdValidation = [
  param('id').isMongoId().withMessage('Invalid competition ID'),
];

/**
 * Validation rules for listing competitions
 */
export const listCompetitionsValidation = [
  query('status')
    .optional()
    .isIn(['draft', 'open', 'in-progress', 'closed', 'archived'])
    .withMessage('Invalid status'),

  query('type')
    .optional()
    .isIn(['hackathon', 'case-competition', 'group-project'])
    .withMessage('Invalid competition type'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
];
