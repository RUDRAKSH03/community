const { Complaint, Department, Feedback } = require('../models');
const { AppError } = require('../utils/AppError');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');

const statsController = {
  async getUserStats(req, res, next) {
    try {
      if (!req.user?.sub) throw new AppError('Unauthorized', 401);

      const complaints = await Complaint.findAll({
        where: { user_id: req.user.sub },
        attributes: ['status'],
      });

      let total = 0;
      let pending = 0;
      let resolved = 0;
      let inProgress = 0;

      complaints.forEach((c) => {
        total++;
        if (c.status === 'pending') pending++;
        else if (c.status === 'resolved' || c.status === 'closed') resolved++;
        else if (c.status === 'in_progress') inProgress++;
      });

      res.json({
        success: true,
        data: { total, pending, resolved, inProgress },
      });
    } catch (err) {
      next(err);
    }
  },

  async getOverviewStats(req, res, next) {
    try {
      const allComplaints = await Complaint.findAll({ attributes: ['status'] });
      
      let totalComplaints = 0;
      let resolvedComplaints = 0;
      let pendingComplaints = 0;

      allComplaints.forEach((c) => {
        totalComplaints++;
        if (c.status === 'resolved' || c.status === 'closed') resolvedComplaints++;
        if (c.status === 'pending') pendingComplaints++;
      });

      let satisfactionRate = 0;
      if (totalComplaints > 0) {
        satisfactionRate = Math.round((resolvedComplaints / totalComplaints) * 100);
      }

      res.json({
        success: true,
        data: {
          totalComplaints,
          resolvedComplaints,
          pendingComplaints,
          satisfactionRate,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async getTrendsStats(req, res, next) {
    try {
      // For SQLite compatibility (since user might be using sqlite occasionally in dev) we do string operations or simple findAll
      // But standard way in sequelize across engines for trends is often raw queries or fetching all and grouping in JS if dataset isn't massive.
      // We will group in JS to avoid dialect-specific DATE() functions in SQL that break across mysql/sqlite.
      const complaints = await Complaint.findAll({ attributes: ['created_at'], order: [['created_at', 'ASC']] });
      
      const countsMap = {};
      complaints.forEach((c) => {
        const dateStr = c.created_at.toISOString().split('T')[0];
        countsMap[dateStr] = (countsMap[dateStr] || 0) + 1;
      });

      const data = Object.keys(countsMap).map((date) => ({
        date,
        count: countsMap[date],
      }));

      // Return only the last 30 days if large
      const recentData = data.slice(-30);

      res.json({
        success: true,
        data: recentData,
      });
    } catch (err) {
      next(err);
    }
  },

  async getDepartmentStats(req, res, next) {
    try {
      const stats = await Complaint.findAll({
        attributes: [
          'department_id',
          [sequelize.fn('COUNT', sequelize.col('Complaint.id')), 'count'],
        ],
        include: [
          {
            model: Department,
            attributes: ['name'],
          },
        ],
        group: ['department_id', 'Department.id'],
      });

      const data = stats.map((row) => ({
        department: row.Department?.name || 'Unassigned',
        count: parseInt(row.getDataValue('count'), 10),
      }));

      // Sort by count descending
      data.sort((a, b) => b.count - a.count);

      res.json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = { statsController };
