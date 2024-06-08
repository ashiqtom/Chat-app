const express = require('express');

const router = express.Router();

const userController = require('../controller/user');

router.post('/signup', userController.signupUser);

router.post('/login/:email/:password',userController.loginUser);

router.get('/userList',userController.getUsers)

module.exports = router;