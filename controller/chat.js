const Chat = require('../models/chat');

exports.postChat=async (req, res) => {
    try {
        const {message}=req.body
        const chatRes=await Chat.create({name:req.user.username,chat:message,UserId:req.user.id})
        res.status(201).json(chatRes);
    } catch (err) {
        console.log(err);
    }
}

exports.getChat=async(req,res)=>{
    try{
        const chatRes=await Chat.findAll({
            attributes:['name','chat'],
        })
        res.status(201).json(chatRes);
    }catch(err){
        console.log(err);
    }
}
