const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask, getTaskById } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { taskValidation, taskUpdateValidation } = require('../middleware/validationMiddleware');

router.use(protect);

router.route('/').get(getTasks).post(taskValidation, createTask);
router.route('/:id').get(getTaskById).put(taskUpdateValidation, updateTask).delete(deleteTask);

module.exports = router;
