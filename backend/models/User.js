const { DataTypes } = require('sequelize');
const { Roles } = require('../utils/constants');

function UserModel(sequelize) {
  const User = sequelize.define(
    'User',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(120), allowNull: false },
      address: { type: DataTypes.STRING(500), allowNull: false },
      pincode: { type: DataTypes.STRING(6), allowNull: false },
      contact: { type: DataTypes.STRING(20), allowNull: false },
      email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      password: { type: DataTypes.STRING(255), allowNull: false },
      latitude: { type: DataTypes.FLOAT, allowNull: true },
      longitude: { type: DataTypes.FLOAT, allowNull: true },
      aadhar: { type: DataTypes.STRING(20), allowNull: true },
      role: {
        type: DataTypes.ENUM(...Object.values(Roles)),
        allowNull: false,
        defaultValue: Roles.USER,
      },
      is_flagged: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      fake_reports_count: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    },
    {
      tableName: 'users',
    },
  );

  return User;
}

module.exports = { UserModel };

