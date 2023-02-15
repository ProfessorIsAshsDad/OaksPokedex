//imports
require('dotenv').config('.env');
const express = require('express');
const app = express();
const { PORT = 3000 } = process.env;
const {auth, requiresAuth} = require('express-openid-connect');
const auth0 = require('auth0-js')
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




//pages creation
app.get('/', (req, res) => {
    try{ 
        res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
    } catch (error){
        console.log(error)
        next(error)
    }
});

app.get('/profile', requiresAuth(), (req, res, next) => {
    try {
      console.log(req.oidc.user)
      res.send(req.oidc.user);
  
    } catch (error) {
      console.log(error);
      next(error)
    }
  });

  app.get('/admin', requiresAuth(), (req,res) =>{
    const { user } = req.oidc;
    console.log(JSON.stringify(user, null, 2))
    if (user && user[`dev-tmc3snub41cprsj2.us.auth0.com/roles`] && user[`https://admincheck/api/`].includes('Admin')){
      res.send('Protected Route')
    } else {
      res.status(403).send('Not authorised')
    }
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
   
// error handling middleware
app.use((error, req, res, next) => {
    console.error('SERVER ERROR: ', error);
    if(res.statusCode < 400) res.status(500);
    res.send({error: error.message, name: error.name, message: error.message});
  });



app.listen(PORT, () => {
    console.log(`Pokedex is ready at http://localhost:${PORT}`);
  });