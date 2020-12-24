const { DataTypes } = require("sequelize");
const Joi = require("joi");

function model(sequelize) {
  const attributes = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    senderId: { type: DataTypes.INTEGER, allowNull: false },
    senderName: { type: DataTypes.STRING, allowNull: false },
    receiverId: { type: DataTypes.INTEGER, allowNull: false },

    receiverStatus: { type: DataTypes.INTEGER, allowNull: false },
    forid: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    query: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    for: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.INTEGER, allowNull: false },
  };
  const options = {};
  return sequelize.define("notification", attributes, options);
}

function validateNotifi(data) {
  const schema = Joi.object({
    senderId: Joi.number().integer().required(),
    senderName: Joi.string().required(),
    receiverId: Joi.number().integer().required(),
    receiverStatus: Joi.number().integer(),
    forid: Joi.number().integer().required(),
    title: Joi.string().required(),
    query: Joi.string().allow(null),
    for: Joi.number().integer().required(),
    status: Joi.number().integer().required(),
  });
  return schema.validate(data);
}

module.exports.notifiModel = model;
module.exports.validate = validateNotifi;
