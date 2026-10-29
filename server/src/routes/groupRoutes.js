const express = require('express');
const router = express.Router();
const {
  getGroups,
  getGroupById,
  createGroup,
  addMembers,
  deleteGroup,
} = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getGroups)
  .post(createGroup);

router.route('/:id')
  .get(getGroupById)
  .delete(deleteGroup);

router.post('/:id/members', addMembers);

module.exports = router;
