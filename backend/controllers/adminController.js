const Joi = require('joi');
const { Complaint, User, Department, Employee } = require('../models');
const { AppError } = require('../utils/AppError');

const ALLOWED_STATUSES = ['reviewed', 'assigned', 'in_progress', 'resolved', 'closed'];

const adminController = {
  /**
   * GET /admin/complaints
   * Return all complaints with User (name, email) and Department (name)
   */
  async getAllComplaints(req, res, next) {
    try {
      const complaints = await Complaint.findAll({
        include: [
          { model: User, attributes: ['name', 'email'] },
          { model: Department, attributes: ['name'] },
        ],
        order: [['created_at', 'DESC']],
      });

      res.json({ success: true, data: complaints });
    } catch (e) {
      next(e);
    }
  },

  /**
   * PUT /admin/complaints/:id/assign
   * Assign an employee to a complaint
   */
  async assignEmployee(req, res, next) {
    try {
      const complaintId = Number(req.params.id);
      if (!Number.isFinite(complaintId)) throw new AppError('Invalid complaint id', 400);

      const schema = Joi.object({
        employee_id: Joi.number().integer().positive().required(),
      });
      const { value, error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
      if (error) throw new AppError('Validation failed', 400, error.details.map((d) => d.message));

      // Verify complaint exists
      const complaint = await Complaint.findByPk(complaintId);
      if (!complaint) throw new AppError('Complaint not found', 404);

      // Verify employee exists
      const employee = await Employee.findByPk(value.employee_id);
      if (!employee) throw new AppError('Employee not found', 400);

      await complaint.update({
        assigned_employee_id: value.employee_id,
        status: 'assigned',
      });

      res.json({ success: true, data: complaint });
    } catch (e) {
      next(e);
    }
  },

  /**
   * PUT /admin/complaints/:id/status
   * Update complaint status
   */
  async updateStatus(req, res, next) {
    try {
      const complaintId = Number(req.params.id);
      if (!Number.isFinite(complaintId)) throw new AppError('Invalid complaint id', 400);

      const schema = Joi.object({
        status: Joi.string()
          .valid(...ALLOWED_STATUSES)
          .required(),
      });
      const { value, error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
      if (error) throw new AppError('Validation failed', 400, error.details.map((d) => d.message));

      const complaint = await Complaint.findByPk(complaintId);
      if (!complaint) throw new AppError('Complaint not found', 404);

      await complaint.update({ status: value.status });

      res.json({ success: true, data: complaint });
    } catch (e) {
      next(e);
    }
  },

  /**
   * PUT /admin/complaints/:id/complete
   * Upload after_image and mark complaint as resolved
   */
  async completeComplaint(req, res, next) {
    try {
      const complaintId = Number(req.params.id);
      if (!Number.isFinite(complaintId)) throw new AppError('Invalid complaint id', 400);

      const complaint = await Complaint.findByPk(complaintId);
      if (!complaint) throw new AppError('Complaint not found', 404);

      let afterImagePath = null;
      if (req.file) {
        afterImagePath = `/uploads/${req.file.filename}`;
      }

      await complaint.update({
        after_image: afterImagePath,
        status: 'resolved',
      });

      res.json({ success: true, data: complaint });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = { adminController };
