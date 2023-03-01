const {sequelize} = require('./db');
const {User} = require('./');
const {Pokemon} = require('./');
const {users, pokemon} = require('./seedData');
const fetch = require("isomorphic-fetch")

const seed = async () => {
  try {
    await sequelize.sync({ force: true }); // recreate db
    const createdUsers = await User.bulkCreate(users);
    // const createdPokemon = await Pokemon.bulkCreate(pokemon);
    // for(let i=0; i<createdPokemon.length; ++i){
    //     let pokemon = createdPokemon[i];
    //     const userId = createdUsers[i % 3].id;
    //     await pokemon.setUser(userId);
    // }

    for (let i = 1; i <= 386; i++){
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`)
      let pokemonData = await response.json()

      //type2:pokemonData["types"][1]["type"]["name"]

      const pokemon = await Pokemon.create({
        name:pokemonData.name,
        type1:pokemonData["types"][0]["type"]["name"],
        imgURL:pokemonData["sprites"]["front_default"]
      })

      if (Object.keys(pokemonData["types"]).length == 2){
        await pokemon.update({type2:pokemonData["types"][1]["type"]["name"]})
      }

      if (i <= 151){
        await pokemon.addUser(createdUsers[0].id)
      }else if (i <=251){
        await pokemon.addUser(createdUsers[1].id)
      }else{
        await pokemon.addUser(createdUsers[2].id)
      }
    }




  } catch (error) {
    console.error(error);
  }
};

module.exports = seed;
