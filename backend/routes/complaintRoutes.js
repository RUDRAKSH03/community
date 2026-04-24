const express = require('express');
const { complaintController } = require('../controllers/complaintController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { uploadSingle } = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  uploadSingle('before_image'),
  complaintController.createComplaint,
);
router.get('/my', authMiddleware, complaintController.getMyComplaints);
router.get('/local', authMiddleware, complaintController.getLocalComplaints);
router.get('/:id', authMiddleware, complaintController.getComplaintById);
router.post('/:id/feedback', authMiddleware, complaintController.submitFeedback);
router.post('/:id/vote', authMiddleware, complaintController.voteComplaint);

module.exports = { complaintRoutes: router };

