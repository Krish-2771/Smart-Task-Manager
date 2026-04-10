const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, getAllTasks, getAdminStats, toggleUserStatus } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.get('/tasks', getAllTasks);

module.exports = router;
