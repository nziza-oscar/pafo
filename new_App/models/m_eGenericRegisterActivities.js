const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const m_eGenericRegister = require('./m_eGenericRegister');

const m_eGenericRegisterActivities = sequelize.define('m_eGenericRegisterActivities', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});


m_eGenericRegisterActivities.belongsTo(m_eGenericRegister, { foreignKey: 'generic_register_id', onDelete: 'CASCADE' });
m_eGenericRegister.hasMany(m_eGenericRegisterActivities, { foreignKey: 'generic_register_id' });

module.exports = m_eGenericRegisterActivities;
