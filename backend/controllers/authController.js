const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Joi = require('joi');

const { env } = require('../config/env');
const { AppError } = require('../utils/AppError');
const { Roles } = require('../utils/constants');
const { User } = require('../models');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  address: Joi.string().min(5).max(500).required(),
  pincode: Joi.string().pattern(/^\d{6}$/).required(),
  contact: Joi.string().min(7).max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(72).required(),
  aadhar: Joi.string().min(8).max(20).optional(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(72).required(),
});

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
    },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn },
  );
}

const authController = {
  async register(req, res, next) {
    try {
      const { value, error } = registerSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
      if (error) throw new AppError('Validation failed', 400, error.details.map((d) => d.message));

      const existing = await User.findOne({ where: { email: value.email } });
      if (existing) throw new AppError('Email already registered', 409);

      const passwordHash = await bcrypt.hash(value.password, 10);

      const user = await User.create({
        name: value.name,
        address: value.address,
        pincode: value.pincode,
        contact: value.contact,
        email: value.email,
        password: passwordHash,
        aadhar: value.aadhar || null,
        latitude: value.latitude || null,
        longitude: value.longitude || null,
        role: Roles.USER,
      });

      const token = signToken(user);

      // eslint-disable-next-line no-console
      console.log(`[AUTH] Registered user id=${user.id} email=${user.email}`);

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (e) {
      next(e);
    }
  },

  async login(req, res, next) {
    try {
      const { value, error } = loginSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
      if (error) throw new AppError('Validation failed', 400, error.details.map((d) => d.message));

      const user = await User.findOne({ where: { email: value.email } });
      if (!user) throw new AppError('Invalid credentials', 401);

      const ok = await bcrypt.compare(value.password, user.password);
      if (!ok) throw new AppError('Invalid credentials', 401);

      const token = signToken(user);

      // eslint-disable-next-line no-console
      console.log(`[AUTH] Login success user id=${user.id} email=${user.email}`);
      // eslint-disable-next-line no-console
      console.log('SIGN SECRET:', env.jwt.secret);
      // eslint-disable-next-line no-console
      console.log('TOKEN GENERATED:', token);

      res.json({
        success: true,
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = { authController, signToken };

