const { DataTypes } = require("sequelize");
const Joi = require("joi");

function model(sequelize) {
  const attributes = {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    messages: { type: DataTypes.JSON, allowNull: false },
  };
  const options = {};
  return sequelize.define("messages", attributes, options);
}

module.exports.msgModel = model;
