const { DataTypes } = require('sequelize');

function DepartmentModel(sequelize) {
  const Department = sequelize.define(
    'Department',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(120), allowNull: false, unique: true },
      description: { type: DataTypes.STRING(500), allowNull: true },
      category: { type: DataTypes.STRING(120), allowNull: true },
    },
    { tableName: 'departments' },
  );

  return Department;
}

module.exports = { DepartmentModel };

