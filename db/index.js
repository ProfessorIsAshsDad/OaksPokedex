const {User} = require('./User');
const {Pokemon} = require('./Pokemon');
const {sequelize, Sequelize} = require('./db');


Pokemon.belongsToMany(User, {through:'User_Pokemon'});
User.belongsToMany(Pokemon,{through:'User_Pokemon'});

module.exports = {
    Pokemon,
    User,
    sequelize,
    Sequelize
};
