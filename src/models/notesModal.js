const { DataTypes } = require("sequelize");
const Joi = require("joi");

function model(sequelize) {
  const attributes = {
    idnotes: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    iduser: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    topic: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false },
    fileLink: { type: DataTypes.STRING, allowNull: false },
  };

  const options = {};

  return sequelize.define("notes", attributes, options);
}

function validateNotes(fileDetails) {
  const schema = Joi.object({
    iduser: Joi.number().integer().required(),
    topic: Joi.string().min(2).required(),
    category: Joi.number().integer().required(),
    description: Joi.string().max(250).required(),
  });

  return schema.validate(fileDetails);
}

module.exports.notesModel = model;
module.exports.validate = validateNotes;
