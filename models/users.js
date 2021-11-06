const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Users = sequelize.define('users', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING(40),
        allowNull: false
    },
    email: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING(60),
        allowNull: false
    },
    images: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    resetToken: {
        type: Sequelize.STRING(65)
    },
    resetTokenExpiration: {
        type: Sequelize.DATEONLY
    },
    createdAt: {
        type: Sequelize.DATEONLY,
        allowNull: false
    }
});

module.exports = Users;