const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const ArchivedChat = sequelize.define('ArchivedChat', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    chat: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = ArchivedChat;
