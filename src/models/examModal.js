const { DataTypes } = require("sequelize");
const Joi = require("joi");

function model(sequelize) {
  const attributes = {
    idexam: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    iduser: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subject: { type: DataTypes.STRING, allowNull: false },
    branch: { type: DataTypes.INTEGER, allowNull: false },
    sem: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false },
    quefileLink: { type: DataTypes.STRING, allowNull: false },
    solfileLink: { type: DataTypes.STRING, allowNull: true },
  };

  const options = {};

  return sequelize.define("papers", attributes, options);
}

function validateExam(fileDetails) {
  const schema = Joi.object({
    iduser: Joi.number().integer().required(),
    subject: Joi.string().min(2).required(),
    branch: Joi.number().integer().required(),
    sem: Joi.number().integer().required(),
    description: Joi.string().max(250).required(),
  });

  return schema.validate(fileDetails);
}

module.exports.examModel = model;
module.exports.validateExam = validateExam;
