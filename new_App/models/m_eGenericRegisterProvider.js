const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const m_eGenericRegister = require('./m_eGenericRegister');

const m_eGenericRegisterProvider = sequelize.define('m_eGenericRegisterProvider', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});

// Foreign Key Relationship
m_eGenericRegisterProvider.belongsTo(m_eGenericRegister, { foreignKey: 'generic_register_id', onDelete: 'CASCADE' });
m_eGenericRegister.hasMany(m_eGenericRegisterProvider, { foreignKey: 'generic_register_id' });


module.exports = m_eGenericRegisterProvider;
