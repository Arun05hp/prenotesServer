const db = require("../helpers/db");
const express = require("express");
const { Op } = require("sequelize");
const requireAuth = require("../middlewares/auth");
const { validateExam } = require("../models/examModal");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./assets/papers");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
}).array("file", 2);

const update = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
}).single("file");

const router = express.Router();

router.get("/searchexampaper?", requireAuth, async (req, res) => {
  try {
    const { string, branch } = req.query;
    console.log(req.query);

    const exampaper = await db.Exam.findAll({
      where: {
        [Op.or]: [
          {
            description: {
              [Op.like]: `%${string}%`,
            },
          },
          {
            subject: {
              [Op.like]: `%${string}%`,
            },
          },
          { branch: branch },
        ],
      },
    });

    return res.json({
      message: "Success",
      examPaperData: exampaper,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.get("/allexampaper", requireAuth, async (req, res) => {
  try {
    const exampaper = await db.Exam.findAll({
      attributes: { exclude: ["iduser"] },
    });

    return res.json({
      message: "Success",
      examPaperData: exampaper,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.get("/exampaper/:iduser", requireAuth, async (req, res) => {
  const id = req.params.iduser;
  console.log(id);
  try {
    const exam = await db.Exam.findAll({
      where: {
        iduser: id,
      },
    });

    return res.json({
      message: "Success",
      examData: exam,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.post("/exampaper", requireAuth, async (req, res) => {
  upload(req, res, async (err) => {
    const { error } = validateExam(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    if (err instanceof multer.MulterError) {
      return res.status(413).send({ error: "File Too Large" });
    } else if (err) {
      console.log("err", err);
      return res.status(404).send({ error: "Something Went Wrong" });
    }
    try {
      req.body.quefileLink = req.files[0].path;
      if (req.files.length > 1) {
        req.body.solfileLink = req.files[1].path;
      }

      await db.Exam.create(req.body);

      res.json({
        message: "Exam Paper Uploaded Successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error });
    }
  });
});

router.post("/uploadsolution/:id", requireAuth, async (req, res) => {
  update(req, res, async (err) => {
    const id = req.params.id;
    if (err instanceof multer.MulterError) {
      return res.status(413).send({ error: "File Too Large" });
    } else if (err) {
      console.log("err", err);
      return res.status(404).send({ error: "Something Went Wrong" });
    }

    try {
      const exam = await db.Exam.findByPk(id);
      if (!exam) return res.status(400).json({ message: "User not found" });

      if (exam.solfileLink && user.solfileLink != "null") {
        const path = `../../${exam.solfileLink}`;
        fs.unlink(path, (err) => {
          if (err) res.status(400).json({ message: "User not found" });
        });
      }
      exam.solfileLink = req.file.path;
      await exam.save();
      res.json({ message: "Soluttion Uploaded Successfully" });
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  });
});

router.delete("/delpaper/:id", requireAuth, async (req, res) => {
  const id = req.params.id;
  console.log(id);
  try {
    await db.Exam.destroy({
      where: {
        idexam: id,
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
