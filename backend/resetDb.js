const { connectDb, sequelize } = require('./config/db');
const {
  Feedback,
  Complaint,
  User,
  Vote,
  Notification,
  SosRequest,
  Employee,
  Admin
} = require('./models');

async function run() {
  try {
    console.log("🔌 Connecting to DB...");
    await connectDb();

    await sequelize.authenticate();
    console.log("✅ DB CONNECTED SUCCESSFULLY");

    console.log('🧹 Deleting dependent data...');
    await Feedback.destroy({ where: {} });
    await Vote.destroy({ where: {} });
    await Notification.destroy({ where: {} });
    await SosRequest.destroy({ where: {} });
    await Employee.destroy({ where: {} });
    await Admin.destroy({ where: {} });
    await Complaint.destroy({ where: {} });

    console.log('👤 Deleting users...');
    await User.destroy({ where: {} });

    console.log('🔄 Resetting AUTO_INCREMENT...');
    try {
      await sequelize.query('ALTER TABLE users AUTO_INCREMENT = 1;');
      await sequelize.query('ALTER TABLE complaints AUTO_INCREMENT = 1;');
      await sequelize.query('ALTER TABLE feedback AUTO_INCREMENT = 1;');
    } catch (e) {
      console.log('⚠️ AUTO_INCREMENT reset skipped:', e.message);
    }

    console.log('🎉 RESET COMPLETE');
    process.exit(0);

  } catch (err) {
    console.error("❌ DB ERROR:", err.message);
    process.exit(1);
  }
}

run();