const { Sequelize } = require('sequelize');
const { env } = require('./env');

const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'mysql',
  logging: env.nodeEnv === 'development' ? false : false,
  dialectOptions: env.db.ssl
    ? {
        ssl: {
          rejectUnauthorized: env.db.sslRejectUnauthorized,
        },
      }
    : undefined,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

async function connectDb() {
  // RDS connections can briefly fail during warmup; retry a few times.
  const maxAttempts = 5;
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await sequelize.authenticate();
      return;
    } catch (e) {
      lastErr = e;
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, attempt * 1000));
    }
  }
  throw lastErr;
}

module.exports = { sequelize, connectDb };
