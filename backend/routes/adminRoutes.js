const express = require('express');
const { adminController } = require('../controllers/adminController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');
const { uploadSingle } = require('../middlewares/uploadMiddleware');

const router = express.Router();

// All admin routes require authentication + admin/super_admin role
router.use(authMiddleware);
router.use(requireRole('admin', 'super_admin'));

// GET /admin/complaints — list all complaints
router.get('/complaints', adminController.getAllComplaints);

// PUT /admin/complaints/:id/assign — assign employee
router.put('/complaints/:id/assign', adminController.assignEmployee);

// PUT /admin/complaints/:id/status — update status
router.put('/complaints/:id/status', adminController.updateStatus);

// PUT /admin/complaints/:id/complete — upload after image & resolve
router.put('/complaints/:id/complete', uploadSingle('after_image'), adminController.completeComplaint);

module.exports = { adminRoutes: router };
