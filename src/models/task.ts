const mongoose = require('mongoose');

export const Task = mongoose.model('Task', {
  header: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  Date: {
    type: Date,
  },
  completed: {
    type: Boolean,
    default: false
  }
})

exports = {
  Task
}