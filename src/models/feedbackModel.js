const { DataTypes } = require("sequelize");
const Joi = require("joi");

function model(sequelize) {
  const attributes = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mno: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    message: { type: DataTypes.STRING(500), allowNull: false },
  };
  const options = {};
  return sequelize.define("feedbacks", attributes, options);
}

function validateFeedback(data) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().min(5).max(100).required().email(),
    mno: Joi.string().min(10),
    message: Joi.string().required(),
  });
  return schema.validate(data);
}

module.exports.feedbackModel = model;
module.exports.validate = validateFeedback;
