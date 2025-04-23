const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Partnership = require('./Partnerships');

const Partners = sequelize.define('m_ePartners', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
  
});

// Define Foreign Key
Partners.belongsTo(Partnership, { foreignKey: 'm_epartnerships_id', onDelete: 'CASCADE' });
Partnership.hasMany(Partners, { foreignKey: 'm_epartnerships_id' });

module.exports = Partners;
