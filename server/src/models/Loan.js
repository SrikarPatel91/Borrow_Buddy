const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Loan must reference an item'],
    },
    lender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Loan must specify the lender'],
    },
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    borrowerName: {
      type: String,
      required: [true, 'Please provide the borrower name'],
      trim: true,
    },
    borrowerEmail: {
      type: String,
      trim: true,
      default: '',
    },
    checkoutDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, 'Please provide a due date'],
    },
    returnedDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Active', 'Returned', 'Overdue'],
      default: 'Active',
    },
    checkoutNote: {
      type: String,
      trim: true,
      default: '',
    },
    returnNote: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

loanSchema.index({ lender: 1, status: 1 });
loanSchema.index({ item: 1 });

module.exports = mongoose.model('Loan', loanSchema);
