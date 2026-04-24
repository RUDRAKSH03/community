const { DataTypes } = require('sequelize');

function AdminModel(sequelize) {
  const Admin = sequelize.define(
    'Admin',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, unique: true },
      area_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    },
    { tableName: 'admins' },
  );

  return Admin;
}

module.exports = { AdminModel };

