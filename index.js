//imports
require('dotenv').config('.env');
const express = require('express');
const app = express();
const { PORT = 3000 } = process.env;
const {auth, requiresAuth} = require('express-openid-connect');
const request = require('request')


const { User, Pokemon } = require('./db');


const{SECRET, BASE_URL, CLIENT_ID, ISSUER_BASE_URL, DOMAIN} = process.env

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: SECRET,
    baseURL: BASE_URL,
    clientID: CLIENT_ID,
    issuerBaseURL: ISSUER_BASE_URL,
  };



const options = { method: 'POST',
      url: 'https://dev-tmc3snub41cprsj2.us.auth0.com/oauth/token',
      headers: {'content-type': 'application/json'},
      body: '{"client_id":"wgfIOEpWG4ANBiHTgQ2gXztNWcxUJ8jO","client_secret":"Ua5fv9XPhbY5Ipn6LW4QHGvZq_GOoP1PUUQbmzJaI7v1WCkPJkmuB6vemSMcAAhV","audience":"https://admincheck/api","grant_type":"client_credentials"}' };

request(options, function(error, response, body){
  if (error) throw new Error(error)

  console.log(body)
})



app.use(auth(config));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//middleware that means the user logged in is always accessable in endpoints
app.use(async (req, res, next) => {
  if (req.oidc.user) {
    const { nickname, name, email } = req.oidc.user;
    const [user, _isCreated] = await User.findOrCreate({
      where: {
        username: nickname,
        name: name,
        email: email,
      },
    });
    req.user = user;
  }
  next();
});


//Put (things that update existing data)

//Admin requestion that edits the data of a pokemon
app.put('/pokemon/:id',requiresAuth(), async (req, res, next) => {
  try {
    if (req.user.isAdmin == 1){
      const id = req.params.id;
      const updateData = req.body;  
      const pokemon = await Pokemon.findByPk(id)
  
      if(!pokemon){
        res.status(404).json({message: 'Entry not found'});
        return
      }
  
      await pokemon.update(updateData)
  
      console.log(pokemon)
      res.send(pokemon)
    }else{
      res.send("Sorry only admin has access to this route")
    }
  } catch(error){
    console.log(error)
    res.status(500).json({message: 'Error Updating Entry'})
  }

});

//request to add a pokemon to a user
app.put('/addPokemon/:id',requiresAuth(),async (req, res) => {
  try {
    const pokemon = await Pokemon.findByPk(req.params.id)
  await req.user.addPokemon(pokemon)
  await req.user.update({numRegistered: req.user.numRegistered + 1})
  await pokemon.update({timesRegistered: pokemon.timesRegistered + 1})
  res.send("pokemon has been added to user")
  } catch (error) {
    console.log(error)
    next(error)
  }
} )

//request to remove a pokemon from a user
app.put('/removePokemon/:id',requiresAuth(),async (req, res) => {
  try {
    const pokemon = await Pokemon.findByPk(req.params.id)
    const usersPokemon = await req.user.getPokemons()
    for (let i = 0; i < usersPokemon.length; i++){
      if (usersPokemon[i].id == req.params.id){
        await req.user.removePokemon(pokemon)
        await req.user.update({numRegistered: req.user.numRegistered - 1})
  await pokemon.update({timesRegistered: pokemon.timesRegistered - 1})
        res.send("pokemon has been removed from user")
      }
    }
    res.send("id not registered to user")
  } catch (error) {
    console.log(error)
    next(error)
  }
} )


//admin request to add a pokemon to any user
app.put('/adminAddPokemon/:userId/:pokemonId',requiresAuth(),async (req, res) => {
  try {
    if (req.user.isAdmin == 1){
    const pokemon = await Pokemon.findByPk(req.params.pokemonId)
    const user = await User.findByPk(req.params.userId)
  await user.addPokemon(pokemon)
  await user.update({numRegistered: user.numRegistered + 1})
  await pokemon.update({timesRegistered: pokemon.timesRegistered + 1})
  res.send("pokemon has been added to user")
}else{
  res.send("Sorry only admin has access to this route")
}
  } catch (error) {
    console.log(error)
    next(error)
  }
} )

//admin request to remove a pokemon from any user
app.put('/adminRemovePokemon/:userId/:pokemonId',requiresAuth(),async (req, res) => {
  try {
    if (req.user.isAdmin == 1){
      const pokemon = await Pokemon.findByPk(req.params.pokemonId)
      const user = await User.findByPk(req.params.userId)
    const usersPokemon = await user.getPokemons()
    for (let i = 0; i < usersPokemon.length; i++){
      if (usersPokemon[i].id == req.params.pokemonId){
        await user.removePokemon(pokemon)
        await user.update({numRegistered: user.numRegistered - 1})
  await pokemon.update({timesRegistered: pokemon.timesRegistered - 1})
        res.send("pokemon has been removed from user")
      }
    }
    res.send("id not registered to user")
  }else{
    res.send("Sorry only admin has access to this route")
  }
  } catch (error) {
    console.log(error)
    next(error)
  }
} )
//admin request to promote another use to an admin
app.put('/promoteAdmin/:id',requiresAuth(), async (req, res, next) => {
  try{
    if (req.user.isAdmin == 1){
      const userToPromote = await User.findByPk(req.params.id)
      await userToPromote.update({isAdmin:1})
      res.send("user has been promoted")
    }else{
      res.send("Sorry only admin has access to this route")
    }
    
  }catch (error){
    console.log(error)
  }
});

//admin request to add/update a description of a pokemon
app.put('/addDescription/:id',requiresAuth(), async (req, res, next) => {
  try{
    if (req.user.isAdmin == 1){
      const pokemon = await Pokemon.findByPk(req.params.id)
      await pokemon.update({description:req.body.description})
      res.send("description updated")
    }else{
      res.send("Sorry only admin has access to this route")
    }
    
  }catch (error){
    console.log(error)
    next(error)
  }
})

//get requests

//default get from auth0 which says if someone is logged in or not
app.get('/', (req, res) => {
    try{ 
        res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
    } catch (error){
        console.log(error)
        next(error)
    }
});

//default login from auth0
app.get('/login',requiresAuth(), (req, res, next) => {
  try {
    console.log(req.oidc.user)
    res.send(req.oidc.user);
  } catch(error){
    console.log(error)
    next(error)
  }
});

//gets the profile of the person logged in
app.get('/profile', requiresAuth(),async (req, res) => {
  res.send(req.user)
});

//admin request for all entries in the pokemon database
app.get('/allPokemon',requiresAuth(),async(req, res, next) => {
  try{
    if (req.user.isAdmin == 1){
      let limit;
    if (req.query.limit){
        limit = req.query.limit
    }else{
        limit = 10
    }
    let page;
    if (req.query.page){
        page = req.query.page
    }else{
        page = 1
    }
      res.send(await Pokemon.findAll({
        limit: limit,
        offset: limit * (page-1)
    }))
    }else{
      res.send("Sorry only admin has access to this route")
    }
  } catch(error){
    console.error(error)
    next(error)
  }
})

//admin request for all entries in the user database
app.get('/allUsers',requiresAuth(),async(req, res, next) => {
  try{
    if (req.user.isAdmin == 1){
      let limit;
    if (req.query.limit){
        limit = req.query.limit
    }else{
        limit = 10
    }
    let page;
    if (req.query.page){
        page = req.query.page
    }else{
        page = 1
    }
      res.send(await User.findAll({
        limit: limit,
        offset: limit * (page-1)
    }))
    }else{
      res.send("Sorry only admin has access to this route")
    }
  } catch(error){
    console.error(error)
    next(error)
  }
})

//admin request to get a specific pokemon entry by id
app.get('/allPokemon/:id',requiresAuth(),async(req, res, next) => {
  try{
    if (req.user.isAdmin == 1){
      res.send(await Pokemon.findByPk(req.params.id))
    }else{
      res.send("Sorry only admin has access to this route")
    }
  } catch(error){
    console.error(error)
    next(error)
  }
})

//admin request to get a specific user entry by id
app.get('/allUsers/:id',requiresAuth(),async(req, res, next) => {
  try{
    if (req.user.isAdmin == 1){
      res.send(await User.findByPk(req.params.id))
    }else{
      res.send("Sorry only admin has access to this route")
    }
  } catch(error){
    console.error(error)
    next(error)
  }
})

//gets all the pokemon associated with the logged in user
app.get('/pokemon', requiresAuth(), async(req, res, next) => {
  try{
    res.send(await req.user.getPokemons())
  } catch(error){
    console.error(error)
    next(error)
  }
})
  
//gets a pokemon by its id associated with the logged in user
app.get('/pokemon/:id', requiresAuth(), async(req, res, next) => {
  try{
    const pokemon = await req.user.getPokemons()
    for (let i = 0; i < pokemon.length; i++){
      if (pokemon[i].id == req.params.id){
        res.send(pokemon[i])
      }
    }
    res.send("no valid id")
  } catch(error){
    console.error(error)
    next(error)
  }
})

//post

//admin request to add a pokemon to the database
app.post('/createEntry', requiresAuth(), async (req, res, next) => {
  try {
    if (req.user.isAdmin == 1){
    const newPokemon = await Pokemon.create({name: req.body.name, type1: req.body.type1, type2: req.body.type2, description: req.body.description, timesRegistered: req.body.description ,imgURL:req.body.imgURL})
    await req.user.addPokemon(newPokemon)
    await req.user.update({numRegistered: req.user.numRegistered + 1})
    console.log(newPokemon);
    res.send(newPokemon)
    }else{
      res.send("Sorry only admin has access to this route")
    }
  } catch (error) {
    console.log(error);
    next(error)
  }
});

//delete

//deletes a pokemon entry by id
app.delete('/deletePokemon/:id', requiresAuth() ,async (req, res, next) => {
  try {
    if (req.user.isAdmin == 1){
      const pokemon = await Pokemon.findByPk(req.params.id)
      console.log(pokemon);
      const users = await pokemon.getUsers()
      for (let i = 0; i < users.length; i++){
        await users[i].update({numRegistered: users[i].numRegistered - 1})
      }
      await pokemon.destroy()
      res.send("successfully deleted")
    }else{
      res.send("Sorry only admin has access to this route")
    }
  } catch (error) {
    console.log(error);
    next(error)
  }
});

//deletes a user entry by id
app.delete('/deleteUser/:id', requiresAuth() ,async (req, res, next) => {
  try {
    if (req.user.isAdmin == 1){
      const user = await User.findByPk(req.params.id)
      console.log(user);
      const pokemons = await user.getPokemons()
      for (let i = 0; i < pokemons.length; i++){
        await pokemons[i].update({timesRegistered: pokemons[i].timesRegistered - 1})
      }
      await user.destroy()
      res.send("successfully deleted")
    }else{
      res.send("Sorry only admin has access to this route")
    }
  } catch (error) {
    console.log(error);
    next(error)
  }
});


// error handling middleware
app.use((error, req, res, next) => {
    console.error('SERVER ERROR: ', error);
    if(res.statusCode < 400) res.status(500);
    res.send({error: error.message, name: error.name, message: error.message});
  });



app.listen(PORT, () => {
    console.log(`Pokedex is ready at http://localhost:${PORT}`);
  });
