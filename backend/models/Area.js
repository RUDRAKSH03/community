const { DataTypes } = require('sequelize');

function AreaModel(sequelize) {
  const Area = sequelize.define(
    'Area',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(120), allowNull: false },
      pincode: { type: DataTypes.STRING(6), allowNull: false },
    },
    {
      tableName: 'areas',
      indexes: [{ fields: ['pincode'] }],
    },
  );

  return Area;
}

module.exports = { AreaModel };

