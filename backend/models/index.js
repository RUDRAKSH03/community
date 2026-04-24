const { sequelize } = require('../config/db');

const { UserModel } = require('./User');
const { DepartmentModel } = require('./Department');
const { AreaModel } = require('./Area');
const { EmployeeModel } = require('./Employee');
const { AdminModel } = require('./Admin');
const { ComplaintModel } = require('./Complaint');
const { FeedbackModel } = require('./Feedback');
const { VoteModel } = require('./Vote');
const { NotificationModel } = require('./Notification');
const { SosRequestModel } = require('./SosRequest');

const User = UserModel(sequelize);
const Department = DepartmentModel(sequelize);
const Area = AreaModel(sequelize);
const Employee = EmployeeModel(sequelize);
const Admin = AdminModel(sequelize);
const Complaint = ComplaintModel(sequelize);
const Feedback = FeedbackModel(sequelize);
const Vote = VoteModel(sequelize);
const Notification = NotificationModel(sequelize);
const SosRequest = SosRequestModel(sequelize);

// ===== Associations =====
// Employee/Admin profile is tied to a User
User.hasOne(Employee, { foreignKey: 'user_id' });
Employee.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(Admin, { foreignKey: 'user_id' });
Admin.belongsTo(User, { foreignKey: 'user_id' });

Department.hasMany(Employee, { foreignKey: 'department_id' });
Employee.belongsTo(Department, { foreignKey: 'department_id' });

Area.hasMany(Employee, { foreignKey: 'area_id' });
Employee.belongsTo(Area, { foreignKey: 'area_id' });

Area.hasMany(Admin, { foreignKey: 'area_id' });
Admin.belongsTo(Area, { foreignKey: 'area_id' });

// Complaints
User.hasMany(Complaint, { foreignKey: 'user_id' });
Complaint.belongsTo(User, { foreignKey: 'user_id' });

Department.hasMany(Complaint, { foreignKey: 'department_id' });
Complaint.belongsTo(Department, { foreignKey: 'department_id' });

Area.hasMany(Complaint, { foreignKey: 'area_id' });
Complaint.belongsTo(Area, { foreignKey: 'area_id' });

Employee.hasMany(Complaint, { foreignKey: 'assigned_employee_id', as: 'AssignedComplaints' });
Complaint.belongsTo(Employee, { foreignKey: 'assigned_employee_id', as: 'AssignedEmployee' });

// Feedback 1:1 with complaint
Complaint.hasOne(Feedback, { foreignKey: 'complaint_id' });
Feedback.belongsTo(Complaint, { foreignKey: 'complaint_id' });

User.hasMany(Feedback, { foreignKey: 'user_id' });
Feedback.belongsTo(User, { foreignKey: 'user_id' });

// Votes: complaint <-> user (many-to-many via Vote)
Complaint.hasMany(Vote, { foreignKey: 'complaint_id' });
Vote.belongsTo(Complaint, { foreignKey: 'complaint_id' });

User.hasMany(Vote, { foreignKey: 'user_id' });
Vote.belongsTo(User, { foreignKey: 'user_id' });

// Notifications
User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// SOS
User.hasMany(SosRequest, { foreignKey: 'user_id' });
SosRequest.belongsTo(User, { foreignKey: 'user_id' });

async function initModels({ sync = false } = {}) {
  if (sync) await sequelize.sync({ alter: true });
}

async function recreateComplaintsTable() {
  await Complaint.sync({ force: true });
  // eslint-disable-next-line no-console
  console.log('Complaint table recreated successfully');
}

module.exports = {
  sequelize,
  initModels,
  recreateComplaintsTable,
  User,
  Department,
  Area,
  Employee,
  Admin,
  Complaint,
  Feedback,
  Vote,
  Notification,
  SosRequest,
};

