const db = require("../helpers/db");
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { validate } = require("../models/notificationModal");
const router = express.Router();

router.get("/notifi/:iduser", async (req, res) => {
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

router.post("/accept/:id", async (req, res) => {
  try {
    let owner = {};
    const id = req.params.id;
    const data = req.body;
    const notifi = await db.Notifi.findByPk(id);
    if (!notifi) return res.status(400).json({ message: "Not Found" });

    const requester = await db.Contact.findOne({
      where: { iduser: data.receiverId },
    });
    owner = await db.Contact.findOne({
      where: { iduser: data.senderId },
    });
    console.log("owner", owner);
    if (!owner) {
      let contData = [
        {
          iduser: data.senderId,
          uuid: uuidv4(),
          contacts: null,
        },
      ];
      console.log("contData", contData);
      owner = await db.Contact.create(contData);
      owner = owner.dataValues;
    }

    if (owner.contacts == "" || owner.contacts == null) {
      owner.contacts = [
        {
          id: requester.iduser,
          uuid: requester.uuid,
        },
      ];
    } else {
      owner.contacts = [
        ...owner.contacts,
        {
          id: requester.iduser,
          uuid: requester.uuid,
        },
      ];
    }

    await owner.save();

    if (requester.contacts == "" || requester.contacts == null) {
      requester.contacts = [
        {
          id: owner.iduser,
          uuid: owner.uuid,
        },
      ];
    } else {
      requester.requester = [
        ...requester.contacts,
        {
          id: owner.iduser,
          uuid: owner.uuid,
        },
      ];
    }
    await requester.save();
    Object.assign(notifi, data);
    await notifi.save();

    res.json({ message: "Success" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.post("/reject/:id", async (req, res) => {
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

router.delete("/clear/:id", async (req, res) => {
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
