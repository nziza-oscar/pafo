const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const m_eTrainings = require('./m_eTrainings');

const m_eTrainingsTrainers = sequelize.define('m_eTrainingsTrainers', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  institution: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});

// Foreign Key Relationship
m_eTrainingsTrainers.belongsTo(m_eTrainings, { foreignKey: 'trainings_id', onDelete: 'CASCADE' });
m_eTrainings.hasMany(m_eTrainingsTrainers, { foreignKey: 'trainings_id' });

module.exports = m_eTrainingsTrainers;
