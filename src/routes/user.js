const config = require("../config");
const db = require("../helpers/db");
const express = require("express");
const jwt = require("jsonwebtoken");
const { validate } = require("../models/userModel");
const bcrypt = require("bcrypt");
const router = express.Router();

router.post("/signup", async (req, res) => {
  const data = req.body;
  const { error } = validate(data);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { email, password, mno } = data;
  try {
    if (await db.User.findOne({ where: { email: email } })) {
      return res.status(400).json({ message: "Email is already registered" });
    }
    if (await db.User.findOne({ where: { mno: mno } })) {
      return res
        .status(400)
        .json({ message: "Mobile Number is already registered" });
    }

    // hash password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    data.password = hash;

    // save user
    let user = await db.User.create(data);
    const token = jwt.sign(
      { userId: user.dataValues.iduser },
      config.Key_String
    );
    res.json({ token, message: "Registered Successfully" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.get("/", (req, res) => {
  res.send("Welcome");
});

module.exports = router;
