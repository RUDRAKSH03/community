const { Department } = require('../models');

const departmentController = {
  async getDepartments(req, res, next) {
    try {
      const departments = await Department.findAll({
        order: [
          ['category', 'ASC'],
          ['name', 'ASC'],
        ],
        attributes: ['id', 'name', 'category', 'description'],
      });

      res.json({
        success: true,
        data: departments,
      });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = { departmentController };
