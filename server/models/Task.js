const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    category: {
      type: String,
      enum: ['Work', 'Study', 'Personal', 'Other'],
      default: 'Work',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },
    estimatedTime: {
      type: Number,
      min: [0.5, 'Estimated time must be at least 0.5 hours'],
      max: [999, 'Estimated time cannot exceed 999 hours'],
    },
    tags: {
      type: [String],
      default: [],
    },
    reminder: {
      type: Boolean,
      default: false,
    },
    fileAttachment: {
      type: String,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Virtual for isOverdue
taskSchema.virtual('isOverdue').get(function () {
  return this.status !== 'Completed' && new Date() > this.deadline;
});

taskSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);
