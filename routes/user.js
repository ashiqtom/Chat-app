const express = require('express');

const router = express.Router();

const userController = require('../controller/user');
const authenticatemiddleware = require('../middleware/auth');

router.post('/signup', userController.signupUser);

router.post('/login/:email/:password',userController.loginUser);

router.get('/userList',userController.getUsers)

router.post('/setloggedUser',authenticatemiddleware.authenticate,userController.setloggedUser)

router.post('/logOff',authenticatemiddleware.authenticate,userController.logOff)

router.get('/getloggedUser/:groupName',authenticatemiddleware.authenticate,userController.getloggedUser)

module.exports = router;