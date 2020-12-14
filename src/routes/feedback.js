const db = require("../helpers/db");
const express = require("express");
const { validate } = require("../models/feedbackModel");
const router = express.Router();

router.post("/feedback", async (req, res) => {
  const data = req.body;
  const { error } = validate(data);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    await db.FeedBack.create(data);

    res.json({ message: "Feedback Submitted Successfully" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

module.exports = router;
