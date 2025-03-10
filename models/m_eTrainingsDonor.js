const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const m_eTrainings = require('./m_eTrainings');

const m_eTrainingsDonor = sequelize.define('m_eTrainingsDonor', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});

// Foreign Key Relationship
m_eTrainingsDonor.belongsTo(m_eTrainings, { foreignKey: 'trainings_id', onDelete: 'CASCADE' });
m_eTrainings.hasMany(m_eTrainingsDonor, { foreignKey: 'trainings_id' });

module.exports = m_eTrainingsDonor;
