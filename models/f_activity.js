const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const f_Component = require("./f_Component");

const f_Activity = sequelize.define(
  "f_activities",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    component_id: {
      type: DataTypes.INTEGER,
      references: { model: f_Component, key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "f_activities", key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    name: DataTypes.STRING,
    description: { type: DataTypes.TEXT, allowNull: true },
  },
  { tableName: "f_activities", timestamps: false }
);

// Define self-referencing associations with unique aliases
f_Activity.hasMany(f_Activity, { as: "SubActivities", foreignKey: "parent_id", onDelete: "CASCADE", onUpdate: "CASCADE" });
f_Activity.belongsTo(f_Activity, { as: "Parent", foreignKey: "parent_id", onDelete: "CASCADE", onUpdate: "CASCADE" });

module.exports = f_Activity;
