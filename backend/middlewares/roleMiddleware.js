const { AppError } = require('../utils/AppError');

function requireRole(...roles) {
  return function roleMiddleware(req, res, next) {
    if (!req.user) return next(new AppError('Unauthorized', 401));
    if (!roles.includes(req.user.role)) return next(new AppError('Forbidden', 403));
    return next();
  };
}

module.exports = { requireRole };
