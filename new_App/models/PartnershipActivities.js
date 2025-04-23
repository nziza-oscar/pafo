const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Partnership = require('./Partnerships');

const PartnershipActivities = sequelize.define('m_eActivities', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
});

// Define Foreign Key
PartnershipActivities.belongsTo(Partnership, { foreignKey: 'm_epartnerships_id', onDelete: 'CASCADE' });
Partnership.hasMany(PartnershipActivities, { foreignKey: 'm_epartnerships_id' });



module.exports = PartnershipActivities;
