const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const fComponent = require('./f_Component');
const fActivity = require('./f_Activity');

const BudgetPlanning = sequelize.define('BudgetPlanning', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  component_id: { 
    type: DataTypes.INTEGER, 
    references: { model: fComponent, key: 'id' },
    onDelete: 'CASCADE'
  },
  activity_id: { 
    type: DataTypes.INTEGER, 
    references: { model: fActivity, key: 'id' },
    onDelete: 'CASCADE'
  },
  amount_planned: { type: DataTypes.FLOAT, allowNull: false },
  amount_used: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  comment: { type: DataTypes.TEXT, allowNull: true },
  year: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'budget_planning', timestamps: false });

// Associations


module.exports = BudgetPlanning;
