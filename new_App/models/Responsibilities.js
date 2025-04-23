const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Partnership = require('./Partnerships');

const Responsibilities = sequelize.define('m_eResponsibilities', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
});

// Define Foreign Key
Responsibilities.belongsTo(Partnership, { foreignKey: 'm_epartnerships_id', onDelete: 'CASCADE' });
Partnership.hasMany(Responsibilities, { foreignKey: 'm_epartnerships_id' });


module.exports = Responsibilities;
