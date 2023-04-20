const Album = require("../models/album");
const Artist = require("../models/artist");
const Genre = require("../models/genre");
const multer = require("multer");
const path = require("path");
const fs = require("fs/promises");
const { body, validationResult } = require("express-validator");

// ----- Multer Configuration -----
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

const fileFilter = function (req, file, cb) {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    req.fileValidationError =
      "Invalid file type. Only PNG, JPG and JPEG files are allowed.";
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});
// -----------------------------

const getHome = async function (req, res, next) {
  try {
    const albumsResults = await Album.find({}, "title artist")
      .populate("artist")
      .exec();
    res.render(path.join(__dirname, "..", "views", "albums", "albumsHome"), {
      title: "Albums",
      albums: albumsResults,
    });
  } catch (err) {
    return next(err);
  }
};

const getDetails = async function (req, res, next) {
  try {
    const albumDetail = await Album.findById(req.params.id)
      .populate("artist")
      .populate("genre")
      .exec();
    res.render(path.join(__dirname, "..", "views", "albums", "albumDetail"), {
      title: albumDetail.title,
      artist: albumDetail.artist,
      cover: albumDetail.cover,
      release_year: albumDetail.release_year,
      genres: albumDetail.genre,
      url: albumDetail.url,
    });
  } catch (err) {
    return next(err);
  }
};

const getCreateAlbum = async function (req, res, next) {
  try {
    const [artists, genres] = await Promise.all([
      Artist.find({}, "name formation_year").exec(),
      Genre.find().exec(),
    ]);

    res.render(path.join(__dirname, "..", "views", "albums", "albumForm"), {
      title: "Create an album",
      album: false,
      errors: false,
      artists,
      genres,
      edit: false
    });
  } catch (err) {
    return next(err);
  }
};

const uploadCoverAlbum = upload.single("cover");

const postCreateAlbum = [
  body("title", "Title must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Title must be specific."),
  body("artist", "Artist must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Artist must be specific."),
  body("release_year", "Release year must not be empty").isISO8601().toInt(),
  body("genre", "Genre must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Genre must be specific."),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (req.fileValidationError) {
      errors.errors.push({
        value: "invalid_format",
        msg: "Invalid file type. Only PNG, JPG and JPEG files are allowed.",
        param: "photo",
        location: "file",
      });
    }
    if (!errors.isEmpty()) {
      try {
        const [artists, genres] = await Promise.all([
          Artist.find({}, "name formation_year").exec(),
          Genre.find().exec(),
        ]);

        res.render(path.join(__dirname, "..", "views", "albums", "albumForm"), {
          title: "Create an album",
          album: req.body,
          errors: errors.array(),
          artists,
          genres,
          edit: false
        });
      } catch (err) {
        return next(err);
      }
    } else {
      try {
        const checkAlbumExistence = await Album.findOne({
          title: req.body.title,
        }).exec();
        if (checkAlbumExistence) {
          res.redirect(checkAlbumExistence.url);
        } else {
          const imgData = await fs.readFile(req.file.path);
          const imgBase64 = Buffer.from(imgData).toString("base64");
          const album = new Album({
            title: req.body.title,
            artist: req.body.artist,
            cover: imgBase64,
            release_year: req.body.release_year,
            genre: req.body.genre,
          });
          await album.save();
          res.redirect(album.url);
        }
      } catch (err) {
        return next(err);
      }
    }
  },
];

const getEditAlbum = async (req, res, next) => {
  try {
    const [album, artists, genres] = await Promise.all([
      Album.findById(req.params.id).populate("artist").populate("genre").exec(),
      Artist.find({}, "name formation_year").exec(),
      Genre.find().exec(),
    ]);

    res.render(path.join(__dirname, "..", "views", "albums", "albumForm"), {
      title: "Edit album information",
      errors: false,
      album,
      artists,
      genres,
      edit: true
    });
  } catch (err) {
    return next(err);
  }
};

const postEditAlbum = [
  body("title", "Title must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Title must be specific."),
  body("artist", "Artist must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Artist must be specific."),
  body("release_year", "Release year must not be empty").isISO8601().toInt(),
  body("genre", "Genre must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Genre must be specific."),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (req.fileValidationError) {
      errors.errors.push({
        value: "invalid_format",
        msg: "Invalid file type. Only PNG, JPG and JPEG files are allowed.",
        param: "photo",
        location: "file",
      });
    }
    if (!errors.isEmpty()) {
      try {
        const [artists, genres] = await Promise.all([
          Artist.find({}, "name formation_year").exec(),
          Genre.find().exec(),
        ]);

        return res.render(
          path.join(__dirname, "..", "views", "albums", "albumForm"),
          {
            title: "Create an album",
            album: req.body,
            errors: errors.array(),
            artists,
            genres,
            edit: true
          }
        );
      } catch (err) {
        return next(err);
      }
    } else {
      try {
        const checkAlbumExistence = await Album.findOne({
          title: req.body.title,
        }).exec();
        let imgBase64;
        if (checkAlbumExistence) {
          if (req.params.id.toString() !== checkAlbumExistence._id.toString()) {
            try {
              const [artists, genres] = await Promise.all([
                Artist.find({}, "name formation_year").exec(),
                Genre.find().exec(),
              ]);
              return res.render(
                path.join(
                  __dirname,
                  "..",
                  "views",
                  "artists",
                  "artistForm.ejs"
                ),
                {
                  title: "Edit artist information",
                  artist: req.body,
                  errors: [
                    {
                      msg: "You cannot modify the information from an artist with information from another artist",
                    },
                  ],
                  artists,
                  genres,
                }
              );
            } catch (err) {
              return next(err);
            }
          }
          if (!req.file) {
            imgBase64 = checkAlbumExistence.photo;
          } else {
            const imgData = await fs.readFile(req.file.path);
            imgBase64 = Buffer.from(imgData).toString("base64");
          }
        } else {
          if (!req.file) {
            try {
              const album = await Album.findById(req.params.id).exec();
              imgBase64 = album.photo;
            } catch (err) {
              return next(err);
            }
          } else {
            const imgData = await fs.readFile(req.file.path);
            imgBase64 = Buffer.from(imgData).toString("base64");
          }
        }
        const album = new Album({
          title: req.body.title,
          artist: req.body.artist,
          cover: imgBase64,
          release_year: req.body.release_year,
          genre: req.body.genre,
          _id: req.params.id,
        });
        const albumUpdated = await Album.findByIdAndUpdate(
          req.params.id,
          album,
          { new: true }
        );
        return res.redirect(albumUpdated.url);
      } catch (err) {
        return next(err);
      }
    }
  },
];

const deleteAlbum = async(req, res, next) => {
  try {
    await Album.findByIdAndDelete(req.params.id); 
    res.redirect('/albums'); 
  } catch (err) {
    return next(err); 
  }
}

module.exports = {
  getHome,
  getDetails,
  getCreateAlbum,
  uploadCoverAlbum,
  postCreateAlbum,
  getEditAlbum,
  postEditAlbum,
  deleteAlbum
};
