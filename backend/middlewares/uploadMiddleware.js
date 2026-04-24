const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { AppError } = require('../utils/AppError');

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.resolve(__dirname, '../uploads');
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
    } catch (e) {
      return cb(e);
    }
    return cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeOriginal}`);
  },
});

function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new AppError('Only image files (jpg, jpeg, png) are allowed', 400));
  }
  return cb(null, true);
}

const baseUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

function uploadSingle(fieldName) {
  return function uploadSingleMiddleware(req, res, next) {
    const handler = baseUpload.single(fieldName);
    handler(req, res, (err) => {
      if (!err) return next();
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') return next(new AppError('File too large (max 5MB)', 400));
        return next(new AppError(err.message, 400));
      }
      return next(err);
    });
  };
}

module.exports = { uploadSingle };

