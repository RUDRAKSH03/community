const { DataTypes } = require('sequelize');

function FeedbackModel(sequelize) {
  const Feedback = sequelize.define(
    'Feedback',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      complaint_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, unique: true },
      user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
      rating: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        validate: { min: 1, max: 5 },
      },
      comment: { type: DataTypes.TEXT, allowNull: true },
    },
    { tableName: 'feedback' },
  );

  return Feedback;
}

module.exports = { FeedbackModel };
