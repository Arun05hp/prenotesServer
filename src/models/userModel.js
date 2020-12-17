const { DataTypes } = require("sequelize");
const Joi = require("joi");

function model(sequelize) {
  const attributes = {
    iduser: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    dob: { type: DataTypes.DATE, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: { type: DataTypes.STRING, allowNull: false },
    gender: { type: DataTypes.STRING, allowNull: false },
    mno: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    profileImg: { type: DataTypes.STRING, allowNull: true },
    institute: { type: DataTypes.INTEGER, allowNull: false },
    branch: { type: DataTypes.INTEGER, allowNull: false },
    sem: { type: DataTypes.INTEGER, allowNull: false },
    batchStart: { type: DataTypes.DATE, allowNull: false },
    batchEnd: { type: DataTypes.DATE, allowNull: false },
    regno: { type: DataTypes.STRING, allowNull: false },
    hosteler: { type: DataTypes.INTEGER, allowNull: false },
    hostelAddress: { type: DataTypes.STRING, allowNull: true },
  };

  const options = {
    defaultScope: {
      // exclude hash by default
      attributes: { exclude: ["password"] },
    },
    scopes: {
      // include hash with this scope
      withHash: { attributes: {} },
    },
  };

  return sequelize.define("users", attributes, options);
}

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    dob: Joi.date().required(),
    email: Joi.string().min(5).max(100).required().email(),
    password: Joi.string().min(4).max(255).required(),
    gender: Joi.string().required(),
    mno: Joi.string().min(10).required(),
    institute: Joi.number().integer().required(),
    branch: Joi.number().integer().required(),
    sem: Joi.number().integer().required(),
    batchStart: Joi.date().required(),
    batchEnd: Joi.date().required(),
    regno: Joi.string().min(2).max(50).required(),
    hosteler: Joi.number().integer().required(),
  });

  return schema.validate(user);
}

function validateProfile(data) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    dob: Joi.date().required(),
    email: Joi.string().min(5).max(100).required().email(),
    gender: Joi.string().required(),
    mno: Joi.string().min(10).required(),
  });

  return schema.validate(data);
}

function validateEdu(data) {
  const schema = Joi.object({
    institute: Joi.number().integer().required(),
    branch: Joi.number().integer().required(),
    sem: Joi.number().integer().required(),
    batchStart: Joi.date().required(),
    batchEnd: Joi.date().required(),
    regno: Joi.string().min(2).max(50).required(),
    hosteler: Joi.number().integer().required(),
  });

  return schema.validate(data);
}

function validateChangePwd(data) {
  const schema = Joi.object({
    iduser: Joi.number().required(),
    oldPassword: Joi.string().min(4).max(255).required(),
    newPassword: Joi.string().min(4).max(255).required(),
  });

  return schema.validate(data);
}

function auth(user) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(100).required().email(),
    password: Joi.string().min(4).max(255).required(),
  });

  return schema.validate(user);
}

module.exports.userModel = model;
module.exports.validate = validateUser;
module.exports.validateProfile = validateProfile;
module.exports.validateEdu = validateEdu;
module.exports.validateChangePwd = validateChangePwd;
module.exports.auth = auth;
