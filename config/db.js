require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false, // Disable logging SQL queries in the console
  }
);

sequelize.authenticate()
  .then(() => console.log('Database connected...'))
  .catch(err => console.error('Connection error:', err));

module.exports = sequelize;
