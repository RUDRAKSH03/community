const { connectDb } = require('./config/db');
const { Feedback, Complaint, User, Vote, Notification, SosRequest, Employee, Admin } = require('./models');

async function reset() {
  await connectDb();
  
  console.log('Deleting dependent data...');
  await Feedback.destroy({ where: {} });
  await Vote.destroy({ where: {} });
  await Notification.destroy({ where: {} });
  await SosRequest.destroy({ where: {} });
  await Employee.destroy({ where: {} });
  await Admin.destroy({ where: {} });
  await Complaint.destroy({ where: {} });
  
  console.log('Deleting users...');
  await User.destroy({ where: {} });
  
  console.log('Resetting AUTO_INCREMENT...');
  const { sequelize } = require('./config/db');
  try {
    await sequelize.query('ALTER TABLE users AUTO_INCREMENT = 1;');
    await sequelize.query('ALTER TABLE complaints AUTO_INCREMENT = 1;');
    await sequelize.query('ALTER TABLE feedback AUTO_INCREMENT = 1;');
  } catch (e) {
    console.log('Could not reset auto_increment (might be sqlite): ', e.message);
  }
  
  console.log('Done.');
  process.exit(0);
}

reset().catch(e => {
  console.error(e);
  process.exit(1);
});
