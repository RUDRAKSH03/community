const Joi = require('joi');
const { Complaint, Department, Feedback, Vote, User } = require('../models');
const { AppError } = require('../utils/AppError');

const createSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).required(),
  department_id: Joi.number().integer().positive().required(),
  before_image: Joi.string().max(500).optional(),
  address: Joi.string().max(500).optional(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
});

function isAdminLike(role) {
  if (!role) return false;
  return ['admin', 'super_admin', 'SUPER_ADMIN', 'AREA_ADMIN', 'DEPARTMENT_ADMIN'].includes(role);
}

const complaintController = {
  async createComplaint(req, res, next) {
    try {
      console.log('BODY:', req.body);
      console.log('FILE:', req.file);

      if (!req.user?.sub) throw new AppError('Unauthorized', 401);

      const { value, error } = createSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
      if (error) throw new AppError('Validation failed', 400, error.details.map((d) => d.message));

      // Validate that the selected department exists
      const department = await Department.findByPk(value.department_id);
      if (!department) throw new Error('Invalid department');

      const beforeImagePath = req.file ? `/uploads/${req.file.filename}` : null;

      const complaint = await Complaint.create({
        user_id: req.user.sub,
        title: value.title,
        description: value.description,
        department_id: value.department_id,
        before_image: beforeImagePath,
        address: value.address || null,
        latitude: value.latitude || null,
        longitude: value.longitude || null,
        status: 'pending',
      });

      res.status(201).json({
        success: true,
        data: complaint,
      });
    } catch (err) {
      console.error('CREATE ERROR:', err);
      next(err);
    }
  },

  async getMyComplaints(req, res, next) {
    try {
      if (!req.user?.sub) throw new AppError('Unauthorized', 401);

      const complaints = await Complaint.findAll({
        where: { user_id: req.user.sub },
        order: [['created_at', 'DESC']],
      });

      res.json({
        success: true,
        data: complaints,
      });
    } catch (e) {
      next(e);
    }
  },

  async getComplaintById(req, res, next) {
    try {
      if (!req.user?.sub) throw new AppError('Unauthorized', 401);

      const id = Number(req.params.id);
      if (!Number.isFinite(id)) throw new AppError('Invalid complaint id', 400);

      const complaint = await Complaint.findByPk(id);
      if (!complaint) throw new AppError('Complaint not found', 404);

      const isOwner = String(complaint.user_id) === String(req.user.sub);
      const adminAllowed = isAdminLike(req.user.role);
      if (!isOwner && !adminAllowed) throw new AppError('Forbidden', 403);

      res.json({
        success: true,
        data: complaint,
      });
    } catch (e) {
      next(e);
    }
  },

  /**
   * POST /complaints/:id/feedback
   * Submit feedback for a resolved/closed complaint (owner only)
   */
  async submitFeedback(req, res, next) {
    try {
      if (!req.user?.sub) throw new AppError('Unauthorized', 401);

      const complaintId = Number(req.params.id);
      if (!Number.isFinite(complaintId)) throw new AppError('Invalid complaint id', 400);

      // Validate body
      const feedbackSchema = Joi.object({
        rating: Joi.number().integer().min(1).max(5).required(),
        comment: Joi.string().max(1000).optional().allow('', null),
      });
      const { value, error } = feedbackSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
      if (error) throw new AppError('Validation failed', 400, error.details.map((d) => d.message));

      // Fetch complaint
      const complaint = await Complaint.findByPk(complaintId);
      if (!complaint) throw new AppError('Complaint not found', 404);

      // Only the complaint owner can submit feedback
      if (String(complaint.user_id) !== String(req.user.sub)) {
        throw new AppError('Forbidden: only the complaint owner can give feedback', 403);
      }

      // Only allow feedback on resolved or closed complaints
      if (!['resolved', 'closed'].includes(complaint.status)) {
        throw new AppError('Feedback can only be given for resolved or closed complaints', 400);
      }

      // Prevent duplicate feedback
      const existing = await Feedback.findOne({ where: { complaint_id: complaintId } });
      if (existing) throw new AppError('Feedback already submitted for this complaint', 400);

      const feedback = await Feedback.create({
        complaint_id: complaintId,
        user_id: req.user.sub,
        rating: value.rating,
        comment: value.comment || null,
      });

      res.status(201).json({ success: true, data: feedback });
    } catch (e) {
      next(e);
    }
  },

  /**
   * GET /complaints/local
   * Fetch complaints in the same pincode as the user
   */
  async getLocalComplaints(req, res, next) {
    try {
      if (!req.user?.sub) throw new AppError('Unauthorized', 401);

      const me = await User.findByPk(req.user.sub);
      if (!me) throw new AppError('User not found', 404);

      const complaints = await Complaint.findAll({
        include: [
          {
            model: User,
            where: me.pincode ? { pincode: me.pincode } : {}, // If no pincode, just fetch all for now
            attributes: [],
          },
        ],
        order: [
          ['votes', 'DESC'],
          ['created_at', 'DESC'],
        ],
        limit: 20,
      });

      res.json({ success: true, data: complaints });
    } catch (e) {
      next(e);
    }
  },

  /**
   * POST /complaints/:id/vote
   * Increment votes for a complaint
   */
  async voteComplaint(req, res, next) {
    try {
      if (!req.user?.sub) throw new AppError('Unauthorized', 401);

      const complaintId = Number(req.params.id);
      if (!Number.isFinite(complaintId)) throw new AppError('Invalid complaint id', 400);

      const complaint = await Complaint.findByPk(complaintId);
      if (!complaint) throw new AppError('Complaint not found', 404);

      const existingVote = await Vote.findOne({
        where: { complaint_id: complaintId, user_id: req.user.sub },
      });

      if (existingVote) {
        throw new AppError('You have already voted on this issue', 400);
      }

      await Vote.create({
        complaint_id: complaintId,
        user_id: req.user.sub,
      });

      await complaint.increment('votes', { by: 1 });
      
      // Fetch updated
      await complaint.reload();

      res.json({ success: true, data: complaint });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = { complaintController };

