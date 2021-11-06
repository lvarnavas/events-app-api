const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Images = sequelize.define('images', {
    image: {
        type: Sequelize.STRING(60),
        allowNull: false,
    }
}
);

module.exports = Images;