const db = require("../helpers/db");
const express = require("express");
const { validate } = require("../models/notificationModal");
const router = express.Router();

router.get("/notifi/:iduser", async (req, res) => {
  const id = req.params.iduser;
  console.log(id);
  try {
    const notifi = await db.Notifi.findAll({
      where: {
        receiverId: id,
      },
    });

    if (notifi.length < 1) return res.status(400).json({ message: "No Data" });
    return res.json({
      message: "Success",
      notifiData: notifi,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.post("/notifi", async (req, res) => {
  const data = req.body;
  const { error } = validate(data);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    if (
      await db.Notifi.findOne({
        where: { senderId: data.senderId, forid: data.forid },
      })
    ) {
      return res.status(400).json({ message: "Already Requested" });
    }

    await db.Notifi.create(data);

    res.json({ message: "Success" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

module.exports = router;
