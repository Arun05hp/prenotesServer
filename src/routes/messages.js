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

async function storeMessages(id, text, roomId) {
  try {
    const room = await db.Msg.findByPk(roomId);
    if (!room) {
      let data = {
        id: roomId,
        messages: [{ sender: id, text: text }],
      };
      await db.Msg.create(data);
    } else {
      room.messages = [...room.dataValues.messages, { sender: id, text: text }];
      await room.save();
    }
  } catch (error) {}
}

module.exports.messages = router;
module.exports.storeMsg = storeMessages;
