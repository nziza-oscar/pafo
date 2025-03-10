const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const m_eStudiesDocument = require('./m_eStudiesDocument');

const m_eDonor = sequelize.define('m_eDonor', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});

// Foreign Key
m_eDonor.belongsTo(m_eStudiesDocument, { foreignKey: 'studies_document_id', onDelete: 'CASCADE' });
m_eStudiesDocument.hasMany(m_eDonor, { foreignKey: 'studies_document_id' });

module.exports = m_eDonor;
