const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// Register validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase, one lowercase, and one number'),

  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your password')
    .custom((value, { req }) => {
      if (value !== req.body.password) throw new Error('Passwords do not match');
      return true;
    }),

  body('role')
    .optional()
    .isIn(['user', 'admin']).withMessage('Role must be either user or admin'),

  handleValidationErrors,
];

// Login validation rules
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),

  handleValidationErrors,
];

// Task validation rules
const taskValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3–100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

  body('deadline')
    .notEmpty().withMessage('Deadline is required')
    .isISO8601().withMessage('Deadline must be a valid date')
    .custom((value) => {
      if (new Date(value) < new Date()) throw new Error('Deadline cannot be in the past');
      return true;
    }),

  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High']).withMessage('Priority must be Low, Medium, or High'),

  body('category')
    .optional()
    .isIn(['Work', 'Study', 'Personal', 'Other']).withMessage('Invalid category'),

  body('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Completed']).withMessage('Invalid status'),

  body('estimatedTime')
    .optional()
    .isFloat({ min: 0.5, max: 999 }).withMessage('Estimated time must be between 0.5 and 999 hours'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),

  handleValidationErrors,
];

// Task update validation (deadline can be in past for already existing tasks)
const taskUpdateValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3–100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

  body('deadline')
    .optional()
    .isISO8601().withMessage('Deadline must be a valid date'),

  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High']).withMessage('Priority must be Low, Medium, or High'),

  body('category')
    .optional()
    .isIn(['Work', 'Study', 'Personal', 'Other']).withMessage('Invalid category'),

  body('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Completed']).withMessage('Invalid status'),

  body('estimatedTime')
    .optional()
    .isFloat({ min: 0.5, max: 999 }).withMessage('Estimated time must be between 0.5 and 999 hours'),

  handleValidationErrors,
];

module.exports = {
  registerValidation,
  loginValidation,
  taskValidation,
  taskUpdateValidation,
};
