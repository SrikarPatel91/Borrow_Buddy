const express = require('express');
const router = express.Router();
const {
  borrowItem,
  returnItem,
  getLoans,
  getLoanHistory,
} = require('../controllers/loanController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/borrow', borrowItem);
router.post('/:id/return', returnItem);
router.get('/', getLoans);
router.get('/history', getLoanHistory);

module.exports = router;
