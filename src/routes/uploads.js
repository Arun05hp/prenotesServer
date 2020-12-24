const db = require("../helpers/db");
const express = require("express");
const { Op } = require("sequelize");
const { validate } = require("../models/notesModal");
const { validateBooks } = require("../models/booksModal");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./assets/pdfs");
  },
  filename: function (req, file, cb) {
    console.log(file);
    cb(null, Date.now() + "notes.pdf");
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
}).single("file");

const bookStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./assets/books");
  },
  filename: function (req, file, cb) {
    console.log(file);
    cb(null, Date.now() + "book.jpg");
  },
});

const bookUpload = multer({
  storage: bookStorage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
}).single("image");

const router = express.Router();

router.get("/searchNotes?", async (req, res) => {
  try {
    const { topic, category } = req.query;
    console.log(req.query);

    const notes = await db.Notes.findAll({
      where: {
        category: category,

        [Op.or]: [
          {
            description: {
              [Op.like]: `%${topic}%`,
            },
          },
          {
            topic: {
              [Op.like]: `%${topic}%`,
            },
          },
        ],
      },
    });

    return res.json({
      message: "Success",
      notesData: notes,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.get("/allNotes", async (req, res) => {
  try {
    const notes = await db.Notes.findAll({
      attributes: { exclude: ["iduser"] },
    });

    if (notes.length < 1) return res.status(400).json({ message: "No Data" });
    return res.json({
      message: "Success",
      notesData: notes,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.get("/allBooks", async (req, res) => {
  try {
    const books = await db.Books.findAll({
      attributes: { exclude: ["iduser"] },
    });

    if (books.length < 1) return res.status(400).json({ message: "No Data" });
    return res.json({
      message: "Success",
      booksData: books,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.get("/notes/:iduser", async (req, res) => {
  const id = req.params.iduser;
  console.log(id);
  try {
    const notes = await db.Notes.findAll({
      where: {
        iduser: id,
      },
    });

    if (notes.length < 1) return res.status(400).json({ message: "No Data" });
    return res.json({
      message: "Success",
      notesData: notes,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.get("/books/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id);
  try {
    const books = await db.Books.findAll({
      where: {
        iduser: id,
      },
    });

    if (books.length < 1) return res.status(400).json({ message: "No Data" });
    return res.json({
      message: "Success",
      booksData: books,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.post("/pdf", async (req, res) => {
  upload(req, res, async (err) => {
    const { error } = validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    if (err instanceof multer.MulterError) {
      return res.status(413).send({ error: "File Too Large" });
    } else if (err) {
      console.log("err", err);
      return res.send({ error: "Something Went Wrong" });
    }
    try {
      req.body.fileLink = req.file.path;
      let notes = await db.Notes.create(req.body);

      res.json({
        message: "Notes Uploaded Successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error });
    }
  });
});

router.post("/book", async (req, res) => {
  bookUpload(req, res, async (err) => {
    const { error } = validateBooks(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    if (err instanceof multer.MulterError) {
      return res.status(413).send({ error: "File Too Large" });
    } else if (err) {
      console.log("err", err);
      return res.send({ error: "Something Went Wrong" });
    }
    try {
      req.body.fileLink = req.file.path;
      await db.Books.create(req.body);

      res.json({
        message: "Book Uploaded Successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error });
    }
  });
});

module.exports = router;