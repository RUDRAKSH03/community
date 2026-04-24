const express = require('express');
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

console.log("Server starting...");

async function bootstrap() {
  await connectDb();
  if (env.forceRecreateComplaints) await recreateComplaintsTable();
  await initModels({ sync: env.syncDb });
  if (env.nodeEnv === 'development') await seedBasics();

  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  
  app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }));

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

  app.get("/", (req, res) => {
    res.send("API is running");
  });

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

  const PORT = process.env.PORT || env.port || 8000;
  app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});

