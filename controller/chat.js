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
        const lastMessageId=req.params.lastMsgId || 0;
        let offset=lastMessageId-10;
        if(lastMessageId<10){
            offset=0
        }
        const chatRes=await Chat.findAll({
            attributes:['id','name','chat'],
            offset:offset
        })
        res.status(201).json(chatRes);
    }catch(err){
        console.log(err);
    }
}
