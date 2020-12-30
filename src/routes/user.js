const config = require("../config");
const db = require("../helpers/db");
const express = require("express");
const requireAuth = require("../middlewares/auth");
const jwt = require("jsonwebtoken");
const {
  auth,
  validate,
  validateProfile,
  validateEdu,
  validateChangePwd,
} = require("../models/userModel");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./assets/profiles");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + req.params.id + "userprofile.jpg");
  },
});

const upload = multer({ storage: storage }).single("photo");

const router = express.Router();

router.get("/userDetails/:id", requireAuth, async (req, res) => {
  const id = req.params.id;
  try {
    const user = await db.User.findByPk(id);
    if (!user) return res.status(400).json({ message: "User not found" });
    return res.json({
      message: "Success",
      userDetails: user,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

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
    res.json({
      message: "Registered Successfully",
      userDetails: {
        id: user.dataValues.iduser,
        name: user.dataValues.name,
        token,
      },
    });
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
    const user = await db.User.scope("withHash").findOne({
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
    res.json({
      message: "Sign Successfully",
      userDetails: { id: user.iduser, name: user.name, token },
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.post("/changepassword", requireAuth, async (req, res) => {
  const data = req.body;
  const { error } = validateChangePwd(data);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { iduser, oldPassword, newPassword } = data;
  try {
    const user = await db.User.scope("withHash").findByPk(iduser);
    if (!user) return res.status(400).json({ message: "User not found" });

    if (!(await bcrypt.compare(oldPassword, user.password))) {
      return res.status(400).json({ message: "OldPassword is incorrect" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword, salt);
    user.password = hash;
    await user.save();
    res.json({ message: "Password Changed Successfully" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.put("/updateprofile/:id", requireAuth, async (req, res) => {
  const data = req.body;
  const id = req.params.id;
  const { error } = validateProfile(data);
  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    const user = await db.User.findByPk(id);
    if (!user) return res.status(400).json({ message: "User not found" });

    const mno = data.mno && user.mno !== data.mno;
    if (mno && (await db.User.findOne({ where: { mno: data.mno } }))) {
      return res
        .status(400)
        .json({ message: "Mobile Number is already registered" });
    }
    Object.assign(user, data);
    await user.save();

    res.json({
      message: "Profile Updated Successfully",
      userId: user.dataValues.iduser,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.put("/updateEdu/:id", requireAuth, async (req, res) => {
  const data = req.body;
  const id = req.params.id;
  const { error } = validateEdu(data);
  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    const user = await db.User.findByPk(id);
    if (!user) return res.status(400).json({ message: "User not found" });

    Object.assign(user, data);
    await user.save();

    res.json({
      message: "Details Updated Successfully",
      userId: user.dataValues.iduser,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.post("/profile/:id", requireAuth, async (req, res) => {
  upload(req, res, async (err) => {
    const id = req.params.id;
    console.log("iduser", id);
    const profileImg = req.body.profileImg;
    if (err instanceof multer.MulterError) {
      return res.status(413).send({ error: "File Too Large" });
    } else if (err) {
      console.log("err", err);
      return res.send({ error: "Something Went Wrong" });
    }

    try {
      const user = await db.User.findByPk(id);
      if (!user) return res.status(400).json({ message: "User not found" });

      if (user.profileImg && user.profileImg != "null") {
        const path = `./${user.profileImg}`;
        fs.unlink(path, (err) => {
          if (err) res.send({ error: "Something Went Wrong" });
        });
      }
      user.profileImg = req.file.path;
      await user.save();
      res.json({ message: "Profile Image Updated Successfully" });
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  });
});

module.exports = router;
