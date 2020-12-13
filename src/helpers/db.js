const config = require("../config");
const mysql = require("mysql2/promise");
const { Sequelize } = require("sequelize");
const { userModel } = require("../models/userModel");
module.exports = db = {};

initialize();

async function initialize() {
  // create db if it doesn't already exist
  const { host, port, user, password, database } = config.database;
  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

  // connect to db
  const sequelize = new Sequelize(database, user, password, {
    host,
    dialect: "mysql",
  });

  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }

  // init models and add them to the exported db object
  db.User = userModel(sequelize);

  // sync all models with database
  await sequelize.sync();
}
