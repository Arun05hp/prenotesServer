const db = require("../helpers/db");
const express = require("express");
const requireAuth = require("../middlewares/auth");
const router = express.Router();

async function fetchUserInfo(item) {
  const userDetails = await db.User.findOne({
    raw: true,
    where: {
      iduser: item.id,
    },
    attributes: ["name", "profileImg"],
  });

  return { ...item, userDetails };
}

router.get("/contacts/:iduser", requireAuth, async (req, res) => {
  const id = req.params.iduser;

  try {
    const contact = await db.Contact.findAll({
      raw: true,
      where: {
        iduser: id,
      },
    });

    contact[0].contacts = await Promise.all(
      contact[0].contacts.map(async (item) => {
        return await fetchUserInfo(item);
      })
    );

    return res.json({
      message: "Success",
      contactsData: contact,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

module.exports = router;
