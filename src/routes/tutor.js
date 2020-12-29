const db = require("../helpers/db");
const express = require("express");
const router = express.Router();

const { validateTutor } = require("../models/tutorModal");

async function fetchUserInfo(item) {
  const userDetails = await db.User.findOne({
    raw: true,
    where: {
      iduser: item.iduser,
    },
    attributes: ["institute"],
  });

  return { ...item, ...userDetails };
}

router.get("/alltutors/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const tutors = await db.Tutor.findAll({
      raw: true,
      where: {
        iduser: {
          [Op.ne]: id,
        },
      },
    });

    const promises = tutors.map(async (item) => {
      return await fetchUserInfo(item);
    });

    const results = await Promise.all(promises);

    return res.json({
      message: "Success",
      tutorData: results,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.get("/tutor/:iduser", async (req, res) => {
  const id = req.params.iduser;

  try {
    const Tutor = await db.Tutor.findAll({
      raw: true,
      where: {
        iduser: id,
      },
    });

    return res.json({
      message: "Success",
      tutorData: Tutor,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.post("/regtutor", async (req, res) => {
  const data = req.body;
  const { error } = validateTutor(data);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    await db.Tutor.create(data);

    res.json({ message: "Submitted Successfully" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.delete("/deltutor/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await db.Tutor.destroy({
      where: {
        id: id,
      },
    });

    return res.json({
      message: "Success",
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

module.exports = router;
