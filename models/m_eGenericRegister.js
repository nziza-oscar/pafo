const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const m_eGenericRegister = sequelize.define('m_eGenericRegister', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  venue: {
    type: DataTypes.STRING,
    allowNull: false
  },
  organizedBy: {
    type: DataTypes.STRING,
    allowNull: false
  },
  minutes_report: {
    type: DataTypes.STRING,
    allowNull: false
  },
  budget_spent: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false
  },
  donation_estimation: {
    type: DataTypes.STRING,
    allowNull: false
  },
 
  activity_budget_line: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});


module.exports = m_eGenericRegister;
