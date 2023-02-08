require('dotenv').config('.env');
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


app.use(auth(config));
app.use(express.json());
app.use(express.urlencoded({extended:true}));



// const getUser = async (req,res,next)=>{
//   try {
//     if (req.oidc.user){
//       const [user, _isCreated] = await User.findOrCreate({
//         where:{
//           username: req.oidc.user.name,
//           name: req.oidc.user.nickname,
//           email: req.oidc.user.email
//         }
//       })
//       req.user = user;
//     }
//     next()
//   } catch (error) {
//     console.log(error)
//     next(error)
//   }
// }

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