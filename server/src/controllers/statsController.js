const Item = require('../models/Item');
const Loan = require('../models/Loan');
const Group = require('../models/Group');
const Activity = require('../models/Activity');

// @desc    Get dashboard metrics and counts
// @route   GET /api/stats/dashboard
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Groups user is a member of
    const userGroups = await Group.find({ members: userId }).select('_id');
    const groupIds = userGroups.map((g) => g._id);

    // Items filter
    const itemFilter = {
      $or: [{ owner: userId }, { group: { $in: groupIds } }],
    };

    const totalItems = await Item.countDocuments(itemFilter);
    const availableItems = await Item.countDocuments({ ...itemFilter, status: 'Available' });

    // Synchronize overdue loans before counting
    const now = new Date();
    await Loan.updateMany(
      { lender: userId, status: 'Active', dueDate: { $lt: now } },
      { status: 'Overdue' }
    );

    const activeLoans = await Loan.countDocuments({ lender: userId, status: 'Active' });
    const overdueLoans = await Loan.countDocuments({ lender: userId, status: 'Overdue' });
    const groupsCount = userGroups.length;

    // Recent activities
    const recentActivities = await Activity.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('item', 'name category')
      .populate('loan');

    res.status(200).json({
      success: true,
      data: {
        totalItems,
        availableItems,
        activeLoans,
        overdueLoans,
        groups: groupsCount,
        recentActivities,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
