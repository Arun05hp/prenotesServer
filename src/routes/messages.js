const db = require("../helpers/db");
const express = require("express");
const router = express.Router();

router.get("/msg/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const msg = await db.Msg.findAll({
      raw: true,
      where: {
        id: id,
      },
    });

    return res.json({
      message: "Success",
      messages: msg[0].messages,
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
