const Chat = require('../models/chat');

exports.postChat=async (req, res) => {
    try {
        const {message,groupId}=req.body
        const chatRes=await Chat.create({name:req.user.username,chat:message,UserId:req.user.id,groupId:groupId})
        res.status(201).json(chatRes);
    } catch (err) {
        console.log(err);
    }
}

exports.getChat=async(req,res)=>{
    try{
        const lastMessageId=req.params.lastMsgId || 0;
        const groupId=req.params.groupId
        let offset=lastMessageId-10;
        if(lastMessageId<10){
            offset=0
        }
        const chatRes=await Chat.findAll({
            where:{UserId:req.user.id,groupId:groupId},
            //attributes:['id','name','chat'],
            offset:offset
        })
        res.status(201).json(chatRes);
    }catch(err){
        console.log(err);
    }
}
