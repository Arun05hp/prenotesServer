const jwt = require("jsonwebtoken");
const config = require("../config");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).send({ error: "You must be Logged in" });
  }
  const token = authorization.replace("PreNotes__20 ", "");

  jwt.verify(token, config.Key_String, async (err, payload) => {
    if (err) {
      return res.status(401).send({ error: "You must be logged in" });
    }

    next();
  });
};
