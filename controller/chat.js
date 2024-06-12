const Chat = require('../models/chat');
const { Op } = require('sequelize');

let io;

//// receiving io from the app.js
exports.init = (socketIoInstance) => {
    io = socketIoInstance;
};

exports.postChat = async (req, res) => {
    try {
        const { message, groupId } = req.body;
        const chatRes = await Chat.create({
            name: req.user.username,
            chat: message,
            UserId: req.user.id,
            groupId: groupId
        });
        
        // Emit the new message to all clients in the group
        io.to(groupId).emit('newMessage', groupId);

        res.status(201).json({message:"message posted"});
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to post message' });
    }
};

exports.getChat = async (req, res) => {
    try {
        const lastMessageId = req.params.lastMsgId || 0;
        const groupId = req.params.groupId;
        
        const chatRes = await Chat.findAll({
            where: {
                groupId: groupId,
                id: {
                    [Op.gt]: lastMessageId
                }
            },
            attributes: ['id', 'name', 'chat', 'groupId']
        });

        res.status(201).json(chatRes);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to get messages' });
    }
};
