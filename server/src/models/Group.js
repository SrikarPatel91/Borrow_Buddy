const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a group name'],
      trim: true,
      maxlength: [60, 'Group name cannot exceed 60 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for fast lookup by member
groupSchema.index({ members: 1 });

module.exports = mongoose.model('Group', groupSchema);
