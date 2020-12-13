const config = require("../config");
const db = require("../helpers/db");
const express = require("express");
const jwt = require("jsonwebtoken");
const { auth, validate } = require("../models/userModel");
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
      config.Key_String,
      {
        expiresIn: "5d",
      }
    );
    res.json({ token, message: "Registered Successfully" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.post("/signin", async (req, res) => {
  const data = req.body;
  const { error } = auth(data);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { email, password } = data;
  try {
    const user = await db.User.findOne({
      where: { email: email },
    });
    if (!user) {
      return res.status(400).json({ message: "Email is incorrect" });
    }
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    const token = jwt.sign({ userId: user.iduser }, config.Key_String, {
      expiresIn: "5d",
    });
    res.json({ token, message: "Sign Successfully" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

module.exports = router;
