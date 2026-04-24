const { DataTypes } = require('sequelize');
const { NotificationType } = require('../utils/constants');

function NotificationModel(sequelize) {
  const Notification = sequelize.define(
    'Notification',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      message: { type: DataTypes.STRING(1000), allowNull: false },
      type: { type: DataTypes.ENUM(...Object.values(NotificationType)), allowNull: false },
      read_status: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    { tableName: 'notifications' },
  );

  return Notification;
}

module.exports = { NotificationModel };

