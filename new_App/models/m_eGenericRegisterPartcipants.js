const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const m_eGenericRegister = require("./m_eGenericRegister")
const m_eGenericRegisterPartcipants = sequelize.define('m_eGenericRegisterPartcipants', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  institution: {
    type: DataTypes.STRING,
    allowNull: false
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false
  },
  men: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  women: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  youth: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  totalNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true
});

// Foreign Key Relationship

m_eGenericRegisterPartcipants.belongsTo(m_eGenericRegister, { foreignKey: 'genericRegister_id', onDelete: 'CASCADE' });
m_eGenericRegister.hasMany(m_eGenericRegisterPartcipants, { foreignKey: 'genericRegister_id' });

module.exports = m_eGenericRegisterPartcipants;
