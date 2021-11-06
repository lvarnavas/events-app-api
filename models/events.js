const Sequelize = require('sequelize');

const sequelize = require('../util/database');


const Events = sequelize.define('events', {
    title: {
        type: Sequelize.STRING(50),
        allowNull: false,
    },
    address: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    lat: {
        type: Sequelize.DECIMAL(10,8),
        allowNull: false
    },
    lng: {
        type: Sequelize.DECIMAL(11,8),
        allowNull: false
    },
    startDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
    },
    endDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
    },
    startTime: {
        type: Sequelize.TIME,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING(300),
        allowNull: false,
    },
    images: {
        type: Sequelize.TEXT,
        allowNull: true,
    }
}, 
    {timestamps: false}
);

module.exports = Events;