const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Comments = sequelize.define('comments', {
    content: {
        type: Sequelize.STRING,
        allowNull: false
    },
    images: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    createdAt: {
        type: Sequelize.DATEONLY,
        defaultValue: Sequelize.NOW
    }
});

module.exports = Comments;