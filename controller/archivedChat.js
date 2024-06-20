const Chat = require('../models/chat');
const ArchivedChat = require('../models/archivedChat');
const Sequelize = require('sequelize');

exports.archiveOldChats =async () => {
    console.log('Running the cron job to archive old chats');
  
    // Define the date threshold (1 day old)
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - 1);
  
    try {
      // Find all chats older than 1 day
      const oldChats = await Chat.findAll({
        where: {
          createdAt: {
            [Sequelize.Op.lt]: dateThreshold
          }
        }
      });
  
      // Move each old chat to ArchivedChat and delete from Chat
      for (let chat of oldChats) {
        await ArchivedChat.create({
          name: chat.name,
          chat: chat.chat,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          UserId:chat.UserId,
          groupId:chat.groupId
          });
        await chat.destroy();
      }
  
      console.log('Archived old chats successfully');
    } catch (error) {
      console.error('Error archiving old chats:', error);
    }
  };