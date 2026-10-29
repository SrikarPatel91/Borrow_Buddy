const Group = require('../models/Group');
const Item = require('../models/Item');
const Activity = require('../models/Activity');

// @desc    Get user's groups
// @route   GET /api/groups
// @access  Private
const getGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate('creator', 'name email')
      .populate('members', 'name email phone avatar')
      .sort({ createdAt: -1 });

    // Attach item counts to each group
    const groupsWithStats = await Promise.all(
      groups.map(async (group) => {
        const itemCount = await Item.countDocuments({ group: group._id });
        const items = await Item.find({ group: group._id }).select('name category status');
        return {
          ...group.toObject(),
          itemCount,
          items,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: groupsWithStats.length,
      data: groupsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single group details
// @route   GET /api/groups/:id
// @access  Private
const getGroupById = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('members', 'name email phone avatar');

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const isMember = group.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group',
      });
    }

    const items = await Item.find({ group: group._id })
      .populate('owner', 'name email')
      .populate('currentLoan');

    res.status(200).json({
      success: true,
      data: {
        ...group.toObject(),
        items,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res, next) => {
  try {
    const { name, description, memberIds } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a group name',
      });
    }

    // Ensure creator is in the members list
    const membersSet = new Set(Array.isArray(memberIds) ? memberIds : []);
    membersSet.add(req.user._id.toString());
    const members = Array.from(membersSet);

    const group = await Group.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      creator: req.user._id,
      members,
    });

    await Activity.create({
      user: req.user._id,
      type: 'create_group',
      title: `Created "${group.name}" group`,
      subtitle: `${members.length} members`,
      group: group._id,
    });

    const populatedGroup = await Group.findById(group._id)
      .populate('creator', 'name email')
      .populate('members', 'name email');

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: populatedGroup,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add members to group
// @route   POST /api/groups/:id/members
// @access  Private
const addMembers = async (req, res, next) => {
  try {
    const { memberIds } = req.body;

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide member IDs to add',
      });
    }

    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Check authorization: creator or member
    const isMember = group.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Only group members can add new members',
      });
    }

    // Add unique members
    memberIds.forEach((id) => {
      if (!group.members.some((m) => m.toString() === id.toString())) {
        group.members.push(id);
      }
    });

    await group.save();

    const updated = await Group.findById(group._id).populate('members', 'name email');

    res.status(200).json({
      success: true,
      message: 'Members added successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private
const deleteGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (group.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the group creator can delete this group',
      });
    }

    // Unlink items from this group
    await Item.updateMany({ group: group._id }, { group: null });

    await Group.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Group deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGroups,
  getGroupById,
  createGroup,
  addMembers,
  deleteGroup,
};
