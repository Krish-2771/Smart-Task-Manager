const User = require('../models/User');
const Task = require('../models/Task');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

    // Attach task counts
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const totalTasks = await Task.countDocuments({ userId: user._id });
        const completedTasks = await Task.countDocuments({ userId: user._id, status: 'Completed' });
        return {
          ...user.toObject(),
          totalTasks,
          completedTasks,
        };
      })
    );

    res.json({ users: usersWithStats, total: users.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all tasks of user too
    await Task.deleteMany({ userId: req.params.id });
    await user.deleteOne();

    res.json({ message: `User "${user.name}" and all their tasks have been deleted` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tasks (admin)
// @route   GET /api/admin/tasks
// @access  Admin
const getAllTasks = async (req, res) => {
  try {
    const { userId, priority, status, category } = req.query;

    const query = {};
    if (userId) query.userId = userId;
    if (priority) query.priority = priority;
    if (status) query.status = status;
    if (category) query.category = category;

    const tasks = await Task.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ tasks, total: tasks.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalTasks = await Task.countDocuments();

    // Tasks completed today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tasksCompletedToday = await Task.countDocuments({
      status: 'Completed',
      completedAt: { $gte: todayStart },
    });

    // Priority distribution
    const priorityDist = await Task.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    // Status distribution
    const statusDist = await Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Tasks per user (top 10)
    const tasksPerUser = await Task.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $project: { name: '$user.name', email: '$user.email', count: 1 } },
    ]);

    // Productivity trend (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const completed = await Task.countDocuments({
        status: 'Completed',
        completedAt: { $gte: date, $lt: nextDate },
      });
      const created = await Task.countDocuments({
        createdAt: { $gte: date, $lt: nextDate },
      });

      last7Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed,
        created,
      });
    }

    res.json({
      totalUsers,
      totalTasks,
      tasksCompletedToday,
      priorityDist,
      statusDist,
      tasksPerUser,
      productivityTrend: last7Days,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Admin
const toggleUserStatus = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot modify your own status' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllUsers, deleteUser, getAllTasks, getAdminStats, toggleUserStatus };
