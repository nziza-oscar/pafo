const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const m_eGenericRegister = require('./m_eGenericRegister');

const m_eGenericRegisterResponsibilities = sequelize.define('m_eGenericRegisterResponsibilities', {
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


// Foreign Key Relationship
m_eGenericRegisterResponsibilities.belongsTo(m_eGenericRegister, { foreignKey: 'generic_register_id', onDelete: 'CASCADE' });
m_eGenericRegister.hasMany(m_eGenericRegisterResponsibilities, { foreignKey: 'generic_register_id' });

module.exports = m_eGenericRegisterResponsibilities;
