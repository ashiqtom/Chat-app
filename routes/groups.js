const express = require('express');

const router = express.Router();

const groupController = require('../controller/group');
const authenticatemiddleware = require('../middleware/auth');

router.post('/postGroup',authenticatemiddleware.authenticate, groupController.postGroup);
router.get('/getGroup',authenticatemiddleware.authenticate,groupController.getGroup);
router.post('/addMembers',authenticatemiddleware.authenticate,groupController.addMembers);
router.get('/groupMembers/:groupName',authenticatemiddleware.authenticate,groupController.getGroupMembers)

module.exports = router;