const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { AppError } = require('../utils/AppError');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  // eslint-disable-next-line no-console
  console.log('AUTH HEADER:', req.headers.authorization);
  if (!header) return next(new AppError('Unauthorized: missing token', 401));
  if (!header.startsWith('Bearer ')) return next(new AppError('Unauthorized: invalid token format', 401));

  const token = header.slice('Bearer '.length).trim();
  // eslint-disable-next-line no-console
  console.log('TOKEN RECEIVED:', token);
  if (!token) return next(new AppError('Unauthorized: missing token', 401));

  try {
    // eslint-disable-next-line no-console
    console.log('VERIFY SECRET:', env.jwt.secret);
    const decoded = jwt.verify(token, env.jwt.secret);
    req.user = decoded;
    return next();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('JWT ERROR:', err.message);
    throw new AppError('Unauthorized: invalid token', 401);
  }
}

function requireRole(...roles) {
  return function roleMiddleware(req, res, next) {
    if (!req.user) return next(new AppError('Unauthorized', 401));

    const role = req.user.role || req.user?.user?.role;
    if (!role) return next(new AppError('Forbidden', 403));
    if (!roles.includes(role)) return next(new AppError('Forbidden', 403));

    return next();
  };
}

module.exports = { authMiddleware, requireRole };
