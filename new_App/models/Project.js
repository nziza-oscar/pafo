const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  type: DataTypes.STRING,
  name: DataTypes.STRING,
  startDate: DataTypes.DATE,
  endDate: DataTypes.DATE,
  duration: DataTypes.INTEGER,
  objectif: DataTypes.TEXT,
  project_manager: DataTypes.STRING,
  observation: DataTypes.TEXT,
  project_scope: DataTypes.TEXT,
  techSupport: DataTypes.TEXT,
  financialSupport: DataTypes.TEXT,
  totalBudget: DataTypes.DOUBLE,
  currency: DataTypes.STRING,
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  slugs: DataTypes.STRING,
  source_funds: DataTypes.TEXT,
  status: DataTypes.STRING,
  background: DataTypes.TEXT,
  goals: DataTypes.TEXT,
  methods: DataTypes.TEXT,
  partners: DataTypes.TEXT,
  description: DataTypes.TEXT,
  phases: DataTypes.TEXT,
  targetType: DataTypes.STRING,
  targetNumber: DataTypes.INTEGER,
  targetMember: DataTypes.INTEGER
}, {
  tableName: 'projects',
  timestamps: false
});

module.exports = Project;
