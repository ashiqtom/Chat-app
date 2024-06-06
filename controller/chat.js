const Chat = require('../models/chat');

exports.postChat=async (req, res) => {
    try {
        const {message}=req.body
        chatRes=await Chat.create({chat:message,UserId:req.user.id})
        res.status(201).json(chatRes);
    } catch (err) {
        console.log(err);
    }
  }