const Sequelize=require('sequelize');
const sequelize = require('../util/database');

const User = sequelize.define('User', {
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    phoneNumber: {
        type: Sequelize.STRING,
        allowNull: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
});

module.exports = User;