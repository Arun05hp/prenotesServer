const db = require("../helpers/db");
const express = require("express");
const router = express.Router();

router.get("/contacts/:iduser", async (req, res) => {
  const id = req.params.iduser;

  try {
    const contacts = await db.Contact.findAll({
      where: {
        iduser: id,
      },
    });

    return res.json({
      message: "Success",
      contactsData: contacts,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

module.exports = router;
