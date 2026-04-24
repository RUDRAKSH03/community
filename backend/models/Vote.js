const { DataTypes } = require('sequelize');

function VoteModel(sequelize) {
  const Vote = sequelize.define(
    'Vote',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      complaint_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    },
    {
      tableName: 'votes',
      indexes: [{ unique: true, fields: ['complaint_id', 'user_id'] }],
    },
  );

  return Vote;
}

module.exports = { VoteModel };

