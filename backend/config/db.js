const { Sequelize } = require('sequelize');
const { env } = require('./env');

console.log("🔍 Using DB CONFIG:");
console.log("HOST:", env.db.host);
console.log("USER:", env.db.user);
console.log("DB:", env.db.name);
console.log("PORT:", env.db.port);

const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'mysql',
  logging: false,
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
  const maxAttempts = 5;
  let lastErr;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      console.log(`🔌 DB connection attempt ${attempt}...`);
      await sequelize.authenticate();
      console.log("✅ DB CONNECTED SUCCESSFULLY");
      return;
    } catch (e) {
      console.error(`❌ Attempt ${attempt} failed:`, e.message);
      lastErr = e;
      await new Promise((r) => setTimeout(r, attempt * 1000));
    }
  }

  console.error("🚨 FINAL DB CONNECTION FAILED");
  throw lastErr;
}

module.exports = { sequelize, connectDb };