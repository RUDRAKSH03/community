const { Router } = require('express');
const { departmentController } = require('../controllers/departmentController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = Router();

router.get('/', authMiddleware, departmentController.getDepartments);

module.exports = { departmentRoutes: router };
