const Sequelize=require('sequelize');
const sequelize = require('../util/database');

const Chat = sequelize.define('Chat', {
    name:{
        type:Sequelize.STRING,
        allowNull:false
    },
    chat: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Chat;