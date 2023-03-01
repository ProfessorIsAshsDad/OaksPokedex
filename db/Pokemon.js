const {Sequelize, sequelize} = require('./db');

const Pokemon = sequelize.define('pokemon', {
  name: Sequelize.STRING,
  type1: Sequelize.STRING,
  type2: Sequelize.STRING,
  description: Sequelize.STRING,
  imgURL: Sequelize.STRING
},{timestamps: false});

module.exports = { Pokemon };