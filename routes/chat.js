const express = require('express');

const router = express.Router();

const chatController = require('../controller/chat');
const authenticatemiddleware = require('../middleware/auth');

router.post('/postChat',authenticatemiddleware.authenticate, chatController.postChat);

module.exports = router;