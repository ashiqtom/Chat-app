const express = require('express');

const router = express.Router();

const userController = require('../controller/user');
const authenticatemiddleware = require('../middleware/auth');

router.post('/signup', userController.signupUser);

router.post('/login/:email/:password',userController.loginUser);

router.get('/getloggedUser/:groupName',authenticatemiddleware.authenticate,userController.getloggedUser)

module.exports = router;