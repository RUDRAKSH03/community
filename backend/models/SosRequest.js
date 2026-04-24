const { DataTypes } = require('sequelize');

function SosRequestModel(sequelize) {
  const SosRequest = sequelize.define(
    'SosRequest',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      type: { type: DataTypes.STRING(50), allowNull: false }, // e.g. FIRE, MEDICAL, CRIME
      location: { type: DataTypes.STRING(500), allowNull: false }, // beginner-friendly; can be lat,lng later
      status: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'OPEN' },
    },
    { tableName: 'sos_requests' },
  );

  return SosRequest;
}

module.exports = { SosRequestModel };

