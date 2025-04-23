const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const m_eMeetingsEvents = require('./m_eMeetingsEvents');

const m_eMeetingsEventsDonor = sequelize.define('m_eMeetingsEventsDonor', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});

// Foreign Key Relationship
m_eMeetingsEventsDonor.belongsTo(m_eMeetingsEvents, { foreignKey: 'meetings_events_id', onDelete: 'CASCADE' });
m_eMeetingsEvents.hasMany(m_eMeetingsEventsDonor, { foreignKey: 'meetings_events_id' });

module.exports = m_eMeetingsEventsDonor;
