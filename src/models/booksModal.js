const { DataTypes } = require("sequelize");
const Joi = require("joi");

function model(sequelize) {
  const attributes = {
    idbook: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    iduser: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idbuyer: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bookName: { type: DataTypes.STRING, allowNull: false },
    authorName: { type: DataTypes.STRING, allowNull: false },
    publisherName: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: true },
    fileLink: { type: DataTypes.STRING, allowNull: false },
    sellerStatus: { type: DataTypes.INTEGER, allowNull: false },
    buyerStatus: { type: DataTypes.INTEGER, allowNull: true },
  };

  const options = {};

  return sequelize.define("books", attributes, options);
}

function validateBooks(details) {
  const schema = Joi.object({
    iduser: Joi.number().integer().required(),
    idbuyer: Joi.number().integer(),
    bookName: Joi.string().min(2).required(),
    authorName: Joi.string().min(2).required(),
    publisherName: Joi.string().min(2).required(),
    price: Joi.number().integer().required(),
    description: Joi.string().max(250),
    sellerStatus: Joi.number().integer().required(),
  });

  return schema.validate(details);
}

module.exports.booksModel = model;
module.exports.validateBooks = validateBooks;
