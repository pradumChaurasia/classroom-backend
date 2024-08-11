const express = require('express');
const { register, login, createPrincipal,getUsers ,updateUser} = require('../controllers/user.js');
const router = express.Router();


router.post('/register', register);

router.post('/create-principal', createPrincipal);

router.post('/login', login);

router.get('/getUsers',getUsers)

router.put('/updateUser/:id', updateUser);

module.exports = router;