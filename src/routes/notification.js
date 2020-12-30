const db = require("../helpers/db");
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { validate } = require("../models/notificationModal");
const requireAuth = require("../middlewares/auth");
const router = express.Router();

router.get("/notifi/:iduser", requireAuth, async (req, res) => {
  const id = req.params.iduser;

  try {
    const notifi = await db.Notifi.findAll({
      where: {
        receiverId: id,
      },
    });

    return res.json({
      message: "Success",
      notifiData: notifi,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.post("/notifi", requireAuth, async (req, res) => {
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

    if (
      !(await db.Contact.findOne({
        where: { iduser: data.senderId },
      }))
    ) {
      let contData = {
        iduser: data.senderId,
        uuid: uuidv4(),
        contacts: null,
      };
      await db.Contact.create(contData);
    }

    await db.Notifi.create(data);

    res.json({ message: "Success" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.post("/accept/:id", requireAuth, async (req, res) => {
  let owner = {};
  let requester = {};
  let roomId = uuidv4();
  try {
    const id = req.params.id;
    const data = req.body;
    const notifi = await db.Notifi.findByPk(id);
    if (!notifi) return res.status(400).json({ message: "Not Found" });

    requester = await db.Contact.findOne({
      where: { iduser: data.receiverId },
    });

    owner = await db.Contact.findOne({
      where: { iduser: data.senderId },
    });

    if (!owner) {
      let contData = {
        iduser: data.senderId,
        uuid: uuidv4(),
        contacts: null,
      };
      owner = await db.Contact.create(contData);
    }

    if (owner.dataValues.contacts == "" || owner.dataValues.contacts == null) {
      owner.contacts = [
        {
          id: requester.dataValues.iduser,
          uuid: requester.dataValues.uuid,
          roomId: roomId,
        },
      ];
    } else {
      if (
        owner.dataValues.contacts.filter(
          (item) => item.id === requester.dataValues.iduser
        ).length < 1
      ) {
        owner.contacts = [
          ...owner.dataValues.contacts,
          {
            id: requester.dataValues.iduser,
            uuid: requester.dataValues.uuid,
            roomId: roomId,
          },
        ];
      }
    }

    await owner.save();

    if (
      requester.dataValues.contacts == "" ||
      requester.dataValues.contacts == null
    ) {
      requester.contacts = [
        {
          id: owner.dataValues.iduser,
          uuid: owner.dataValues.uuid,
          roomId: roomId,
        },
      ];
    } else {
      if (
        requester.dataValues.contacts.filter(
          (item) => item.id === owner.dataValues.iduser
        ).length < 1
      ) {
        requester.contacts = [
          ...requester.dataValues.contacts,
          {
            id: owner.dataValues.iduser,
            uuid: owner.dataValues.uuid,
            roomId: roomId,
          },
        ];
      }
    }
    await requester.save();
    Object.assign(notifi, data);
    await notifi.save();

    res.json({ message: "Success" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.post("/reject/:id", requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const notifi = await db.Notifi.findByPk(id);
    if (!notifi) return res.status(400).json({ message: "Not Found" });

    Object.assign(notifi, data);
    await notifi.save();

    res.json({ message: "Success" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.delete("/clear/:id", requireAuth, async (req, res) => {
  try {
    const id = req.params.id;

    const notifi = await db.Notifi.destroy({
      where: {
        id: id,
      },
    });

    res.json({ message: "Success" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

module.exports = router;
