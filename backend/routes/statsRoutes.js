const express = require('express');
const { statsController } = require('../controllers/statsController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/user', authMiddleware, statsController.getUserStats);
router.get('/overview', authMiddleware, statsController.getOverviewStats);
router.get('/trends', authMiddleware, statsController.getTrendsStats);
router.get('/departments', authMiddleware, statsController.getDepartmentStats);

module.exports = { statsRoutes: router };
