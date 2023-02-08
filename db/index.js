const {User} = require('./User');
const {Pokemon} = require('./Pokemon');
const {sequelize, Sequelize} = require('./db');


Pokemon.belongsTo(User, {foreignKey: 'ownerID'});
User.hasMany(Pokemon);

module.exports = {
    Pokemon,
    User,
    sequelize,
    Sequelize
};
