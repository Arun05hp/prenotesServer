const { DataTypes } = require("sequelize");
const Joi = require("joi");

function model(sequelize) {
  const attributes = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    iduser: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tutorName: { type: DataTypes.STRING, allowNull: false },
    timing: { type: DataTypes.STRING, allowNull: false },
    subject: { type: DataTypes.STRING, allowNull: false },
    for: { type: DataTypes.STRING, allowNull: true },
    fees: { type: DataTypes.INTEGER, allowNull: false },
    day: { type: DataTypes.STRING, allowNull: true },
    loc: { type: DataTypes.STRING, allowNull: true },
    contact: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: false },
  };

  const options = {};

  return sequelize.define("tutor", attributes, options);
}

function validate(details) {
  const schema = Joi.object({
    iduser: Joi.number().integer().required(),
    for: Joi.string().min(2).required(),
    tutorName: Joi.string().min(2).required(),
    timing: Joi.string().min(2).required(),
    day: Joi.string().min(2).required(),
    subject: Joi.string().min(2).required(),
    contact: Joi.string(),
    loc: Joi.string().min(2).required(),
    fees: Joi.number().integer().required(),
    email: Joi.string().min(2).required(),
  });

  return schema.validate(details);
}

module.exports.tutorModal = model;
module.exports.validateTutor = validate;
