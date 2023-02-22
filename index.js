//imports
require('dotenv').config('.env');
const cors = require("cors")
const express = require('express');
const app = express();
const { PORT = 3000 } = process.env;
const {auth, requiresAuth} = require('express-openid-connect');

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

  app.get('/', (req, res) => {

const options = { method: 'POST',
      url: 'https://dev-tmc3snub41cprsj2.us.auth0.com/oauth/token',
      headers: {'content-type': 'application/json'},
      body: '{"client_id":"wgfIOEpWG4ANBiHTgQ2gXztNWcxUJ8jO","client_secret":"Ua5fv9XPhbY5Ipn6LW4QHGvZq_GOoP1PUUQbmzJaI7v1WCkPJkmuB6vemSMcAAhV","audience":"https://admincheck/api","grant_type":"client_credentials"}' };

request(options, function(error, response, body){
  if (error) throw new Error(error)

  console.log(body)
})
  })


app.use(auth(config));
app.use(express.json());
app.use(express.urlencoded({extended:true}));


//Put

app.put('/pokemon/:id', async (req, res, next) => {
  const id = req.params.id;
  const updateData = req.body;

  try {
    const pokemon = await Pokemon.findByPk(id)

    if(!pokemon){
      res.status(404).json({message: 'Entry not found'});
      return
    }

    await pokemon.update(updateData)

    console.log(pokemon)
    res.send(pokemon)

  
  } catch(error){
    console.log(error)
    res.status(500).json({message: 'Error Updated Entry'})
  }

});

app.put('/:userId/pokemon/:pokemonId', async (req, res) => {
  const user = await User.findByPk(req.params.userId)
  const pokemon = await Pokemon.findByPk(req.params.pokemonId)
  await user.addPokemon(pokemon)
  res.send("pokemon has been added to user")
} )

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

app.get('/:userId', async (req, res) => {
  res.send(await User.findByPk(req.params.userId))
})

app.get('/:userId/pokemon', async (req, res) => {
  const user = await User.findByPk(req.params.userId)
  res.send(await user.getPokemons())
})
  
app.get('/pokemon', async (req, res, next) => {
    try {
      const pokemon = await Pokemon.findAll();
      res.send(pokemon);
    } catch (error) {
      console.error(error);
      next(error);
    }
  });

  app.post('/createEntry', requiresAuth(), async (req, res, next) => {
    try {
      const newPokemon = await Pokemon.create({name: req.body.name, type1: req.body.type1, type2: req.body.type2, description: req.body.description})
     await newPokemon.setUser(req.user.id)
      console.log(newPokemon);
      res.send(newPokemon)
    } catch (error) {
      console.log(error);
      next(error)
    }
  });
  app.delete('/deleteEntry/:id', requiresAuth() ,async (req, res, next) => {
    try {
      const newPokemon = await Pokemon.findByPk(req.params.id)
      console.log(newPokemon);
      await newPokemon.destroy()
      res.send("successfully deleted")
    } catch (error) {
      console.log(error);
      next(error)
    }
  });

  app.put('/pokemon/:id', async (req, res) => {
    const id = req.params.id;
    const updateData = req.body;
  
    try {
      const pokemon = await Pokemon.findByPk(id)
  
      if(!pokemon){
        res.status(404).json({message: 'Entry not found'});
        return
      }
  
      await pokemon.update(updateData)
  
      console.log(pokemon)
      res.send(pokemon)
    
    } catch(error){
      console.log(error)
      res.status(500).json({message: 'Error Updated Entry'})
    }
  
  });

app.get('/pokemon/:id', async(req, res, next) => {
  try{
    res.send(await Pokemon.findByPk(req.params.id))
  } catch(error){
    console.error(error)
    next(error)
  }
})


app.post('/createEntry', requiresAuth(), async (req, res, next) => {
  try {
    const newPokemon = await Pokemon.create({name: req.body.name, type1: req.body.type1, type2: req.body.type2, description: req.body.description})
   await newPokemon.setUser(req.user.id)
    console.log(newPokemon);
    res.send(newPokemon)
  } catch (error) {
    console.log(error);
    next(error)
  }
});

app.delete('/deleteEntry/:id', requiresAuth() ,async (req, res, next) => {
  
  try {
    const newPokemon = await Pokemon.findByPk(req.params.id)
    console.log(newPokemon);
    await newPokemon.destroy()
    res.send("successfully deleted")
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