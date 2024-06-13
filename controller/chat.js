const Chat = require('../models/chat');
const { Op } = require('sequelize');
const AWS=require('aws-sdk');

let io;
//// receiving io from the app.js
exports.init = (socketIoInstance) => {
    io = socketIoInstance;
};

const uploadToS3=async(data,filename)=>{
    try {
        const BUCKET_NAME=process.env.s3bucketName;
        const IAM_USER_KEY= process.env.s3Accesskey;
        const IAM_USER_SECRET= process.env.s3Secretaccesskey;
        console.log(BUCKET_NAME)

        const s3bucket=new AWS.S3({
            accessKeyId:IAM_USER_KEY,
            secretAccessKey:IAM_USER_SECRET
        })
        const params={
            Bucket:BUCKET_NAME,
            Key:filename,
            Body:data,
            ACL:'public-read'
        }
        const response = await s3bucket.upload(params).promise();
        return response; 
    } catch (err) {
        console.log('Upload error', err);
        throw err;
    }
}
exports.uploadFile=async(req,res)=>{
    try{
        const { groupId } = req.body;
        const file = req.file;
        const uploadedFile = await uploadToS3(file.buffer, file.originalname);
        console.log(uploadedFile.Location)

        const chatRes = await Chat.create({
            name: req.user.username,
            chat: uploadedFile.Location,
            UserId: req.user.id,
            groupId: groupId
        });

        io.to(groupId).emit('newMessage', groupId);
        res.status(201).json({url:uploadedFile.Location,chat:chatRes});

    }catch(err){
        console.log(err);
    }
}

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
