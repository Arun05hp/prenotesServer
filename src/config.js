module.exports = {
  database: {
    host: "prenotesawsdb.cdxrqpyi70cl.ap-south-1.rds.amazonaws.com",
    user: process.env["DB_USER"],
    password: process.env["DB_PASSWORD"],
    database: process.env["DB_NAME"],
    port: process.env["DB_PORT"],
  },
  Key_String: process.env["KEY_STRING"],
};
