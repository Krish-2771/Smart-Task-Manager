const Task = require('../models/Task');

// @desc    Get all tasks for logged-in user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { priority, status, category, sort, search } = req.query;

    const query = { userId: req.user._id };

    if (priority) query.priority = priority;
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'deadline') sortOption = { deadline: 1 };
    if (sort === 'priority') {
      // Custom priority sort: High > Medium > Low
      sortOption = { priority: -1 };
    }

    const tasks = await Task.find(query).sort(sortOption);

    // Compute stats
    const now = new Date();
    const stats = {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 'Completed').length,
      pending: tasks.filter((t) => t.status === 'Pending').length,
      inProgress: tasks.filter((t) => t.status === 'In Progress').length,
      overdue: tasks.filter((t) => t.status !== 'Completed' && new Date(t.deadline) < now).length,
    };

    res.json({ tasks, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, deadline, priority, category, status, estimatedTime, tags, reminder } = req.body;

    const task = await Task.create({
      userId: req.user._id,
      title,
      description,
      deadline,
      priority: priority || 'Medium',
      category: category || 'Work',
      status: status || 'Pending',
      estimatedTime,
      tags: tags || [],
      reminder: reminder || false,
    });

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    const updates = req.body;

    // If marking as completed, set completedAt
    if (updates.status === 'Completed' && task.status !== 'Completed') {
      updates.completedAt = new Date();
    }
    if (updates.status && updates.status !== 'Completed') {
      updates.completedAt = null;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Task updated successfully', task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, getTaskById };
