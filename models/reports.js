const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Reports = sequelize.define('reports', {
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    eventId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
    },
},
    {defaultPrimaryKey: false} 
);

module.exports = Reports;