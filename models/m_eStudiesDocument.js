const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const m_eStudiesDocument = sequelize.define('m_eStudiesDocument', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  data_collection_method: {
    type: DataTypes.STRING,
    allowNull: false
  },
  donation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  program: {
    type: DataTypes.STRING,
    allowNull: false
  },
  donor: {
    type: DataTypes.STRING,
    allowNull: false
  },
  document_upload: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  comments: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = m_eStudiesDocument;
