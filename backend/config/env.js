const dotenv = require('dotenv');
const path = require('path');

// Always load backend/.env regardless of the process working directory.
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),

  db: {
    host: required('DB_HOST'),
    port: Number(process.env.DB_PORT || 3306),
    name: required('DB_NAME'),
    user: required('DB_USER'),
    password: required('DB_PASSWORD'),
    ssl: process.env.DB_SSL ? process.env.DB_SSL === 'true' : false,
    sslRejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED
      ? process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true'
      : true,
  },

  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  uploads: {
    dir: process.env.UPLOAD_DIR || 'uploads',
  },

  // Use carefully in production; prefer migrations long-term.
  syncDb: process.env.DB_SYNC ? process.env.DB_SYNC === 'true' : (process.env.NODE_ENV || 'development') === 'development',
  forceRecreateComplaints: process.env.FORCE_RECREATE_COMPLAINTS
    ? process.env.FORCE_RECREATE_COMPLAINTS === 'true'
    : false,

  publicBaseUrl: process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 5000}`,

  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined,
    secure: process.env.EMAIL_SECURE ? process.env.EMAIL_SECURE === 'true' : undefined,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    fromName: process.env.EMAIL_FROM_NAME || 'Community Reporting System',
    fromAddress: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER,
  },
};

module.exports = { env };
