const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Project = require("./Project");
// ProjectBudget Model
const ProjectBudget = sequelize.define('projectBudget', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    project_id:{
        type: DataTypes.INTEGER,
        references:{
            model: Project,
            key:'id'
        }
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  });

  module.exports = ProjectBudget;