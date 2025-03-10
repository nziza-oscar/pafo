const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const m_eTrainings = sequelize.define('m_eTrainings', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  venue: {
    type: DataTypes.STRING,
    allowNull: false
  },
  participants: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  women: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  men: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  youth: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  total_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  starting_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  ending_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  program: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  document_upload: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true
});
module.exports = m_eTrainings;

