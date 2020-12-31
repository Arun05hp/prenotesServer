const db = require("../helpers/db");
const express = require("express");
const { Op } = require("sequelize");
const requireAuth = require("../middlewares/auth");
const { validate } = require("../models/notesModal");
const { validateBooks } = require("../models/booksModal");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./assets/pdfs");
  },
  filename: function (req, file, cb) {
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

async function fetchUserInfo(item) {
  const userDetails = await db.User.findOne({
    raw: true,
    where: {
      iduser: item.iduser,
    },
    attributes: ["institute"],
  });

  return { ...item, ...userDetails };
}

router.get("/searchNotes?", async (req, res) => {
  try {
    const { topic, category } = req.query;
    let notes;
    if (category != 0)
      notes = await db.Notes.findAll({
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
    else
      notes = await db.Notes.findAll({
        where: {
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

router.get("/allNotes", requireAuth, async (req, res) => {
  try {
    const notes = await db.Notes.findAll({
      raw: true,
      // where: {
      //   iduser: {
      //     [Op.ne]: id,
      //   },
      // },
    });

    return res.json({
      message: "Success",
      notesData: notes,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.post("/searchBooks", requireAuth, async (req, res) => {
  try {
    const { text, id } = req.body;

    const books = await db.Books.findAll({
      raw: true,
      where: {
        iduser: {
          [Op.ne]: id,
        },
        [Op.or]: [
          {
            bookName: {
              [Op.like]: `%${text}%`,
            },
          },
          {
            authorName: {
              [Op.like]: `%${text}%`,
            },
          },
        ],
      },
    });

    const promises = books.map(async (item) => {
      return await fetchUserInfo(item);
    });

    const results = await Promise.all(promises);

    return res.json({
      message: "Success",
      booksData: results,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.get("/allBooks/:id", requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const books = await db.Books.findAll({
      raw: true,
      where: {
        iduser: {
          [Op.ne]: id,
        },
      },
    });

    const promises = books.map(async (item) => {
      return await fetchUserInfo(item);
    });

    const results = await Promise.all(promises);

    return res.json({
      message: "Success",
      booksData: results,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.get("/notes/:iduser", requireAuth, async (req, res) => {
  const id = req.params.iduser;

  try {
    const notes = await db.Notes.findAll({
      where: {
        iduser: id,
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

router.get("/books/:id", requireAuth, async (req, res) => {
  const id = req.params.id;

  try {
    const books = await db.Books.findAll({
      where: {
        iduser: id,
      },
    });

    return res.json({
      message: "Success",
      booksData: books,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.post("/pdf", requireAuth, async (req, res) => {
  upload(req, res, async (err) => {
    console.log(req.body);
    const { error } = validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    if (err instanceof multer.MulterError) {
      return res.status(413).send({ error: "File Too Large" });
    } else if (err) {
      console.log(err);
      return res.status(400).send({ error: "Something Went Wrong" });
    }
    try {
      req.body.fileLink = req.file.path;
      let notes = await db.Notes.create(req.body);

      res.json({
        message: "Notes Uploaded Successfully",
      });
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  });
});

router.post("/book", requireAuth, async (req, res) => {
  bookUpload(req, res, async (err) => {
    const { error } = validateBooks(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    if (err instanceof multer.MulterError) {
      return res.status(413).send({ error: "File Too Large" });
    } else if (err) {
      console.log(err);
      return res.status(400).send({ error: "Something Went Wrong" });
    }
    try {
      req.body.fileLink = req.file.path;
      await db.Books.create(req.body);

      res.json({
        message: "Book Uploaded Successfully",
      });
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  });
});

router.delete("/delnotes/:id", requireAuth, async (req, res) => {
  const id = req.params.id;

  try {
    await db.Notes.destroy({
      where: {
        idnotes: id,
      },
    });

    return res.json({
      message: "Success",
    });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.delete("/delbook/:id", requireAuth, async (req, res) => {
  const id = req.params.id;

  try {
    await db.Books.destroy({
      where: {
        idbook: id,
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
