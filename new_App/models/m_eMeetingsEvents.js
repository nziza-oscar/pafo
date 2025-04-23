const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const m_eMeetingsEvents = sequelize.define('m_eMeetingsEvents', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  organized_by: {
    type: DataTypes.STRING,
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
    type: DataTypes.STRING,
    allowNull: false
  },
  venue: {
    type: DataTypes.STRING,
    allowNull: false
  },
  participants: {
    type: DataTypes.STRING,
    allowNull: false
  },
  number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  women: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  youth: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  minutes_report: {
    type: DataTypes.STRING,
    allowNull: true
  },
  program: {
    type: DataTypes.STRING,
    allowNull: false
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

module.exports = m_eMeetingsEvents;
