const db = require("../helpers/db");
const express = require("express");
const requireAuth = require("../middlewares/auth");
const router = express.Router();

router.get("/msg/:id", requireAuth, async (req, res) => {
  const id = req.params.id;

  try {
    const msg = await db.Msg.findOne({
      raw: true,
      where: {
        id: id,
      },
    });

    if (!msg)
      return res.json({
        message: "Success",
        messages: { messages: [], status: null },
      });

    return res.json({
      message: "Success",
      messages: msg,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.post("/delmsg", requireAuth, async (req, res) => {
  const { id, roomId } = req.body;

  try {
    const room = await db.Msg.findByPk(roomId);
    if (!room) return res.status(400).json({ message: "not found" });

    room.messages = room.dataValues.messages.filter((msg) => msg.id !== id);
    await room.save();

    return res.json({
      message: "Success",
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.post("/block", requireAuth, async (req, res) => {
  const { id, roomId } = req.body;

  try {
    const room = await db.Msg.findByPk(roomId);
    if (!room) return res.status(400).json({ message: "not found" });

    room.status = id;
    await room.save();

    return res.json({
      message: "Success",
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.post("/unblock", requireAuth, async (req, res) => {
  const { roomId } = req.body;

  try {
    const room = await db.Msg.findByPk(roomId);
    if (!room) return res.status(400).json({ message: "not found" });

    room.status = null;
    await room.save();

    return res.json({
      message: "Success",
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
        messages: [{ id: 0, sender: id, text: text }],
      };
      await db.Msg.create(data);
    } else {
      room.messages = [
        ...room.dataValues.messages,
        { id: room.dataValues.messages.length, sender: id, text: text },
      ];
      await room.save();
    }
  } catch (error) {}
}

module.exports.messages = router;
module.exports.storeMsg = storeMessages;
