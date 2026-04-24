const { AppError } = require('../utils/AppError');

// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, next) {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;

  const payload = {
    success: false,
    message: isAppError ? err.message : 'Internal Server Error',
  };

  if (isAppError && err.details) payload.details = err.details;
  if (process.env.NODE_ENV !== 'production' && !isAppError) {
    payload.error = { name: err.name, message: err.message, stack: err.stack };
  }

  res.status(statusCode).json(payload);
}

module.exports = { errorMiddleware };
