const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Project = require('./Project');
// const User = require('./User');

const f_Component = sequelize.define('f_Components', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  project_id: { type: DataTypes.INTEGER, references: { model: Project, key: 'id' } },
//   user_id: { type: DataTypes.INTEGER, references: { model: User, key: 'id' } }, // New User Association
  name: DataTypes.STRING,
  description: {type:DataTypes.TEXT,allowNull:true},
}, { tableName: 'f_components', timestamps: false });


// Component.belongsTo(User, { foreignKey: 'user_id' });
// User.hasMany(Component, { foreignKey: 'user_id' });
module.exports = f_Component;
