const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide an item name'],
      trim: true,
      maxlength: [100, 'Item name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['Books', 'Electronics', 'Sports', 'Tools', 'Lab Equipment', 'Others'],
      default: 'Others',
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Item must belong to an owner'],
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      default: null,
    },
    status: {
      type: String,
      enum: ['Available', 'Borrowed', 'Overdue'],
      default: 'Available',
    },
    currentLoan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Loan',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

itemSchema.index({ owner: 1, status: 1 });
itemSchema.index({ group: 1 });

module.exports = mongoose.model('Item', itemSchema);
