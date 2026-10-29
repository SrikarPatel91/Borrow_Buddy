const Loan = require('../models/Loan');
const Item = require('../models/Item');
const User = require('../models/User');
const Activity = require('../models/Activity');

// Helper to calculate days difference
const getDaysDiff = (date1, date2) => {
  const diffTime = Math.abs(new Date(date2) - new Date(date1));
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// @desc    Borrow an item / Create a new loan
// @route   POST /api/loans/borrow
// @access  Private
const borrowItem = async (req, res, next) => {
  try {
    const { itemId, borrowerId, borrowerName, borrowerEmail, dueDate, checkoutDate, note } = req.body;

    if (!itemId) {
      return res.status(400).json({ success: false, message: 'Item ID is required' });
    }

    if (!dueDate) {
      return res.status(400).json({ success: false, message: 'Due date is required' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Business Logic: Only available items can be borrowed
    if (item.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: `This item is currently ${item.status.toLowerCase()} and cannot be borrowed`,
      });
    }

    // Check if there is already an active loan for this item
    const existingActiveLoan = await Loan.findOne({
      item: itemId,
      status: { $in: ['Active', 'Overdue'] },
    });

    if (existingActiveLoan) {
      return res.status(400).json({
        success: false,
        message: 'This item already has an active loan recorded',
      });
    }

    let finalBorrowerName = borrowerName ? borrowerName.trim() : '';
    let finalBorrowerEmail = borrowerEmail ? borrowerEmail.trim() : '';
    let finalBorrowerId = null;

    if (borrowerId) {
      const bUser = await User.findById(borrowerId);
      if (bUser) {
        finalBorrowerId = bUser._id;
        finalBorrowerName = bUser.name;
        finalBorrowerEmail = bUser.email;
      }
    }

    if (!finalBorrowerName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide or select a borrower name',
      });
    }

    const loanCheckoutDate = checkoutDate ? new Date(checkoutDate) : new Date();
    const loanDueDate = new Date(dueDate);

    // Create loan
    const loan = await Loan.create({
      item: item._id,
      lender: req.user._id,
      borrower: finalBorrowerId,
      borrowerName: finalBorrowerName,
      borrowerEmail: finalBorrowerEmail,
      checkoutDate: loanCheckoutDate,
      dueDate: loanDueDate,
      checkoutNote: note || '',
      status: 'Active',
    });

    // Update item
    item.status = 'Borrowed';
    item.currentLoan = loan._id;
    await item.save();

    // Calculate due subtitle
    const daysUntilDue = Math.ceil((loanDueDate - new Date()) / (1000 * 60 * 60 * 24));
    let dueSubtitle = '';
    if (daysUntilDue > 0) {
      dueSubtitle = `Due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`;
    } else if (daysUntilDue === 0) {
      dueSubtitle = 'Due today';
    } else {
      dueSubtitle = `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) > 1 ? 's' : ''}`;
    }

    // Record activity
    await Activity.create({
      user: req.user._id,
      type: 'borrow',
      title: `${item.name} borrowed by ${finalBorrowerName}`,
      subtitle: `${new Date(loanCheckoutDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} • ${dueSubtitle}`,
      item: item._id,
      loan: loan._id,
    });

    const populatedLoan = await Loan.findById(loan._id)
      .populate('item')
      .populate('borrower', 'name email');

    res.status(201).json({
      success: true,
      message: 'Loan recorded successfully',
      data: populatedLoan,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Return an item
// @route   POST /api/loans/:id/return
// @access  Private
const returnItem = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('item');

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan record not found' });
    }

    if (loan.status === 'Returned') {
      return res.status(400).json({
        success: false,
        message: 'This loan has already been marked as returned',
      });
    }

    const { returnDate, note } = req.body;
    const finalReturnDate = returnDate ? new Date(returnDate) : new Date();

    loan.returnedDate = finalReturnDate;
    loan.status = 'Returned';
    if (note) loan.returnNote = note.trim();
    await loan.save();

    // Update item status back to Available
    if (loan.item) {
      await Item.findByIdAndUpdate(loan.item._id, {
        status: 'Available',
        currentLoan: null,
      });
    }

    // Record activity
    await Activity.create({
      user: req.user._id,
      type: 'return',
      title: `${loan.item?.name || 'Item'} returned by ${loan.borrowerName}`,
      subtitle: `${new Date(finalReturnDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`,
      item: loan.item?._id,
      loan: loan._id,
    });

    res.status(200).json({
      success: true,
      message: 'Item returned successfully',
      data: loan,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get loans (Active, Overdue, Returned)
// @route   GET /api/loans
// @access  Private
const getLoans = async (req, res, next) => {
  try {
    const { status, type } = req.query;

    let filter = { lender: req.user._id };

    if (status && status !== 'All') {
      filter.status = status;
    } else if (type === 'active-tab') {
      // For active tab in Active Loans view
      filter.status = { $in: ['Active', 'Overdue'] };
    }

    let loans = await Loan.find(filter)
      .populate('item')
      .populate('borrower', 'name email phone')
      .sort({ createdAt: -1 });

    // Update overdue on active loans
    const now = new Date();
    for (let loan of loans) {
      if (loan.status === 'Active' && new Date(loan.dueDate) < now) {
        loan.status = 'Overdue';
        await Loan.findByIdAndUpdate(loan._id, { status: 'Overdue' });
        if (loan.item) {
          await Item.findByIdAndUpdate(loan.item._id, { status: 'Overdue' });
        }
      }
    }

    res.status(200).json({
      success: true,
      count: loans.length,
      data: loans,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complete borrowing history with date filters
// @route   GET /api/loans/history
// @access  Private
const getLoanHistory = async (req, res, next) => {
  try {
    const { timeframe } = req.query; // '30', '60', 'all'

    let filter = { lender: req.user._id };

    if (timeframe === '30') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filter.checkoutDate = { $gte: thirtyDaysAgo };
    } else if (timeframe === '60') {
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      filter.checkoutDate = { $gte: sixtyDaysAgo };
    }

    const loans = await Loan.find(filter)
      .populate('item')
      .populate('borrower', 'name email')
      .sort({ checkoutDate: -1 });

    res.status(200).json({
      success: true,
      count: loans.length,
      data: loans,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  borrowItem,
  returnItem,
  getLoans,
  getLoanHistory,
};
