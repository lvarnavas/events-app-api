const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Cities = sequelize.define(
  "cities",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    city: {
      type: Sequelize.STRING(20),
      unique: true,
      allowNull: false,
    },
    active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  { timestamps: false }
);

module.exports = Cities;
