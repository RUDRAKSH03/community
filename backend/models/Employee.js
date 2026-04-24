const { DataTypes } = require('sequelize');

function EmployeeModel(sequelize) {
  const Employee = sequelize.define(
    'Employee',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, unique: true },
      department_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      area_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    },
    { tableName: 'employees' },
  );

  return Employee;
}

module.exports = { EmployeeModel };

