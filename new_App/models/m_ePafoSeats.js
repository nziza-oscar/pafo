const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const m_ePafoSeats = sequelize.define('m_ePafoSeats', {
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  commitee: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nominee: {
    type: DataTypes.STRING,
    allowNull: true
  },
  meeting: {
    type: DataTypes.STRING,
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  closing_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  document_upload:{
    type:DataTypes.TEXT,
    allowNull:true
  }
}, {
  timestamps: true
});

module.exports = m_ePafoSeats;
