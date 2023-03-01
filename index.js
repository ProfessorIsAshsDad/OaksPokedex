require('dotenv').config('.env');
const cors = require("cors")
const express = require('express');
const app = express();
const { PORT = 3000 } = process.env;
const {auth, requiresAuth} = require('express-openid-connect');
const { User, Pokemon } = require('./db');

const{SECRET, BASE_URL, CLIENT_ID, ISSUER_BASE_URL} = process.env

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: SECRET,
    baseURL: BASE_URL,
    clientID: CLIENT_ID,
    issuerBaseURL: ISSUER_BASE_URL,
  };

app.use(cors()) 
app.use(auth(config));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
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

//Put

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

app.put('/addPokemon/:id',requiresAuth(),async (req, res) => {
  try {
    const pokemon = await Pokemon.findByPk(req.params.pokemonId)
  await req.user.addPokemon(pokemon)
  res.send("pokemon has been added to user")
  } catch (error) {
    console.log(error)
    next(error)
  }
} )

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
    next(error)
  }
})

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

//pages creation
app.get('/', (req, res) => {
    try{ 
        res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
    } catch (error){
        console.log(error)
        next(error)
    }
});


app.get('/login',requiresAuth(), (req, res, next) => {
  try {
    console.log(req.oidc.user)
    res.send(req.oidc.user);
  } catch (error) {
    console.log(error);
    next(error)
  }
});

app.get('/profile', requiresAuth(),async (req, res) => {
  res.send(req.user)
})
  
app.get('/allPokemon',requiresAuth(),async(req, res, next) => {
  try{
    if (req.user.isAdmin == 1){
      res.send(await Pokemon.findAll())
    }else{
      res.send("Sorry only admin has access to this route")
    }
  } catch(error){
    console.error(error)
    next(error)
  }
})

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

app.get('/pokemon', requiresAuth(), async(req, res, next) => {
  try{
    res.send(await req.user.getPokemons())
  } catch(error){
    console.error(error)
    next(error)
  }
})
  

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

app.post('/createEntry', requiresAuth(),async (req, res, next) => {
  try {
    if (req.user.isAdmin == 1){
    const newPokemon = await Pokemon.create({name: req.body.name, type1: req.body.type1, type2: req.body.type2, description: req.body.description, imgURL:req.body.imgURL})
    await req.user.addPokemon(newPokemon)
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

app.delete('/deleteEntry/:id', requiresAuth() ,async (req, res, next) => {
  try {
    if (req.user.isAdmin == 1){
      const Pokemon = await Pokemon.findByPk(req.params.id)
      console.log(Pokemon);
      await Pokemon.destroy()
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
