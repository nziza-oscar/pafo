const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const m_eStudiesDocument = require('./m_eStudiesDocument');

const m_eResponsible = sequelize.define('m_eResponsible', {
  position: {
    type: DataTypes.STRING,
    allowNull: false
  },
  responsible: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});

// Foreign Key
m_eResponsible.belongsTo(m_eStudiesDocument, { foreignKey: 'studies_document_id', onDelete: 'CASCADE' });
m_eStudiesDocument.hasMany(m_eResponsible, { foreignKey: 'studies_document_id' });

module.exports = m_eResponsible;
