const Activity = require('../models/Activity');

// @desc    Get user activity log
// @route   GET /api/activities
// @access  Private
const getActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('item', 'name category')
      .populate('loan');

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivities,
};
