const pokemon = [
    {
      name: "Bulbasaur",
      type1: "grass",
      description: "Seed Pokemon",
    },
    {
      name: "Ivysaur",
      type1: "grass",
      type2: "poison",
      description: "Seed Pokemon",
    },
    {
        name: "Venusaur",
        type1: "grass",
        type2: "poison",
        description: "Seed Pokemon",
    },
    {
        name: "Ivysaur",
        type1: "grass",
        description: "Seed Pokemon",
    },
    {
        name: "Charmander",
        type1: "fire",
        description: "Lizard Pokemon",
    },
    {
        name: "Charmeleon",
        type1: "fire",
        description: "Flame Pokemon",
    },
    {
        name: "Charizard",
        type1: "fire",
        type2: "flying",
        description: "Flame Pokemon",
    },
    {
        name: "Squirtle",
        type1: "water",
        description: "Tiny Turtle Pokemon",
    },
    {
        name: "Wartortle",
        type1: "water",
        description: "Turtle Pokemon",
    },
    {
        name: "Blastoise",
        type1: "water",
        description: "Shellfish Pokemon",
    },
  ];
  
const users = [
    {
      username: "oak",
      name: "Professor Oak",
      password: "oakwood",
      email: "profOak@example.com",
      isAdmin: true
    },

    {
      username: "elm",
      name: "Professor Elm",
      password: "elmtree",
      email: "profElm@example.com"
    },
    {
      username: "birch",
      name: "Professor Birch",
      password: "birchleaves",
      email: "profBirch@example.com"
    }
  ]
  
module.exports = {
    pokemon,
    users
}