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

router.get("/allNotes", async (req, res) => {
  try {
    const notes = await db.Notes.findAll({
      raw: true,
      // where: {
      //   iduser: {
      //     [Op.ne]: id,
      //   },
      // },
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

router.post("/searchBooks", async (req, res) => {
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

router.get("/allBooks/:id", async (req, res) => {
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

router.delete("/delnotes/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id);
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

router.delete("/delbook/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id);
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
