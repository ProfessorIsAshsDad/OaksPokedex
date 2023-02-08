const {sequelize} = require('./db');
const {User} = require('./');
const {Pokemon} = require('./');
const {users, pokemon} = require('./seedData');

const seed = async () => {
  try {
    await sequelize.sync({ force: true }); // recreate db
    const createdUsers = await User.bulkCreate(users);
    const createdPokemon = await Pokemon.bulkCreate(pokemon);
    for(let i=0; i<createdPokemon.length; ++i){
        let pokemon = createdPokemon[i];
        const userId = createdUsers[i % 3].id;
        await pokemon.setUser(userId);
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = seed;
