const { DataTypes } = require("sequelize");
const Joi = require("joi");

function model(sequelize) {
  const attributes = {
    idcontact: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    iduser: { type: DataTypes.STRING, allowNull: false },
    uuid: { type: DataTypes.STRING, allowNull: false },
    contacts: {
      type: DataTypes.STRING,
      allowNull: true,
      get: function () {
        return JSON.parse(this.getDataValue("contacts"));
      },
      set: function (val) {
        return this.setDataValue("contacts", JSON.stringify(val));
      },
    },
  };
  const options = {};
  return sequelize.define("contacts", attributes, options);
}

function ValidateContact(data) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().min(5).max(100).required().email(),
    mno: Joi.string().min(10),
    message: Joi.string().required(),
  });
  return schema.validate(data);
}

module.exports.contactModel = model;
module.exports.validate = ValidateContact;
