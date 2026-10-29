const Item = require('../models/Item');
const Group = require('../models/Group');
const Loan = require('../models/Loan');
const Activity = require('../models/Activity');

// Helper to check and synchronize overdue items
const syncItemStatus = async (item) => {
  if (item.status === 'Borrowed' && item.currentLoan) {
    const loan = await Loan.findById(item.currentLoan);
    if (loan && loan.status !== 'Returned' && new Date(loan.dueDate) < new Date()) {
      item.status = 'Overdue';
      await item.save();
      loan.status = 'Overdue';
      await loan.save();
    }
  }
  return item;
};

// @desc    Get all items accessible to the user (owned or in user's groups)
// @route   GET /api/items
// @access  Private
const getItems = async (req, res, next) => {
  try {
    const { search, category, status, groupId } = req.query;

    // Find groups the user belongs to
    const userGroups = await Group.find({ members: req.user._id }).select('_id');
    const groupIds = userGroups.map((g) => g._id);

    // Build filter: items owned by user OR items in groups user is in
    let filter = {
      $or: [{ owner: req.user._id }, { group: { $in: groupIds } }],
    };

    if (groupId) {
      filter.group = groupId;
    }

    if (category && category !== 'All Categories' && category !== 'All') {
      filter.category = category;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search) {
      filter.$and = [
        filter.$or ? { $or: filter.$or } : {},
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        },
      ];
      delete filter.$or;
    }

    let items = await Item.find(filter)
      .populate('owner', 'name email')
      .populate('group', 'name')
      .populate({
        path: 'currentLoan',
        select: 'borrowerName borrowerEmail checkoutDate dueDate status',
      })
      .sort({ createdAt: -1 });

    // Check overdue status
    const now = new Date();
    for (let item of items) {
      if (item.status === 'Borrowed' && item.currentLoan && new Date(item.currentLoan.dueDate) < now) {
        item.status = 'Overdue';
        await Item.findByIdAndUpdate(item._id, { status: 'Overdue' });
        await Loan.findByIdAndUpdate(item.currentLoan._id, { status: 'Overdue' });
      }
    }

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Private
const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('owner', 'name email phone')
      .populate('group', 'name')
      .populate('currentLoan');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Authorization check
    let authorized = item.owner._id.toString() === req.user._id.toString();
    if (!authorized && item.group) {
      const group = await Group.findOne({ _id: item.group._id, members: req.user._id });
      if (group) authorized = true;
    }

    if (!authorized) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this item',
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new item
// @route   POST /api/items
// @access  Private
const createItem = async (req, res, next) => {
  try {
    const { name, category, description, group } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an item name',
      });
    }

    // Verify group if specified
    if (group) {
      const groupDoc = await Group.findOne({ _id: group, members: req.user._id });
      if (!groupDoc) {
        return res.status(400).json({
          success: false,
          message: 'Specified group does not exist or you are not a member',
        });
      }
    }

    const item = await Item.create({
      name: name.trim(),
      category: category || 'Others',
      description: description ? description.trim() : '',
      owner: req.user._id,
      group: group || null,
      status: 'Available',
    });

    // Record activity
    await Activity.create({
      user: req.user._id,
      type: 'add_item',
      title: `Added "${item.name}" to inventory`,
      subtitle: `Category: ${item.category}`,
      item: item._id,
    });

    res.status(201).json({
      success: true,
      message: 'Item added successfully',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private
const updateItem = async (req, res, next) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the item owner can update this item',
      });
    }

    const { name, category, description, group } = req.body;

    if (name) item.name = name.trim();
    if (category) item.category = category;
    if (description !== undefined) item.description = description.trim();
    if (group !== undefined) item.group = group || null;

    await item.save();

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the item owner can delete this item',
      });
    }

    if (item.status === 'Borrowed' || item.status === 'Overdue') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an item that is currently borrowed. Please record its return first.',
      });
    }

    await Item.findByIdAndDelete(req.params.id);
    await Loan.deleteMany({ item: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};
