const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Partnerships = require('./Partnerships');

const PartnershipBudget = sequelize.define('m_ePartnershipBudget', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  timestamps: true,
});

// Define Foreign Key
PartnershipBudget.belongsTo(Partnerships, { foreignKey: 'm_epartnerships_id', onDelete: 'CASCADE' });
Partnerships.hasMany(PartnershipBudget, { foreignKey: 'm_epartnerships_id' });



module.exports = PartnershipBudget;
