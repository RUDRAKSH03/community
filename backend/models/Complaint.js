const { DataTypes } = require('sequelize');

function ComplaintModel(sequelize) {
  const Complaint = sequelize.define(
    'Complaint',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      department_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      area_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      assigned_employee_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },

      title: { type: DataTypes.STRING(200), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      address: { type: DataTypes.STRING(500), allowNull: true },
      latitude: { type: DataTypes.FLOAT, allowNull: true },
      longitude: { type: DataTypes.FLOAT, allowNull: true },
      before_image: { type: DataTypes.STRING(500), allowNull: true },
      after_image: { type: DataTypes.STRING(500), allowNull: true },

      status: {
        type: DataTypes.ENUM('pending', 'reviewed', 'assigned', 'in_progress', 'resolved', 'closed'),
        allowNull: false,
        defaultValue: 'pending',
      },

      priority: {
        type: DataTypes.ENUM('normal', 'high', 'sos'),
        allowNull: false,
        defaultValue: 'normal',
      },
      votes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      is_fake: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    {
      tableName: 'complaints',
      indexes: [
        { fields: ['user_id'] },
        { fields: ['department_id'] },
        { fields: ['area_id'] },
        { fields: ['status'] },
        { fields: ['priority'] },
      ],
    },
  );
  return Complaint;
}
module.exports = { ComplaintModel };

