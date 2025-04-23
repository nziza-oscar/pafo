const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Partnerships = sequelize.define('m_epartnership', {
  program: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  closing_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: false,
  }
  ,
}, {
  timestamps: true,
});

module.exports = Partnerships;
