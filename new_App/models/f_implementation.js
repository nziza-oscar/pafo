const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

    const Implementation = sequelize.define('Implementation', {
      task: {
        type: DataTypes.STRING,
        allowNull: false
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      doneBy: {
        type: DataTypes.STRING,
        allowNull: false
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      year:{
        type:DataTypes.INTEGER,
        allowNull: false
      }
    },{tableName: "Implementation",timestamps:true});
  
    
    module.exports = Implementation;