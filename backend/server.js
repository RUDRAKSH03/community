const express = require('express');
const app = express();
console.log("Server starting...");
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { env } = require('./config/env');
const { connectDb } = require('./config/db');
const { initModels, recreateComplaintsTable } = require('./models');
const { seedBasics } = require('./utils/seed');
const { errorMiddleware } = require('./middlewares/errorMiddleware');
const { AppError } = require('./utils/AppError');

// Routes
const { authRoutes } = require('./routes/authRoutes');
const { testRoutes } = require('./routes/testRoutes');
const { complaintRoutes } = require('./routes/complaintRoutes');
const { adminRoutes } = require('./routes/adminRoutes');
const { departmentRoutes } = require('./routes/departmentRoutes');
const { statsRoutes } = require('./routes/statsRoutes');
async function bootstrap() {
  await connectDb();
  if (env.forceRecreateComplaints) await recreateComplaintsTable();
  await initModels({ sync: env.syncDb });
  if (env.nodeEnv === 'development') await seedBasics();

  const app = express();
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
    }),
  );

  // Static uploads (local storage)
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Health check
  app.get('/health', (req, res) => res.json({ ok: true, env: env.nodeEnv }));

  // API routes
  app.use('/auth', authRoutes);
  app.use('/test', testRoutes);
  app.use('/complaints', complaintRoutes);
  app.use('/admin', adminRoutes);
  app.use('/departments', departmentRoutes);
  app.use('/stats', statsRoutes);

  // 404
  app.use((req, res, next) => next(new AppError('Not Found', 404)));
  app.use(errorMiddleware);

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on port ${env.port}`);
  });
}
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal startup error:', err);
  process.exit(1);
});

